import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/app/lib/supabase/service';
import { Database } from '@/app/lib/supabase/types';
import { getOrCreateSupabaseUser } from '@/app/lib/users/getOrCreateSupabaseUser';
import { z } from 'zod';

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  activeBriefSectionIds: z.array(z.string()).optional(),
  suiteTemplatePreferences: z.record(z.enum(['add', 'skip'])).optional(),
});

type ProjectRow = Database['public']['Tables']['projects']['Row'];

// PATCH /api/projects/[id] - Update project
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const validated = updateProjectSchema.parse(body);
    
    const supabase = createServiceClient();

    // Resolve the Supabase user id for the Clerk user
    const user = await getOrCreateSupabaseUser(supabase, userId);
    const supabaseUserId = user.id;

    // Verify the project belongs to the authenticated user
    const { data: project, error: projectLookupError } = await supabase
      .from('projects')
      .select('id, user_id, metadata')
      .eq('id', id)
      .single();

    if (projectLookupError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const projectRow = project as ProjectRow;
    
    if (projectRow.user_id !== supabaseUserId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Build update object
    type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
    const updates: ProjectUpdate = {};
    
    if (validated.name) updates.name = validated.name;
    if (validated.description !== undefined) updates.description = validated.description;
    
    // Update metadata fields
    if (validated.activeBriefSectionIds || validated.suiteTemplatePreferences) {
      const existingMetadata = (projectRow.metadata as Record<string, unknown> | null) ?? {};
      const updatedMetadata: Record<string, unknown> = {
        ...existingMetadata,
      };
      
      if (validated.activeBriefSectionIds) {
        updatedMetadata.activeBriefSectionIds = validated.activeBriefSectionIds;
      }
      
      if (validated.suiteTemplatePreferences) {
        updatedMetadata.suiteTemplatePreferences = validated.suiteTemplatePreferences;
      }
      
      updates.metadata = updatedMetadata as ProjectUpdate['metadata'];
    }

    // Update project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase
      .from('projects')
      .update as any)(updates)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete (archive) project
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const user = await getOrCreateSupabaseUser(supabase, userId);
    const supabaseUserId = user.id;

    const { data: project, error: projectLookupError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (projectLookupError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const projectRow2 = project as ProjectRow;
    
    if (projectRow2.user_id !== supabaseUserId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Soft delete (archive)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase
      .from('projects')
      .update as any)({ is_archived: true })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



