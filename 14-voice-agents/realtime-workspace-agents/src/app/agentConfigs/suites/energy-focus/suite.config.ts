// src/app/agentConfigs/suites/energy-focus/suite.config.ts

import { SuiteConfig } from '@/app/agentConfigs/types';

export const energyFocusSuiteConfig: SuiteConfig = {
  id: 'energy-focus',
  name: 'Energy & Focus',
  description: 'Body-aware, ADHD-friendly productivity support for managing energy and maintaining focus',
  icon: '🧘',
  category: 'mental-health',
  tags: [
    'adhd',
    'neurodivergent',
    'energy',
    'focus',
    'body-awareness',
    'productivity',
    'executive-function'
  ],
  
  suggestedUseCases: [
    'Feeling scattered or overwhelmed',
    'Need help starting tasks',
    'Want body-aware productivity support',
    'Working with ADHD or executive function challenges',
    'Need gentle accountability',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 45,
  
  workspaceTemplates: [
    {
      name: 'Daily Check-in',
      type: 'markdown',
      content: `# Daily Check-in

## Energy Level
Scale 1-10:

## Body Awareness
How does my body feel right now?

## Emotional State
What am I feeling?

## Intentions for Today
What matters most today?
`,
      description: 'Track your daily energy and body awareness',
    },
    {
      name: 'Task Board',
      type: 'csv',
      content: 'Task|Energy Required|Time Estimate|Status|Notes\n',
      description: 'Organize tasks by energy requirements',
    },
    {
      name: 'Energy Journal',
      type: 'markdown',
      content: `# Energy Journal

## Patterns I'm Noticing

## What Supports My Energy

## What Drains My Energy
`,
      description: 'Track energy patterns over time',
    },
  ],
  
  initialContext: {
    focusArea: 'energy-management',
    supportStyle: 'gentle',
    checkInFrequency: 'high',
  },
};



