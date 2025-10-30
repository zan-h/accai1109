import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/app/lib/supabase/service';
import { VoicePreferences, OpenAIVoiceName } from '@/app/lib/supabase/types';

/**
 * GET /api/user/voice-preferences
 * Fetches the current user's voice preferences from users.metadata
 */
export async function GET() {
  try {
    // Authenticate user with Clerk
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to Supabase with service role
    const supabase = createServiceClient();

    // Fetch user's metadata
    const { data, error } = await supabase
      .from('users')
      .select('metadata')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user preferences' },
        { status: 500 }
      );
    }

    // Extract voice preferences from metadata
    const user = data as { metadata?: Record<string, any> } | null;
    const voicePreferences = user?.metadata?.voicePreferences as VoicePreferences | undefined;

    return NextResponse.json({
      voicePreferences: voicePreferences || null,
    });

  } catch (error) {
    console.error('Error in GET /api/user/voice-preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/voice-preferences
 * Updates the current user's voice preferences in users.metadata
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user with Clerk
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { enabled, voice } = body;

    // Validate input
    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid input: enabled must be a boolean' },
        { status: 400 }
      );
    }

    const validVoices: OpenAIVoiceName[] = [
      'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'sage', 'verse'
    ];

    if (!validVoices.includes(voice)) {
      return NextResponse.json(
        { error: `Invalid voice. Must be one of: ${validVoices.join(', ')}` },
        { status: 400 }
      );
    }

    const voicePreferences: VoicePreferences = { enabled, voice };

    // Connect to Supabase with service role
    const supabase = createServiceClient();

    // First, get the current metadata to preserve other fields
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('metadata')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (fetchError) {
      console.error('Error fetching current user:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Merge voice preferences with existing metadata
    const currentUser = data as { metadata?: Record<string, any> } | null;
    const updatedMetadata = {
      ...(currentUser?.metadata || {}),
      voicePreferences,
    };

    const updateData = {
      metadata: updatedMetadata,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await (supabase.from('users') as any).update(updateData).eq('clerk_user_id', clerkUserId);

    if (updateError) {
      console.error('Error updating voice preferences:', updateError);
      return NextResponse.json(
        { error: 'Failed to save voice preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      voicePreferences,
    });

  } catch (error) {
    console.error('Error in POST /api/user/voice-preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

