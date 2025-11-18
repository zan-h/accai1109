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

    // Try to use atomic function first (requires migration 003)
    // Falls back to safer upsert pattern if function doesn't exist
    try {
      const { error: rpcError } = await (supabase as any).rpc('update_project_tabs_atomic', {
        p_project_id: id,
        p_tabs: validated.tabs,
      });

      if (rpcError) {
        // If function doesn't exist (code 42883), fall back to manual upsert
        if (rpcError.code === '42883' || rpcError.message?.includes('does not exist')) {
          console.warn('Atomic function not found, using fallback upsert pattern');
          // Fall through to fallback
        } else {
          throw rpcError;
        }
      } else {
        return NextResponse.json({ success: true });
      }
    } catch (err) {
      console.warn('RPC call failed, using fallback:', err);
      // Fall through to fallback
    }

    // FALLBACK: Safer delete-then-insert with validation
    // This should be removed after migration 003 is applied
    console.log('⚠️ Using fallback pattern for tabs update (migration 003 not applied yet)');
    
    // First, verify all tab data is valid before making any changes
    if (!validated.tabs || validated.tabs.length === 0) {
      console.log('No tabs to update');
      return NextResponse.json({ success: true });
    }

    // Delete existing tabs for this project
    const { error: deleteError } = await supabase
      .from('workspace_tabs')
      .delete()
      .eq('project_id', id);

    if (deleteError) {
      console.error('Error deleting existing tabs:', deleteError);
      throw new Error(`Failed to delete existing tabs: ${deleteError.message}`);
    }

    // Insert new tabs
    const tabsData = validated.tabs.map((tab, index) => ({
      id: tab.id,
      project_id: id,
      name: tab.name,
      type: tab.type,
      content: tab.content,
      position: index,
    }));

    const { error: insertError } = await supabase
      .from('workspace_tabs')
      .insert(tabsData as any);

    if (insertError) {
      console.error('Error inserting tabs:', insertError);
      throw new Error(`Failed to insert tabs: ${insertError.message}`);
    }

    // Update project timestamp
    await (supabase as any)
      .from('projects')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);
      
    console.log('✅ Tabs updated successfully (fallback pattern)');

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


