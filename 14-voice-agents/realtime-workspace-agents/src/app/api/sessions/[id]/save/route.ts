import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/app/lib/supabase/service';
import { getOrCreateSupabaseUser } from '@/app/lib/users/getOrCreateSupabaseUser';
import type { VoiceSessionInsert, TranscriptItemInsert } from '@/app/lib/supabase/types';

/**
 * POST /api/sessions/[id]/save
 * Save a working session as a named snapshot in history
 * 
 * Body: { title: string, copyTranscript?: boolean }
 * Returns: { savedSession: VoiceSession }
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
    const { title, copyTranscript = true } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      );
    }

    // 5. Verify source session exists and user owns it
    const { data: sourceSession, error: sessionError } = await supabase
      .from('voice_sessions')
      .select(`
        *,
        projects!inner(id, user_id)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !sourceSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sourceSession as any;
    if (session.projects.user_id !== supabaseUser.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // 6. Create new saved session (snapshot)
    const savedSessionData: VoiceSessionInsert = {
      user_id: supabaseUser.id,
      project_id: session.project_id,
      suite_id: session.suite_id,
      started_at: session.started_at,
      ended_at: new Date().toISOString(), // Mark as ended
      is_active: false, // Saved sessions are not active
      is_saved: true, // Mark as saved
      title: title, // User-provided title
      metadata: session.metadata || {},
    };

    const { data: savedSession, error: saveError } = await (supabase
      .from('voice_sessions') as any)
      .insert(savedSessionData)
      .select()
      .single();

    if (saveError || !savedSession) {
      console.error('Failed to create saved session:', saveError);
      return NextResponse.json(
        { error: 'Failed to save session' },
        { status: 500 }
      );
    }

    // 7. Copy transcript items if requested
    if (copyTranscript) {
      const { data: transcriptItems, error: fetchError } = await supabase
        .from('transcript_items')
        .select('*')
        .eq('session_id', sessionId)
        .order('sequence', { ascending: true });

      if (fetchError) {
        console.error('Failed to fetch transcript items:', fetchError);
        // Continue anyway - session is saved, transcript copy failed
      } else if (transcriptItems && transcriptItems.length > 0) {
        // Create copies with new session_id
        const copiedItems: TranscriptItemInsert[] = transcriptItems.map((item: any) => ({
          session_id: savedSession.id,
          item_id: item.item_id,
          type: item.type,
          role: item.role,
          title: item.title,
          data: item.data,
          timestamp: item.timestamp,
          created_at_ms: item.created_at_ms,
          status: item.status,
          is_hidden: item.is_hidden,
          guardrail_result: item.guardrail_result,
          sequence: item.sequence,
        }));

        const { error: copyError } = await (supabase
          .from('transcript_items') as any)
          .insert(copiedItems);

        if (copyError) {
          console.error('Failed to copy transcript items:', copyError);
          // Continue anyway - session is saved, transcript copy failed
        } else {
          console.log(`✅ Copied ${copiedItems.length} transcript items to saved session:`, savedSession.id);
        }
      }
    }

    console.log('✅ Saved session:', savedSession.id, 'with title:', title);

    return NextResponse.json(
      { savedSession },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

