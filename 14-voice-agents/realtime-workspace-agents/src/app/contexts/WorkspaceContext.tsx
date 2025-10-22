"use client";

// A standard React context/provider implementation for workspace state.
// Now integrated with ProjectContext for multi-project support.

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  PropsWithChildren,
  FC,
  useEffect,
  useRef,
} from "react";

import { v4 as uuidv4 } from "uuid";
import type { WorkspaceTab } from "@/app/types";
import { useProjectContext } from "@/app/contexts/ProjectContext";

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface TimerState {
  id: string;
  label: string;
  durationMs: number;
  startedAt: number;
  pausedAt: number | null;
  elapsedMs: number;
  status: 'running' | 'paused' | 'completed';
}

export interface WorkspaceState {
  // Data
  name: string;
  description: string;
  tabs: WorkspaceTab[];
  selectedTabId: string;
  saveStatus: SaveStatus;
  saveError: string | null;
  activeTimer: TimerState | null;

  // Mutators
  setName: (n: string) => void;
  setDescription: (d: string) => void;
  setTabs: (tabs: WorkspaceTab[]) => void;
  addTab: (partial?: Partial<Omit<WorkspaceTab, "id">>) => void;
  renameTab: (id: string, newName: string) => void;
  deleteTab: (id: string) => void;
  setSelectedTabId: (id: string) => void;
  
  // Timer mutators
  startTimer: (label: string, durationMs: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  getTimerStatus: () => TimerState | null;
  
  // Manual save trigger
  forceSave: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceState | undefined>(undefined);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const createTabId = (): string => {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    try {
      return globalThis.crypto.randomUUID();
    } catch (error) {
      console.warn("crypto.randomUUID failed, falling back to uuidv4()", error);
    }
  }
  return uuidv4();
};

const normalizeTabIds = (tabs: WorkspaceTab[]) => {
  const replacements = new Map<string, string>();

  const normalizedTabs = tabs.map((tab) => {
    if (typeof tab.id === "string" && UUID_REGEX.test(tab.id)) {
      return tab;
    }

    const newId = createTabId();
    replacements.set(tab.id, newId);
    return { ...tab, id: newId };
  });

  return { normalizedTabs, replacements };
};

export const WorkspaceProvider: FC<PropsWithChildren> = ({ children }) => {
  const { currentProjectId, getCurrentProject, updateProjectTabs } = useProjectContext();
  
  // -----------------------------------------------------------------------
  // Raw state values
  // -----------------------------------------------------------------------

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tabs, setTabsInternal] = useState<WorkspaceTab[]>([]);
  const [selectedTabId, setSelectedTabIdInternal] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimerState | null>(null);
  
  // Performance optimization: track last load time to prevent circular updates
  const lastLoadTimeRef = useRef<number>(0);
  
  // Track pending changes to save after grace period
  const pendingSaveRef = useRef<{ projectId: string; tabs: WorkspaceTab[] } | null>(null);
  
  // Track debounce timeout
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPersistedTabsRef = useRef<string>("[]");
  const applyTabIdReplacements = useCallback((normalizedTabs: WorkspaceTab[], replacements: Map<string, string>) => {
    setTabsInternal(() => normalizedTabs);
    setSelectedTabIdInternal((prevSelected) => {
      if (!normalizedTabs.length) return "";
      const candidate = prevSelected ? (replacements.get(prevSelected) ?? prevSelected) : normalizedTabs[0].id;
      const exists = normalizedTabs.some((tab) => tab.id === candidate);
      return exists ? candidate : normalizedTabs[0].id;
    });
  }, []);

  // Load tabs from current project when it changes
  useEffect(() => {
    if (!currentProjectId) return;
    
    const currentProject = getCurrentProject();
    if (!currentProject) return;
    
    const { normalizedTabs, replacements } = normalizeTabIds(currentProject.tabs || []);
    if (replacements.size > 0) {
      applyTabIdReplacements(normalizedTabs, replacements);
    } else {
      setTabsInternal(normalizedTabs);
      setSelectedTabIdInternal((prevSelected) => {
        if (!normalizedTabs.length) return "";
        if (normalizedTabs.some((t) => t.id === prevSelected)) return prevSelected;
        return normalizedTabs[0].id;
      });
    }
    
    // Load tabs from project
    lastPersistedTabsRef.current = JSON.stringify(normalizedTabs);
    
    // Update project name/description
    setName(currentProject.name);
    setDescription("");
    
    // Track when we loaded
    lastLoadTimeRef.current = Date.now();
    
    // Reset save status
    setSaveStatus('idle');
    setSaveError(null);
    
    console.log('📂 Loaded tabs for project:', currentProject.name, '→', currentProject.tabs.length, 'tabs');
  }, [currentProjectId, getCurrentProject, applyTabIdReplacements]);
  
  // Force save function (used by beforeunload and visibility handlers)
  const forceSave = useCallback(async () => {
    if (!currentProjectId) return;
    if (tabs.length === 0) return;
    
    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const { normalizedTabs, replacements } = normalizeTabIds(tabs);
    const tabsToPersist = replacements.size > 0 ? normalizedTabs : tabs;
    if (replacements.size > 0) {
      applyTabIdReplacements(normalizedTabs, replacements);
    }
    
    try {
      setSaveStatus('saving');
      setSaveError(null);
      await updateProjectTabs(currentProjectId, tabsToPersist);
      lastPersistedTabsRef.current = JSON.stringify(tabsToPersist);
      setSaveStatus('saved');
      console.log('✅ Force saved tabs:', tabs.length, 'tabs');
      
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSaveError(errorMessage);
      console.error('❌ Failed to save tabs:', error);
    }
  }, [currentProjectId, tabs, updateProjectTabs, applyTabIdReplacements]);

  // Save tabs back to project (debounced with improved error handling)
  useEffect(() => {
    if (!currentProjectId) return;
    if (tabs.length === 0) return;
    
    const serializedTabs = JSON.stringify(tabs);
    if (serializedTabs === lastPersistedTabsRef.current) {
      return;
    }

    const { normalizedTabs, replacements } = normalizeTabIds(tabs);
    if (replacements.size > 0) {
      applyTabIdReplacements(normalizedTabs, replacements);
      return;
    }
    
    // Grace period: don't save immediately after loading to prevent circular updates
    // But DO store pending changes to save after grace period
    const timeSinceLoad = Date.now() - lastLoadTimeRef.current;
    if (timeSinceLoad < 300) {
      console.log('⏸️  Deferring save (within grace period)');
      pendingSaveRef.current = { projectId: currentProjectId, tabs };
      
      // Schedule save for after grace period
      const remainingGracePeriod = 300 - timeSinceLoad;
      const timeout = setTimeout(() => {
        if (pendingSaveRef.current?.projectId === currentProjectId) {
          forceSave();
          pendingSaveRef.current = null;
        }
      }, remainingGracePeriod + 100); // +100ms for the debounce
      
      return () => clearTimeout(timeout);
    }
    
    // Clear any pending grace period save
    pendingSaveRef.current = null;
    
    // Debounce: wait 100ms before saving (reduced from 200ms)
    const timeout = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        setSaveError(null);
        await updateProjectTabs(currentProjectId, tabs);
        lastPersistedTabsRef.current = JSON.stringify(tabs);
        setSaveStatus('saved');
        console.log('💾 Saved tabs to project:', tabs.length, 'tabs');
        
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        setSaveStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setSaveError(errorMessage);
        console.error('❌ Failed to save tabs:', error);
      }
    }, 100);
    
    saveTimeoutRef.current = timeout;
    return () => {
      clearTimeout(timeout);
      if (saveTimeoutRef.current === timeout) {
        saveTimeoutRef.current = null;
      }
    };
  }, [tabs, currentProjectId, updateProjectTabs, forceSave, applyTabIdReplacements]);
  
  // beforeunload handler - force save on page close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!currentProjectId) return;
      if (tabs.length === 0) return;
      
      // If there are unsaved changes (status is not 'saved'), force save with keepalive
      if (saveStatus !== 'saved') {
        const data = JSON.stringify({ tabs });
        
        // Use fetch with keepalive to ensure request completes even if page closes
        fetch(`/api/projects/${currentProjectId}/tabs`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true, // Ensures request completes even if page closes
        }).catch(err => {
          console.error('Failed to save on beforeunload:', err);
        });
        
        console.log('💾 Triggered save on page unload');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentProjectId, tabs, saveStatus]);
  
  // visibilitychange handler - save when user switches browser tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User switched away from tab - trigger immediate save if there are pending changes
        if (saveStatus !== 'saved' && currentProjectId && tabs.length > 0) {
          forceSave();
          console.log('💾 Triggered save on visibility change');
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentProjectId, tabs, saveStatus, forceSave]);

  // -----------------------------------------------------------------------
  // Helper setters that also maintain invariants
  // -----------------------------------------------------------------------

  const setTabs = useCallback((newTabs: WorkspaceTab[]) => {
    const safeTabs = Array.isArray(newTabs) ? newTabs : [];
    const { normalizedTabs, replacements } = normalizeTabIds(safeTabs);
    setTabsInternal(() => {
      setSelectedTabIdInternal((prevSelected) => {
        if (!normalizedTabs.length) return "";
        const candidate = prevSelected
          ? replacements.get(prevSelected) ?? prevSelected
          : normalizedTabs[0].id;
        const exists = normalizedTabs.some((tab) => tab.id === candidate);
        return exists ? candidate : normalizedTabs[0].id;
      });
      return normalizedTabs;
    });
  }, []);

  const addTab = useCallback(
    (partial: Partial<Omit<WorkspaceTab, "id">> = {}) => {
      setTabsInternal((prev) => {
        const id = createTabId();
        const newTab: WorkspaceTab = {
          id,
          name: partial.name ?? `Tab ${prev.length + 1}`,
          type: partial.type ?? "markdown",
          content: partial.content ?? "",
        };
        // Select the new tab
        setSelectedTabIdInternal(id);
        return [...prev, newTab];
      });
    },
    [],
  );

  const renameTab = useCallback((id: string, newName: string) => {
    setTabsInternal((prev) => prev.map((t) => (t.id === id ? { ...t, name: newName } : t)));
  }, []);

  const deleteTab = useCallback((id: string) => {
    setTabsInternal((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      setSelectedTabIdInternal((sel) => {
        if (sel !== id) return sel;
        return updated[0]?.id ?? "";
      });
      return updated;
    });
  }, []);

  const setSelectedTabId = useCallback((id: string) => {
    setSelectedTabIdInternal(id);
  }, []);

  // -----------------------------------------------------------------------
  // Timer functions
  // -----------------------------------------------------------------------

  const startTimer = useCallback((label: string, durationMs: number) => {
    const newTimer: TimerState = {
      id: createTabId(),
      label,
      durationMs,
      startedAt: Date.now(),
      pausedAt: null,
      elapsedMs: 0,
      status: 'running',
    };
    setActiveTimer(newTimer);
    console.log(`⏱️  Timer started: "${label}" for ${durationMs}ms`);
  }, []);

  const pauseTimer = useCallback(() => {
    setActiveTimer((prev) => {
      if (!prev || prev.status !== 'running') return prev;
      const now = Date.now();
      const additionalElapsed = now - (prev.pausedAt || prev.startedAt);
      return {
        ...prev,
        pausedAt: now,
        elapsedMs: prev.elapsedMs + additionalElapsed,
        status: 'paused',
      };
    });
    console.log('⏸️  Timer paused');
  }, []);

  const resumeTimer = useCallback(() => {
    setActiveTimer((prev) => {
      if (!prev || prev.status !== 'paused') return prev;
      return {
        ...prev,
        startedAt: Date.now(),
        pausedAt: null,
        status: 'running',
      };
    });
    console.log('▶️  Timer resumed');
  }, []);

  const stopTimer = useCallback(() => {
    setActiveTimer(null);
    console.log('⏹️  Timer stopped');
  }, []);

  const getTimerStatus = useCallback(() => {
    return activeTimer;
  }, [activeTimer]);

  // Auto-complete timer when time is up
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = activeTimer.elapsedMs + (now - activeTimer.startedAt);
      
      if (elapsed >= activeTimer.durationMs) {
        setActiveTimer((prev) => {
          if (!prev) return prev;
          return { ...prev, status: 'completed', elapsedMs: prev.durationMs };
        });
        console.log('⏰ Timer completed!');
      }
    }, 100); // Check every 100ms for smooth updates

    return () => clearInterval(checkInterval);
  }, [activeTimer]);

  // -----------------------------------------------------------------------
  // Compose state object and update ref each render
  // -----------------------------------------------------------------------

  const value: WorkspaceState = {
    name,
    description,
    tabs,
    selectedTabId,
    saveStatus,
    saveError,
    activeTimer,
    setName,
    setDescription,
    setTabs,
    addTab,
    renameTab,
    deleteTab,
    setSelectedTabId,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getTimerStatus,
    forceSave,
  };

  // Update shared ref so `useWorkspaceContext.getState()` is always current.
  WorkspaceProviderState.current = value;

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspaceContext<T>(selector: (state: WorkspaceState) => T): T {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return selector(ctx);
}

// expose getState for imperative access (Sidebar uses it)
useWorkspaceContext.getState = (): WorkspaceState => {
  if (!WorkspaceProviderState.current) {
    throw new Error("Workspace context not yet initialised");
  }
  return WorkspaceProviderState.current;
};

const WorkspaceProviderState = { current: null as unknown as WorkspaceState };


// Resolves a tab ID from a list of tabs and lookup info (id, index, or name).
function resolveTabId(
  tabs: WorkspaceTab[],
  opts: { id?: string; index?: number; name?: string }
): string | undefined {
  const { id, index, name } = opts;
  if (typeof id === 'string' && id) {
    return id;
  }
  // Prefer name over index if both are provided
  if (typeof name === 'string') {
    const tabByName = tabs.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (tabByName) return tabByName.id;
  }
  if (typeof index === 'number' && index >= 0 && index < tabs.length) {
    return tabs[index]?.id;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Helper functions (used by WorkspaceManager agent tools)
// ---------------------------------------------------------------------------

export async function setWorkspaceInfo(input: any) {
  const { name, description } = input as { name?: string; description?: string };
  const ws = useWorkspaceContext.getState();
  if (typeof name === 'string') ws.setName(name);
  if (typeof description === 'string') ws.setDescription(description);
  return { message: 'Workspace info updated.' };
}

export async function addWorkspaceTab(input: any) {
  const { name, type, content } = input as { name?: string; type?: string; content?: string };
  const ws = useWorkspaceContext.getState();
  const newTab: WorkspaceTab = {
    id: createTabId(),
    name: typeof name === 'string' && name ? name : `Tab ${ws.tabs.length + 1}`,
    type: typeof type === 'string' && (type === 'markdown' || type === 'csv') ? type : 'markdown',
    content: typeof content === 'string' && content ? content : '',
  };
  ws.setTabs([...ws.tabs, newTab]);
  ws.setSelectedTabId(newTab.id);
  return { message: `Tab '${newTab.name}' added.` };
}

export async function renameWorkspaceTab(input: any) {
  const { id, index, current_name, new_name } = input as {
    id?: string;
    index?: number;
    current_name?: string;
    new_name?: string;
  };
  const ws = useWorkspaceContext.getState();
  if (typeof new_name !== 'string' || new_name.trim() === '') {
    return { message: 'Invalid new_name for rename.' };
  }
  const targetId = resolveTabId(ws.tabs, { id, index, name: current_name });
  if (!targetId) {
    return { message: 'Unable to locate tab for rename.' };
  }
  ws.renameTab(targetId, new_name!);
  return { message: `Tab renamed to ${new_name}.` };
}

export async function deleteWorkspaceTab(input: any) {
  const { id, index, name } = input as { id?: string; index?: number; name?: string };
  const ws = useWorkspaceContext.getState();
  const targetId = resolveTabId(ws.tabs, { id, index, name });
  if (!targetId) {
    return { message: 'Unable to locate tab for deletion.' };
  }
  ws.deleteTab(targetId);
  return { message: 'Tab deleted.' };
}

export async function setTabContent(input: any) {
  const { id, index, name, content } = input as {
    id?: string;
    index?: number;
    name?: string;
    content?: string;
  };
  const ws = useWorkspaceContext.getState();
  if (typeof content !== 'string') {
    return { message: 'Content must be a string.' };
  }
  const targetId = resolveTabId(ws.tabs, { id, index, name });
  if (!targetId) {
    return { message: 'Unable to locate tab for set_tab_content.' };
  }
  ws.setTabs(ws.tabs.map((t) => (t.id === targetId ? { ...t, content } : t)));
  ws.setSelectedTabId(targetId);
  return { message: 'Tab content updated.' };
}

export async function setSelectedTabId(input: any) {
  const { id, index, name } = input as { id?: string; index?: number; name?: string };
  const ws = useWorkspaceContext.getState();
  const targetId = resolveTabId(ws.tabs, { id, index, name });
  if (!targetId) {
    return { message: 'Unable to locate tab for set_tab_content.' };
  }
  ws.setSelectedTabId(targetId);
  return { message: 'Tab selected.' };
}

export async function getWorkspaceInfo() {
  const ws = useWorkspaceContext.getState();
  return { workspace: ws };
}

// ---------------------------------------------------------------------------
// Timer helper functions (used by agent tools)
// ---------------------------------------------------------------------------

export async function startTimerHelper(input: any) {
  const { label, durationMinutes } = input as { label?: string; durationMinutes?: number };
  
  if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
    return { error: 'Invalid duration. Must be a positive number of minutes.' };
  }
  
  const ws = useWorkspaceContext.getState();
  const timerLabel = typeof label === 'string' && label ? label : `${durationMinutes} min timer`;
  const durationMs = durationMinutes * 60 * 1000;
  
  ws.startTimer(timerLabel, durationMs);
  
  return { 
    message: `Timer started: "${timerLabel}" for ${durationMinutes} minutes`,
    timer: {
      label: timerLabel,
      durationMinutes,
      status: 'running'
    }
  };
}

export async function pauseTimerHelper() {
  const ws = useWorkspaceContext.getState();
  const timer = ws.activeTimer;
  
  if (!timer) {
    return { error: 'No active timer to pause.' };
  }
  
  if (timer.status !== 'running') {
    return { error: `Timer is ${timer.status}, cannot pause.` };
  }
  
  ws.pauseTimer();
  return { message: 'Timer paused.' };
}

export async function resumeTimerHelper() {
  const ws = useWorkspaceContext.getState();
  const timer = ws.activeTimer;
  
  if (!timer) {
    return { error: 'No timer to resume.' };
  }
  
  if (timer.status !== 'paused') {
    return { error: `Timer is ${timer.status}, cannot resume.` };
  }
  
  ws.resumeTimer();
  return { message: 'Timer resumed.' };
}

export async function stopTimerHelper() {
  const ws = useWorkspaceContext.getState();
  const timer = ws.activeTimer;
  
  if (!timer) {
    return { error: 'No timer to stop.' };
  }
  
  ws.stopTimer();
  return { message: 'Timer stopped.' };
}

export async function getTimerStatusHelper() {
  const ws = useWorkspaceContext.getState();
  const timer = ws.activeTimer;
  
  if (!timer) {
    return { 
      status: 'no_timer',
      message: 'No active timer.'
    };
  }
  
  const now = Date.now();
  const elapsed = timer.status === 'running' 
    ? timer.elapsedMs + (now - timer.startedAt)
    : timer.elapsedMs;
  
  const remaining = Math.max(0, timer.durationMs - elapsed);
  const remainingMinutes = Math.ceil(remaining / (60 * 1000));
  const remainingSeconds = Math.ceil(remaining / 1000);
  
  return {
    status: timer.status,
    label: timer.label,
    durationMinutes: Math.round(timer.durationMs / (60 * 1000)),
    elapsedMinutes: Math.floor(elapsed / (60 * 1000)),
    remainingMinutes,
    remainingSeconds,
    percentComplete: Math.round((elapsed / timer.durationMs) * 100),
  };
}
