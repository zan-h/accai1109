// src/app/contexts/workspaceActions.ts

import type { TimerNotificationPreferences } from './WorkspaceContext';
import { useWorkspaceContext } from './WorkspaceContext';
import { createTabId, resolveTabId } from './workspaceUtils';

/**
 * Workspace mutation helpers that can be wired into agent tools. These are
 * separated from WorkspaceContext so exporting them does not pull the React
 * provider into non-React modules, which keeps Fast Refresh working.
 */
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
  const newTab = {
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
  const { label, durationMinutes, notifications } = input as {
    label?: string;
    durationMinutes?: number;
    notifications?: Partial<TimerNotificationPreferences>;
  };

  if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
    return { error: 'Invalid duration. Must be a positive number of minutes.' };
  }

  const ws = useWorkspaceContext.getState();
  const timerLabel = typeof label === 'string' && label ? label : `${durationMinutes} min timer`;
  const durationMs = durationMinutes * 60 * 1000;

  ws.startTimer(timerLabel, durationMs, notifications);

  return {
    message: `Timer started: "${timerLabel}" for ${durationMinutes} minutes`,
    timer: {
      label: timerLabel,
      durationMinutes,
      status: 'running',
      notifications: notifications || 'using defaults',
    },
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
      message: 'No active timer.',
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
