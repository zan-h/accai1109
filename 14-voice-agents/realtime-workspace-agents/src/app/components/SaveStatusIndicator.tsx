"use client";

import { useWorkspaceContext } from "@/app/contexts/WorkspaceContext";

export default function SaveStatusIndicator() {
  const saveStatus = useWorkspaceContext(ws => ws.saveStatus);
  const saveError = useWorkspaceContext(ws => ws.saveError);
  const forceSave = useWorkspaceContext(ws => ws.forceSave);

  // Don't show anything when idle
  if (saveStatus === 'idle') {
    return null;
  }

  const getStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 border border-border-primary bg-bg-tertiary text-text-secondary text-xs font-mono">
            <div className="animate-spin h-3 w-3 border-2 border-accent-primary border-t-transparent rounded-full"></div>
            <span>SAVING...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 border border-accent-primary bg-bg-tertiary text-accent-primary text-xs font-mono shadow-glow-cyan">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span>ALL CHANGES SAVED</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-status-error bg-bg-tertiary text-status-error text-xs font-mono">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>SAVE FAILED</span>
              {saveError && <span className="text-text-tertiary">: {saveError}</span>}
            </div>
            <button
              onClick={() => forceSave()}
              className="px-3 py-1.5 border border-accent-primary bg-bg-tertiary text-accent-primary hover:bg-accent-primary hover:text-bg-primary transition-all text-xs font-mono uppercase tracking-wide"
            >
              RETRY
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      {getStatusDisplay()}
    </div>
  );
}

