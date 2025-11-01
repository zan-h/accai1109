import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/app/lib/supabase/service';
import { getOrCreateSupabaseUser } from '@/app/lib/users/getOrCreateSupabaseUser';
import type { VoiceSessionUpdate } from '@/app/lib/supabase/types';

/**
 * PATCH /api/sessions/[id]
 * Update a voice session (typically to mark as ended)
 * 
 * Body: { ended_at?: string, is_active?: boolean, metadata?: any }
 * Returns: { session: VoiceSessionRow }
 */
export async function PATCH(
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
    const updates: VoiceSessionUpdate = {};

    // Only allow updating specific fields
    if (body.ended_at !== undefined) {
      updates.ended_at = body.ended_at;
    }
    if (body.is_active !== undefined) {
      updates.is_active = body.is_active;
    }
    if (body.metadata !== undefined) {
      updates.metadata = body.metadata;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // 5. Verify session exists and user owns it (via project ownership)
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

    // 6. Update the session
    const { data: updatedSession, error: updateError } = await (supabase
      .from('voice_sessions') as any)
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError || !updatedSession) {
      console.error('Failed to update session:', updateError);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    console.log('✅ Updated voice session:', sessionId);

    return NextResponse.json(
      { session: updatedSession },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in PATCH /api/sessions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

