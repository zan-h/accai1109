import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/app/lib/supabase/service';
import { getOrCreateSupabaseUser } from '@/app/lib/users/getOrCreateSupabaseUser';
import { transcriptItemToDbInsert, dbRowToTranscriptItem } from '@/app/lib/supabase/types';
import type { TranscriptItem } from '@/app/types';

/**
 * POST /api/sessions/[id]/transcript
 * Save transcript items to database (batch upsert)
 * 
 * Body: { items: TranscriptItem[] }
 * Returns: { count: number, message: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // 3. Get session ID from params
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    // 4. Parse request body
    const body = await request.json();
    const items: TranscriptItem[] = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty items array' },
        { status: 400 }
      );
    }

    // 5. Verify session exists and user owns it
    const { data: session, error: sessionError } = await supabase
      .from('voice_sessions')
      .select(`
        id,
        project_id,
        projects!inner(user_id)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if user owns the project
    const projectUserId = (session as any).projects.user_id;
    if (projectUserId !== supabaseUser.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // 6. Convert items to database format with sequence numbers
    // Sort by createdAtMs to ensure correct ordering
    const sortedItems = [...items].sort((a, b) => a.createdAtMs - b.createdAtMs);
    
    const dbItems = sortedItems.map((item, index) =>
      transcriptItemToDbInsert(item, sessionId, index)
    );

    // 7. Batch upsert (INSERT ... ON CONFLICT DO UPDATE)
    // This handles both new items and updates to existing items
    const { data: upsertedItems, error: upsertError } = await (supabase
      .from('transcript_items') as any)
      .upsert(dbItems, {
        onConflict: 'session_id,item_id',
        ignoreDuplicates: false, // Update existing items if they exist
      })
      .select('id');

    if (upsertError) {
      console.error('Failed to upsert transcript items:', upsertError);
      return NextResponse.json(
        { error: 'Failed to save transcript items' },
        { status: 500 }
      );
    }

    const count = upsertedItems?.length || 0;
    console.log(`✅ Saved ${count} transcript items for session:`, sessionId);

    return NextResponse.json(
      { 
        count,
        message: `Successfully saved ${count} transcript items`
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in POST /api/sessions/[id]/transcript:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sessions/[id]/transcript?limit=500&offset=0
 * Load transcript items from database
 * 
 * Returns: { items: TranscriptItem[], total: number }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // 3. Get session ID from params
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    // 4. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '500');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 5. Verify session exists and user owns it
    const { data: session, error: sessionError } = await supabase
      .from('voice_sessions')
      .select(`
        id,
        project_id,
        projects!inner(user_id)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if user owns the project
    const projectUserId = (session as any).projects.user_id;
    if (projectUserId !== supabaseUser.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // 6. Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('transcript_items')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (countError) {
      console.error('Failed to count transcript items:', countError);
    }

    // 7. Fetch transcript items ordered by sequence
    const { data: dbItems, error: itemsError } = await supabase
      .from('transcript_items')
      .select('*')
      .eq('session_id', sessionId)
      .order('sequence', { ascending: true })
      .range(offset, offset + limit - 1);

    if (itemsError) {
      console.error('Failed to fetch transcript items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to load transcript items' },
        { status: 500 }
      );
    }

    // 8. Convert database rows to frontend TranscriptItem format
    const items = (dbItems || []).map(dbRowToTranscriptItem);

    console.log(`✅ Loaded ${items.length} transcript items for session:`, sessionId);

    return NextResponse.json(
      { 
        items,
        total: totalCount || items.length,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in GET /api/sessions/[id]/transcript:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

