import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/app/lib/supabase/service';
import { getOrCreateSupabaseUser } from '@/app/lib/users/getOrCreateSupabaseUser';
import type { VoiceSessionInsert } from '@/app/lib/supabase/types';

/**
 * POST /api/sessions
 * Create a new voice session
 * 
 * Body: { projectId: string, suiteId: string }
 * Returns: { session: VoiceSessionRow }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get or create Supabase user
    const supabase = createServiceClient();
    const supabaseUser = await getOrCreateSupabaseUser(supabase, clerkUserId);
    
    if (!supabaseUser) {
      return NextResponse.json(
        { error: 'Failed to get user profile' },
        { status: 500 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { projectId, suiteId } = body;

    if (!projectId || !suiteId) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId and suiteId' },
        { status: 400 }
      );
    }

    // 4. Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', supabaseUser.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 403 }
      );
    }

    // 5. Create new working session (is_saved = false)
    // Note: We allow one working session per project to persist and resume
    const sessionData: VoiceSessionInsert = {
      user_id: supabaseUser.id,
      project_id: projectId,
      suite_id: suiteId,
      is_active: true,
      is_saved: false, // Working session (not saved to history)
      title: null, // Working sessions don't have titles
      metadata: {},
    };

    const { data: session, error: sessionError } = await (supabase
      .from('voice_sessions') as any)
      .insert(sessionData)
      .select()
      .single();

    if (sessionError || !session) {
      console.error('Failed to create session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    console.log('✅ Created voice session:', session.id, 'for project:', projectId);

    return NextResponse.json(
      { session },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in POST /api/sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sessions?projectId=X&limit=10&offset=0
 * List voice sessions for a project
 * 
 * Returns: { sessions: VoiceSessionRow[] }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get or create Supabase user
    const supabase = createServiceClient();
    const supabaseUser = await getOrCreateSupabaseUser(supabase, clerkUserId);
    
    if (!supabaseUser) {
      return NextResponse.json(
        { error: 'Failed to get user profile' },
        { status: 500 }
      );
    }

    // 3. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const savedParam = searchParams.get('saved'); // 'true' = saved only, 'false' = working only, null = all

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing required parameter: projectId' },
        { status: 400 }
      );
    }

    // 4. Verify user owns the project
    const { data: project, error: projectError} = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', supabaseUser.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 403 }
      );
    }

    // 5. Fetch sessions with message count (filter by is_saved if specified)
    let query = supabase
      .from('voice_sessions')
      .select(`
        *,
        transcript_items(count)
      `)
      .eq('project_id', projectId);

    // Filter by is_saved if specified
    if (savedParam === 'true') {
      query = query.eq('is_saved', true);
    } else if (savedParam === 'false') {
      query = query.eq('is_saved', false);
    }

    const { data: sessions, error: sessionsError } = await query
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (sessionsError) {
      console.error('Failed to fetch sessions:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    // 6. Transform sessions to include computed metadata
    const sessionsWithMetadata = (sessions || []).map((session: any) => {
      const messageCount = (session as any).transcript_items?.[0]?.count || 0;
      
      // Calculate duration if session has ended
      let duration: number | undefined;
      if (session.ended_at) {
        const start = new Date(session.started_at).getTime();
        const end = new Date(session.ended_at).getTime();
        duration = Math.floor((end - start) / 1000); // seconds
      }

      // Remove the nested transcript_items count object
      const { transcript_items, ...sessionData } = session as any;

      return {
        ...sessionData,
        messageCount,
        duration,
      };
    });

    console.log(`✅ Fetched ${sessionsWithMetadata.length} sessions for project:`, projectId);

    return NextResponse.json(
      { sessions: sessionsWithMetadata },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in GET /api/sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

