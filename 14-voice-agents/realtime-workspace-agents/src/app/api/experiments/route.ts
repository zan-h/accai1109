import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/app/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      experimentType,
      results,
      sessionId,
      projectId,
      timerDurationMs,
      userAgent
    } = body;

    if (!experimentType || !results) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await (supabase
      .from('experiments')
      .insert as any)({
        user_id: userId,
        experiment_type: experimentType,
        status: 'completed',
        completed_at: new Date().toISOString(),
        session_id: sessionId || null,
        project_id: projectId || null,
        timer_duration_ms: timerDurationMs || null,
        results: results,
        user_agent: userAgent || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving experiment:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Experiment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


