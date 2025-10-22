// src/app/agentConfigs/shared/tools/workspace/timerTools.ts

import { tool } from '@openai/agents/realtime';
import {
  startTimerHelper,
  pauseTimerHelper,
  resumeTimerHelper,
  stopTimerHelper,
  getTimerStatusHelper,
} from '@/app/contexts/WorkspaceContext';

export const startTimerTool = tool({
  name: 'start_timer',
  description: 'Start a visible countdown timer for the user. Perfect for sprints, focus sessions, or any timed activity. The timer will be prominently displayed in the UI.',
  parameters: {
    type: 'object',
    properties: {
      label: {
        type: 'string',
        description: 'A descriptive label for the timer (e.g., "30-min Flow Sprint", "Focus Session", "Break Time")',
      },
      durationMinutes: {
        type: 'number',
        description: 'Duration in minutes (e.g., 15, 30, 60)',
        minimum: 1,
      },
    },
    required: ['durationMinutes'],
    additionalProperties: false,
  },
  execute: startTimerHelper,
});

export const pauseTimerTool = tool({
  name: 'pause_timer',
  description: 'Pause the currently running timer',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  },
  execute: pauseTimerHelper,
});

export const resumeTimerTool = tool({
  name: 'resume_timer',
  description: 'Resume a paused timer',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  },
  execute: resumeTimerHelper,
});

export const stopTimerTool = tool({
  name: 'stop_timer',
  description: 'Stop and clear the current timer',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  },
  execute: stopTimerHelper,
});

export const getTimerStatusTool = tool({
  name: 'get_timer_status',
  description: 'Get the current timer status, including time remaining and completion percentage',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  },
  execute: getTimerStatusHelper,
});

// Export as collection
export const timerTools = [
  startTimerTool,
  pauseTimerTool,
  resumeTimerTool,
  stopTimerTool,
  getTimerStatusTool,
];



