// src/app/agentConfigs/shared/tools/workspace/timerTools.ts

import { tool } from '@openai/agents/realtime';
import {
  startTimerHelper,
  pauseTimerHelper,
  resumeTimerHelper,
  stopTimerHelper,
  getTimerStatusHelper,
} from '@/app/contexts/workspaceActions';

export const startTimerTool = tool({
  name: 'start_timer',
  description: `Start a visible countdown timer for the user. Perfect for sprints, focus sessions, or any timed activity.
  
  You can optionally configure when you'll receive timer notifications to check in with the user:
  - Halfway mark (50%)
  - Final stretch (< 5 minutes remaining)
  - Completion
  
  Use notifications to stay engaged and provide motivation during the user's timed session.`,
  
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
      notifications: {
        type: 'object',
        description: 'Optional: Configure which timer intervals will send you notifications (defaults: halfway=true, finalStretch=true, completion=true)',
        properties: {
          enable25Percent: { 
            type: 'boolean',
            description: 'Get notified at 25% progress (rarely needed)',
          },
          enableHalfway: { 
            type: 'boolean',
            description: 'Get notified at 50% progress (recommended for check-ins)',
          },
          enable75Percent: { 
            type: 'boolean',
            description: 'Get notified at 75% progress (rarely needed)',
          },
          enableFinalStretch: { 
            type: 'boolean',
            description: 'Get notified when < 5 minutes remain (recommended for motivation)',
          },
          enableCompletion: { 
            type: 'boolean',
            description: 'Get notified when timer completes (recommended for debrief)',
          },
        },
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


