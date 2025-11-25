"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/app/components/workspace/Sidebar";
import TabContent from "@/app/components/workspace/TabContent";
import { WorkJournal } from "@/app/components/WorkJournal";
import { useWorkspaceContext, WorkspaceState } from "@/app/contexts/WorkspaceContext";
import { useProjectContext } from "@/app/contexts/ProjectContext";
import { SessionStatus } from "@/app/types";
import { useResponsive } from "./layouts/ResponsiveLayout";

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
  const { isMobile } = useResponsive();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [hoverGlow, setHoverGlow] = useState({ x: 0, y: 0 });

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
      // Default to Work Journal when no tabs exist
      if (selectedTabId !== 'work-journal') {
        setSelectedTabId('work-journal');
      }
      return;
    }

    if (!tabs.find((t) => t.id === selectedTabId) && selectedTabId !== 'work-journal') {
      setSelectedTabId(tabs[0]?.id ?? "work-journal");
    }
  }, [tabs, selectedTabId, addTab, setSelectedTabId, currentProject]);

  const selectedTab = React.useMemo(
    () => tabs.find((t) => t.id === selectedTabId),
    [tabs, selectedTabId],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div 
      className="flex-1 min-w-[400px] flex flex-col glass-panel rounded-2xl relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
    >
      {/* Mouse-follow glow effect */}
      <div 
        className="absolute w-96 h-96 pointer-events-none rounded-full opacity-20 blur-3xl transition-transform duration-300 z-0"
        style={{
          background: 'radial-gradient(circle, rgba(0,217,255,0.3) 0%, transparent 70%)',
          left: hoverGlow.x - 192,
          top: hoverGlow.y - 192,
        }}
      />

      {/* Header - compact on mobile */}
      <div className={`flex items-center justify-between sticky top-0 z-10 border-b border-white/10 bg-bg-secondary/50 ${
        isMobile ? 'px-3 py-2 text-sm' : 'px-6 py-3 text-base'
      }`}>
        <div className="flex items-center gap-2">
          {/* Hide "Project:" label on mobile to save space */}
          {!isMobile && (
            <span className="text-text-tertiary uppercase tracking-widest text-xs font-mono">Project:</span>
          )}
          <motion.button
            onClick={onOpenProjectSwitcher}
            className={`font-semibold font-mono text-accent-primary hover:text-accent-secondary transition-colors cursor-pointer focus:outline-none focus:underline ${
              isMobile ? 'text-xs' : ''
            }`}
            title="Click to switch projects (Cmd+P)"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {projectLabel}
          </motion.button>
          
          {/* Live indicator when agent connected */}
          {sessionStatus === "CONNECTED" && (
            <div className={`flex items-center gap-1.5 px-2 py-1 bg-status-success/10 border border-status-success/30 rounded ${
              isMobile ? 'gap-1 px-1.5 py-0.5' : ''
            }`}>
              <motion.span 
                className={`bg-status-success rounded-full ${
                  isMobile ? 'w-1 h-1' : 'w-1.5 h-1.5'
                }`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <span className={`text-status-success font-mono uppercase tracking-wider ${
                isMobile ? 'text-[10px]' : 'text-xs'
              }`}>Live</span>
            </div>
          )}
        </div>
        
        {/* Keyboard shortcut hint */}
        <div className="text-text-tertiary text-xs opacity-50 font-mono">
          <kbd className="px-1.5 py-0.5 border border-white/10 rounded bg-white/5 text-text-secondary">Cmd+P</kbd>
          {' '}Switch Projects
        </div>
      </div>

      {/* Content area split between sidebar + tab content */}
      <div className="flex flex-1 min-h-0 overflow-hidden z-10">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-text-tertiary text-sm font-mono opacity-70">Loading projects...</div>
          </div>
        ) : !currentProject ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <motion.div 
              className="text-center max-w-md border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-8 rounded-xl"
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
            >
              <div className="text-6xl mb-4 opacity-30">🗂️</div>
              <div className="text-text-secondary font-mono text-lg mb-2">No project selected</div>
              <p className="text-text-tertiary text-sm mb-6">
                Create or select a project before editing so your workspace changes can be saved.
              </p>
              <motion.button
                onClick={() => onOpenProjectSwitcher?.()}
                className="px-4 py-2 border border-accent-primary bg-bg-tertiary text-accent-primary hover:bg-accent-primary hover:text-bg-primary transition-all text-xs font-mono uppercase tracking-wide rounded"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Choose a project
              </motion.button>
              <div className="text-text-tertiary text-xs opacity-50 font-mono mt-4">
                Tip: Press <kbd className="px-1.5 py-0.5 border border-white/10 rounded bg-white/5">Cmd+P</kbd> to open the project switcher
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Sidebar - collapsible, narrower */}
            {!isSidebarCollapsed && (
              <div className="w-40 border-r border-white/10 overflow-y-auto flex-shrink-0 bg-bg-secondary/30" data-lenis-prevent>
                <Sidebar
                  tabs={tabs}
                  selectedTabId={selectedTabId}
                  onSelect={setSelectedTabId}
                  onRename={renameTab}
                  onDelete={deleteTab}
                  onAdd={addTab}
                />
              </div>
            )}

            {/* Content area with collapse button */}
            <div className="flex-1 overflow-auto relative bg-bg-primary/30" data-lenis-prevent>
              {/* Collapse/expand toggle button */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="absolute top-2 left-2 z-20 p-1.5 border border-white/10 bg-bg-secondary hover:bg-bg-tertiary hover:border-accent-primary transition-all text-text-tertiary hover:text-accent-primary rounded"
                title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isSidebarCollapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  )}
                </svg>
              </button>

              <div className="p-3 h-full overflow-hidden">
                <AnimatePresence mode="wait">
                  {selectedTabId === 'work-journal' ? (
                    <motion.div
                      key="work-journal"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      <WorkJournal />
                    </motion.div>
                  ) : tabs.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center h-full"
                    >
                      <div className="text-center max-w-md">
                        <div className="text-6xl mb-4 opacity-30">📂</div>
                        <div className="text-text-secondary font-mono text-lg mb-2">No tabs yet in this project</div>
                        <div className="text-text-tertiary text-sm mb-6">
                          Click <span className="text-accent-primary">&quot;+ Add Tab&quot;</span> in the sidebar to create your first workspace tab
                        </div>
                        <div className="text-text-tertiary text-xs opacity-50 font-mono">
                          Tip: Press <kbd className="px-1.5 py-0.5 border border-white/10 rounded bg-white/5">Cmd+P</kbd> to switch between projects
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={selectedTabId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      <TabContent tab={selectedTab} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default Workspace;
