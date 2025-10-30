"use client";

import React from "react";
import Sidebar from "@/app/components/workspace/Sidebar";
import TabContent from "@/app/components/workspace/TabContent";
import { useWorkspaceContext, WorkspaceState } from "@/app/contexts/WorkspaceContext";
import { useProjectContext } from "@/app/contexts/ProjectContext";
import { SessionStatus } from "@/app/types";

// Container panel rendered when the workspaceBuilder scenario is active.
// Combines the Sidebar (tab list) and TabContent(renderer) components.

interface WorkspaceProps {
  sessionStatus?: SessionStatus;
  onOpenProjectSwitcher?: () => void;
}

function Workspace({ sessionStatus = "DISCONNECTED", onOpenProjectSwitcher }: WorkspaceProps) {
  const { getCurrentProject, isLoading } = useProjectContext();
  const currentProject = getCurrentProject();
  const projectLabel = currentProject?.name ?? (isLoading ? "Loading..." : "No Project Selected");
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
    if (!currentProject) return;
    if (tabs.length === 0) {
      addTab();
      return;
    }

    if (!tabs.find((t) => t.id === selectedTabId)) {
      setSelectedTabId(tabs[0]?.id ?? "");
    }
  }, [tabs, selectedTabId, addTab, setSelectedTabId, currentProject]);

  const selectedTab = React.useMemo(
    () => tabs.find((t) => t.id === selectedTabId),
    [tabs, selectedTabId],
  );

  return (
    <div className="w-full flex flex-col bg-bg-secondary border border-border-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 sticky top-0 z-10 text-base border-b border-border-primary bg-bg-secondary">
        <div className="flex items-center gap-3">
          <span className="text-text-tertiary uppercase tracking-widest text-xs font-mono">Project:</span>
          <button
            onClick={onOpenProjectSwitcher}
            className="font-semibold font-mono text-accent-primary hover:text-accent-secondary transition-colors cursor-pointer focus:outline-none focus:underline"
            title="Click to switch projects (Cmd+P)"
          >
            {projectLabel}
          </button>
          
          {/* Live indicator when agent connected */}
          {sessionStatus === "CONNECTED" && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-status-success/10 border border-status-success/30 rounded">
              <span className="w-1.5 h-1.5 bg-status-success rounded-full animate-pulse"></span>
              <span className="text-status-success text-xs font-mono uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
        
        {/* Keyboard shortcut hint */}
        <div className="text-text-tertiary text-xs opacity-50 font-mono">
          <kbd className="px-1.5 py-0.5 border border-border-primary rounded bg-bg-tertiary text-text-secondary">Cmd+P</kbd>
          {' '}Switch Projects
        </div>
      </div>

      {/* Content area split between sidebar + tab content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-text-tertiary text-sm font-mono opacity-70">Loading projects...</div>
          </div>
        ) : !currentProject ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md border border-border-primary bg-bg-primary/40 px-6 py-8">
              <div className="text-6xl mb-4 opacity-30">🗂️</div>
              <div className="text-text-secondary font-mono text-lg mb-2">No project selected</div>
              <p className="text-text-tertiary text-sm mb-6">
                Create or select a project before editing so your workspace changes can be saved.
              </p>
              <button
                onClick={() => onOpenProjectSwitcher?.()}
                className="px-4 py-2 border border-accent-primary bg-bg-tertiary text-accent-primary hover:bg-accent-primary hover:text-bg-primary transition-all text-xs font-mono uppercase tracking-wide"
              >
                Choose a project
              </button>
              <div className="text-text-tertiary text-xs opacity-50 font-mono mt-4">
                Tip: Press <kbd className="px-1.5 py-0.5 border border-border-primary rounded bg-bg-tertiary">Cmd+P</kbd> to open the project switcher
              </div>
            </div>
          </div>
        ) : (
          <>
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

            <div className="flex-1 overflow-auto p-4">
              {tabs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <div className="text-6xl mb-4 opacity-30">📂</div>
                    <div className="text-text-secondary font-mono text-lg mb-2">No tabs yet in this project</div>
                    <div className="text-text-tertiary text-sm mb-6">
                      Click <span className="text-accent-primary">&quot;+ Add Tab&quot;</span> in the sidebar to create your first workspace tab
                    </div>
                    <div className="text-text-tertiary text-xs opacity-50 font-mono">
                      Tip: Press <kbd className="px-1.5 py-0.5 border border-border-primary rounded bg-bg-tertiary">Cmd+P</kbd> to switch between projects
                    </div>
                  </div>
                </div>
              ) : (
                <TabContent tab={selectedTab} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Workspace;
