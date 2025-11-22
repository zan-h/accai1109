// src/app/agentConfigs/suites/energy-focus/suite.config.ts

import { SuiteConfig } from '@/app/agentConfigs/types';

export const energyFocusSuiteConfig: SuiteConfig = {
  id: 'energy-aligned-work',
  name: 'Energy Aligned Work',
  description: 'Start your work by understanding where you\'re at. Match tasks to your actual energy and capacity.',
  icon: '⚡',
  category: 'productivity',
  tags: [
    'energy',
    'body-awareness',
    'capacity',
    'grounding',
    'starting-work',
    'adhd',
    'executive-function'
  ],
  
  suggestedUseCases: [
    'Beginning of work session',
    'Uncertain about where to start',
    'Need to match work to current energy',
    'Want to understand your state first',
    'Scattered or unclear about capacity',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 15,
  
  workspaceTemplates: [
    {
      name: 'Daily Check-In',
      type: 'markdown',
      content: `# Daily Check-In

## Energy Level (1-10)
___ / 10

## Body State
How does my body feel right now?

## Emotional State
What am I feeling?

## Today's Capacity
Given my current state, what feels realistic?
`,
      description: 'Track energy, body, and emotional state',
    },
    {
      name: 'Capacity Journal',
      type: 'csv',
      content: 'Date|Energy (1-10)|Planned Hours|Actual Hours|Notes\n',
      description: 'Track realistic capacity over time',
    },
    {
      name: 'Launch Log',
      type: 'csv',
      content: 'Date|First Task|How Started|Outcome|Notes\n',
      description: 'Track how you launched into work',
    },
  ],
  
  initialContext: {
    focusArea: 'energy-alignment',
    supportStyle: 'grounding',
    checkInFrequency: 'session-start',
  },
};



