import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/app/lib/supabase/service';
import { getOrCreateSupabaseUser } from '@/app/lib/users/getOrCreateSupabaseUser';

/**
 * POST /api/work-journal
 * 
 * Create a new work journal entry.
 * 
 * Body:
 * {
 *   note: string (required, max 200 chars)
 *   date?: string (YYYY-MM-DD, defaults to today)
 *   timestamp?: string (ISO 8601, defaults to now)
 *   projectId?: string (UUID)
 *   durationMs?: number
 *   source: 'agent' | 'user' | 'timer' (required)
 *   metadata?: object
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const supabaseUser = await getOrCreateSupabaseUser(supabase, userId);

    // 2. Parse and validate request body
    const body = await request.json();
    const { note, date, timestamp, projectId, durationMs, source, metadata } = body;

    // Validate required fields
    if (!note || typeof note !== 'string') {
      return NextResponse.json({ error: 'Note is required' }, { status: 400 });
    }

    if (note.length > 200) {
      return NextResponse.json(
        { error: 'Note must be 200 characters or less' },
        { status: 400 }
      );
    }

    if (!source || !['agent', 'user', 'timer'].includes(source)) {
      return NextResponse.json(
        { error: 'Source must be "agent", "user", or "timer"' },
        { status: 400 }
      );
    }

    // 3. Set defaults
    const now = new Date();
    const entryDate = date || now.toISOString().split('T')[0]; // YYYY-MM-DD
    const entryTimestamp = timestamp || now.toISOString();

    // 4. Fetch project name if projectId provided
    let projectName = null;
    if (projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .eq('user_id', supabaseUser.id)
        .single();

      if (project) {
        projectName = (project as any).name;
      }
    }

    // 5. Insert entry into database
    const { data: entry, error: insertError } = await (supabase as any)
      .from('daily_work_journal')
      .insert({
        user_id: userId,
        date: entryDate,
        timestamp: entryTimestamp,
        note,
        project_id: projectId || null,
        duration_ms: durationMs || null,
        source,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert journal entry:', insertError);
      return NextResponse.json(
        { error: 'Failed to create journal entry' },
        { status: 500 }
      );
    }

    // 6. Return entry with project name
    return NextResponse.json(
      {
        entry: {
          ...entry,
          projectName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/work-journal
 * 
 * Get work journal entries for a date or date range.
 * 
 * Query params:
 * - date: YYYY-MM-DD (get entries for single day)
 * - startDate: YYYY-MM-DD (get entries for date range)
 * - endDate: YYYY-MM-DD (required if startDate provided)
 * 
 * Returns entries ordered by timestamp ASC.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 3. Validate query params
    if (startDate && !endDate) {
      return NextResponse.json(
        { error: 'endDate is required when startDate is provided' },
        { status: 400 }
      );
    }

    if (endDate && !startDate) {
      return NextResponse.json(
        { error: 'startDate is required when endDate is provided' },
        { status: 400 }
      );
    }

    // 4. Build query
    let query = supabase
      .from('daily_work_journal')
      .select(`
        *,
        projects:project_id (
          name
        )
      `)
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    // Single day query
    if (date) {
      query = query.eq('date', date);
    }
    // Date range query
    else if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    }
    // Default: today's entries
    else {
      const today = new Date().toISOString().split('T')[0];
      query = query.eq('date', today);
    }

    // 5. Execute query
    const { data: entries, error: fetchError } = await query;

    if (fetchError) {
      console.error('Failed to fetch journal entries:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch journal entries' },
        { status: 500 }
      );
    }

    // 6. Transform entries to include project names
    const entriesWithProjects = (entries || []).map((entry: any) => ({
      ...entry,
      projectName: entry.projects?.name || null,
      projects: undefined, // Remove nested object
    }));

    // 7. If date range, group by date and calculate counts
    if (startDate && endDate) {
      // Group entries by date
      const groupedByDate: Record<string, any[]> = {};
      entriesWithProjects.forEach((entry: any) => {
        const entryDate = entry.date;
        if (!groupedByDate[entryDate]) {
          groupedByDate[entryDate] = [];
        }
        groupedByDate[entryDate].push(entry);
      });

      // Calculate entry counts per day
      const entryCounts: Record<string, number> = {};
      Object.keys(groupedByDate).forEach((d) => {
        entryCounts[d] = groupedByDate[d].length;
      });

      return NextResponse.json({
        entries: entriesWithProjects,
        groupedByDate,
        entryCounts,
      });
    }

    // 8. Return entries for single day
    return NextResponse.json({
      entries: entriesWithProjects,
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
