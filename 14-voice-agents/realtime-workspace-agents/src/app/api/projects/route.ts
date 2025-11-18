import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/app/lib/supabase/service';
import { Database } from '@/app/lib/supabase/types';
import { getOrCreateSupabaseUser } from '@/app/lib/users/getOrCreateSupabaseUser';
import { z } from 'zod';

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  suiteId: z.string(),
  description: z.string().optional(),
  tabs: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['markdown', 'csv']),
    content: z.string(),
  })).optional(),
});

// GET /api/projects - List all projects for current user
type ProjectRow = Database['public']['Tables']['projects']['Row'];
type WorkspaceTabRow = Database['public']['Tables']['workspace_tabs']['Row'];

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    
    const user = await getOrCreateSupabaseUser(supabase, userId);

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (projectsError) throw projectsError;

    // Get tabs for each project
    const projectsWithTabs = await Promise.all(
      ((projects || []) as ProjectRow[]).map(async (project) => {
        const { data: tabs } = await supabase
          .from('workspace_tabs')
          .select('*')
          .eq('project_id', project.id)
          .order('position');

        const metadata = (project.metadata as Record<string, unknown>) || {};
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          suiteId: project.suite_id,
          isArchived: project.is_archived,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          lastAccessedAt: project.last_accessed_at,
          tabs: ((tabs || []) as WorkspaceTabRow[]).map((tab) => ({
            id: tab.id,
            name: tab.name,
            type: tab.type,
            content: tab.content,
          })),
          activeBriefSectionIds: (metadata.activeBriefSectionIds as string[]) || [],
          suiteTemplatePreferences: (metadata.suiteTemplatePreferences as Record<string, 'add' | 'skip'>) || {},
        };
      })
    );

    return NextResponse.json({ projects: projectsWithTabs });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createProjectSchema.parse(body);

    const supabase = createServiceClient();
    const user = await getOrCreateSupabaseUser(supabase, userId);

    // Create project
    const projectData = {
      user_id: user.id,
      name: validated.name,
      description: validated.description || null,
      suite_id: validated.suiteId,
      is_archived: false,
    };

    const { data: project, error: projectError } = await (supabase
      .from('projects')
      .insert as any)(projectData)
      .select()
      .single();

    if (projectError) throw projectError;

    // Create tabs if provided
    if (validated.tabs && validated.tabs.length > 0) {
      const tabsData = validated.tabs.map((tab, index) => ({
        project_id: (project as ProjectRow).id,
        name: tab.name,
        type: tab.type,
        content: tab.content,
        position: index,
      }));

      await (supabase.from('workspace_tabs').insert as any)(tabsData);
    }

    return NextResponse.json({ 
      project: {
        id: (project as ProjectRow).id,
        name: (project as ProjectRow).name,
        description: (project as ProjectRow).description,
        suiteId: (project as ProjectRow).suite_id,
        isArchived: (project as ProjectRow).is_archived,
        createdAt: (project as ProjectRow).created_at,
        updatedAt: (project as ProjectRow).updated_at,
        lastAccessedAt: (project as ProjectRow).last_accessed_at,
        tabs: validated.tabs || [],
        activeBriefSectionIds: [],
      }
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


