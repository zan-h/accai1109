// src/app/agentConfigs/suites/joe-hudson/suite.config.ts

import { SuiteConfig } from '@/app/agentConfigs/types';

export const joeHudsonSuiteConfig: SuiteConfig = {
  id: 'joe-hudson',
  name: 'Joe Hudson Work Flow',
  description: 'Body-aware, curiosity-driven productivity. Get into focused work within 60-90 seconds with gentle support from Joe Hudson\'s teachings.',
  icon: '🎯',
  category: 'productivity',
  tags: [
    'work',
    'productivity',
    'agency',
    'body-awareness',
    'curiosity',
    'integrity',
    'focus',
    'commitment'
  ],
  
  suggestedUseCases: [
    'Need to get into work mode quickly',
    'Feeling scattered or resistant to starting',
    'Want body-aware productivity support',
    'Need help making a quick decision',
    'Breaking down overwhelming tasks',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 30,
  
  workspaceTemplates: [
    {
      name: 'Energy Check',
      type: 'csv',
      content: 'Time|Readiness (0-5)|Body Sensation|Regulation Used|Duration (min)|Notes\n',
      description: 'Quick body awareness and energy tracking',
    },
    {
      name: 'Commitments',
      type: 'csv',
      content: 'Time|What|Where|When|Length (min)|Clean (Y/N)|Completed|Notes\n',
      description: 'Track your clean commitments: what/where/when/how long',
    },
    {
      name: 'Work Sprints',
      type: 'csv',
      content: 'Date|Task|Start Time|Duration (min)|Continued?|Completed?|Energy After|Next Step\n',
      description: 'Log your focused work sprints',
    },
    {
      name: 'Reflections',
      type: 'markdown',
      content: `# Work Reflections

## What Happened (Truth)
What actually happened in this session?

## What Worked

## What Got in the Way

## One Insight

## Next Micro-Step
`,
      description: 'Honest reflection after work sessions',
    },
    {
      name: 'Quick Decisions',
      type: 'csv',
      content: 'Decision|Criteria 1 (weight)|Criteria 2 (weight)|Criteria 3 (weight)|Option A Score|Option B Score|Gut Check|Choice|Notes\n',
      description: '2-minute decision matrix for when you\'re stuck',
    },
    {
      name: 'Weekly Plan',
      type: 'markdown',
      content: `# This Week

## Constraints
What's limiting me this week? (time, energy, obligations)

## Top 3 Outcomes
What would make this week a win?

1. 
2. 
3. 

## First Actions
What's the first physical action for each outcome?

1. 
2. 
3. 

## Scheduled Blocks
When am I doing deep work this week?

- 
- 
`,
      description: 'Minimal weekly planning (≤3 minutes)',
    },
  ],
  
  initialContext: {
    focusArea: 'quick-work-entry',
    supportStyle: 'minimal',
    checkInFrequency: 'low',
    preferredWorkLength: 10,
  },
};






