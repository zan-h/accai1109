/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/app/lib/supabase/service';
import { Database } from '@/app/lib/supabase/types';
import { getOrCreateSupabaseUser } from '@/app/lib/users/getOrCreateSupabaseUser';
import { z } from 'zod';

const updateTabsSchema = z.object({
  tabs: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['markdown', 'csv']),
    content: z.string(),
  })),
});

// PATCH /api/projects/[id]/tabs - Update project tabs
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
    const validated = updateTabsSchema.parse(body);
    
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
    
    const projectRow = project as ProjectRow;
    
    if (projectRow.user_id !== supabaseUserId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete existing tabs
    await supabase.from('workspace_tabs').delete().eq('project_id', id);

    // Insert new tabs
    if (validated.tabs.length > 0) {
      const tabsData = validated.tabs.map((tab, index) => ({
        project_id: projectRow.id,
        name: tab.name,
        type: tab.type,
        content: tab.content,
        position: index,
      }));

      const { error } = await (supabase.from('workspace_tabs').insert as any)(tabsData);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    console.error('Error updating tabs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
type ProjectRow = Database['public']['Tables']['projects']['Row'];



