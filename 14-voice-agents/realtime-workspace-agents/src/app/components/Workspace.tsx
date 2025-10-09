"use client";

import React from "react";
import Sidebar from "@/app/components/workspace/Sidebar";
import TabContent from "@/app/components/workspace/TabContent";
import MissionBriefRail from "@/app/components/MissionBriefRail";
import { useWorkspaceContext, WorkspaceState } from "@/app/contexts/WorkspaceContext";
import { useProject } from "@/app/contexts/ProjectContext";

// Container panel rendered when the workspaceBuilder scenario is active.
// Combines the Sidebar (tab list) and TabContent(renderer) components.

function Workspace() {
  const { getCurrentProject } = useProject();
  const currentProject = getCurrentProject();
  
  // Extract data + mutators from the Zustand store.
  // Stable selectors avoid triggering the subscription effect on every render
  // (because arrow functions create a new function each time).
  const selectTabs = React.useCallback((s: WorkspaceState) => s.tabs, []);
  const selectSelectedTabId = React.useCallback((s: WorkspaceState) => s.selectedTabId, []);
  const selectAddTab = React.useCallback((s: WorkspaceState) => s.addTab, []);
  const selectRenameTab = React.useCallback((s: WorkspaceState) => s.renameTab, []);
  const selectDeleteTab = React.useCallback((s: WorkspaceState) => s.deleteTab, []);
  const selectSetSelectedTabId = React.useCallback((s: WorkspaceState) => s.setSelectedTabId, []);

  const tabs = useWorkspaceContext(selectTabs);
  const selectedTabId = useWorkspaceContext(selectSelectedTabId);

  const addTab = useWorkspaceContext(selectAddTab);
  const renameTab = useWorkspaceContext(selectRenameTab);
  const deleteTab = useWorkspaceContext(selectDeleteTab);
  const setSelectedTabId = useWorkspaceContext(selectSetSelectedTabId);

  // Ensure a default tab exists and a valid tab is always selected. Performing
  // this in a `useEffect` keeps state changes out of the render phase and
  // prevents React warnings about cascading updates between parent/child
  // components.
  React.useEffect(() => {
    if (tabs.length === 0) {
      addTab();
      return;
    }

    if (!tabs.find((t) => t.id === selectedTabId)) {
      setSelectedTabId(tabs[0]?.id ?? "");
    }
  }, [tabs, selectedTabId, addTab, setSelectedTabId]);

  const selectedTab = React.useMemo(
    () => tabs.find((t) => t.id === selectedTabId),
    [tabs, selectedTabId],
  );

  return (
    <div className="w-full flex flex-col bg-bg-secondary border border-border-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 sticky top-0 z-10 text-base border-b border-border-primary bg-bg-secondary">
        <div className="flex items-center gap-3">
          <span className="font-semibold uppercase tracking-widest">Workspace</span>
          {currentProject && (
            <>
              <span className="text-text-tertiary">›</span>
              <span className="text-accent-primary font-mono">{currentProject.name}</span>
            </>
          )}
        </div>
        <div className="text-xs text-text-tertiary font-mono">
          <span className="text-accent-primary">Cmd+P</span> projects · <span className="text-accent-primary">Cmd+B</span> brief
        </div>
      </div>

      {/* Content area with Mission Brief Rail + Workspace */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Mission Brief Rail (left) */}
        <MissionBriefRail />
        
        {/* Sidebar (tab list) */}
        <div className="w-48 border-r border-border-primary overflow-y-auto">
          <Sidebar
            tabs={tabs}
            selectedTabId={selectedTabId}
            onSelect={setSelectedTabId}
            onRename={renameTab}
            onDelete={deleteTab}
            onAdd={addTab}
          />
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto p-4">
          <TabContent tab={selectedTab} />
        </div>
      </div>
    </div>
  );
}

export default Workspace;
