// src/app/lib/workspaceInitializer.ts

import { WorkspaceTemplate } from '@/app/agentConfigs/types';
import { useWorkspaceContext } from '@/app/contexts/WorkspaceContext';

/**
 * Initialize workspace with suite templates
 */
export async function initializeWorkspaceWithTemplates(
  templates: WorkspaceTemplate[]
): Promise<void> {
  console.log(`📝 Initializing workspace with ${templates.length} templates`);
  
  const { addTab } = useWorkspaceContext.getState();
  
  // Clear existing tabs (optional - could keep them)
  // setTabs([]);
  
  // Add each template as a tab
  for (const template of templates) {
    await addTab({
      name: template.name,
      type: template.type,
      content: template.content,
    });
    
    console.log(`  ✓ Created tab: ${template.name}`);
  }
  
  console.log('✅ Workspace initialized');
}

/**
 * Get workspace info for context injection
 */
export function getWorkspaceInfoForContext(): Record<string, any> {
  const state = useWorkspaceContext.getState();
  
  return {
    tabs: state?.tabs || [],
    selectedTabId: state?.selectedTabId || '',
    tabCount: state?.tabs?.length || 0,
  };
}



