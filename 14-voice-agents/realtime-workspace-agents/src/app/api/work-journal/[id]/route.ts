import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/app/lib/supabase/service';

/**
 * PUT /api/work-journal/[id]
 * 
 * Update an existing work journal entry.
 * 
 * Body:
 * {
 *   note?: string (max 200 chars)
 *   projectId?: string (UUID)
 *   durationMs?: number
 * }
 * 
 * Note: Cannot change date, timestamp, source, or user_id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { id } = await params;

    // 2. Verify entry exists and user owns it
    const { data: existingEntry, error: fetchError } = await supabase
      .from('daily_work_journal')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingEntry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      );
    }

    if ((existingEntry as any).user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this entry' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const { note, projectId, durationMs } = body;

    // Build updates object (only include fields that were provided)
    const updates: any = {};

    if (note !== undefined) {
      if (typeof note !== 'string' || note.length > 200) {
        return NextResponse.json(
          { error: 'Note must be a string of 200 characters or less' },
          { status: 400 }
        );
      }
      updates.note = note;
    }

    if (projectId !== undefined) {
      updates.project_id = projectId || null;
    }

    if (durationMs !== undefined) {
      if (typeof durationMs !== 'number' || durationMs < 0) {
        return NextResponse.json(
          { error: 'Duration must be a positive number' },
          { status: 400 }
        );
      }
      updates.duration_ms = durationMs;
    }

    // 4. If no updates provided, return error
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // 5. Update entry in database
    const { data: updatedEntry, error: updateError } = await (supabase as any)
      .from('daily_work_journal')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        projects:project_id (
          name
        )
      `)
      .single();

    if (updateError || !updatedEntry) {
      console.error('Failed to update journal entry:', updateError);
      return NextResponse.json(
        { error: 'Failed to update journal entry' },
        { status: 500 }
      );
    }

    // 6. Return updated entry with project name
    return NextResponse.json({
      entry: {
        ...updatedEntry,
        projectName: updatedEntry.projects?.name || null,
        projects: undefined,
      },
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/work-journal/[id]
 * 
 * Delete a work journal entry.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { id } = await params;

    // 2. Verify entry exists and user owns it
    const { data: existingEntry, error: fetchError } = await supabase
      .from('daily_work_journal')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingEntry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      );
    }

    if ((existingEntry as any).user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this entry' },
        { status: 403 }
      );
    }

    // 3. Delete entry
    const { error: deleteError } = await supabase
      .from('daily_work_journal')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete journal entry:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete journal entry' },
        { status: 500 }
      );
    }

    // 4. Return success (204 No Content)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
