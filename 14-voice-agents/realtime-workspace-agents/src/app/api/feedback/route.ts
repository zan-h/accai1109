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
      feedbackText, 
      feedbackType, 
      projectId, 
      sessionId,
      suiteId,
      pageUrl,
      userAgent 
    } = body;

    // Validate required fields
    if (!feedbackText || feedbackText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback text is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Insert feedback
    const { data, error } = await (supabase
      .from('feedback')
      .insert as any)({
        user_id: userId,
        project_id: projectId || null,
        session_id: sessionId || null,
        feedback_text: feedbackText,
        feedback_type: feedbackType || 'other',
        suite_id: suiteId || null,
        page_url: pageUrl || null,
        user_agent: userAgent || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving feedback:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save feedback';
      
      if (error.message?.includes('relation "feedback" does not exist')) {
        errorMessage = 'Database table not found. Please apply migration 008_feedback_table.sql';
      } else if (error.message) {
        errorMessage = `Database error: ${error.message}`;
      }
      
      return NextResponse.json(
        { error: errorMessage, details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

