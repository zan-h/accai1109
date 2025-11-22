import { SuiteConfig } from '@/app/agentConfigs/types';

export const deepWorkForgeSuiteConfig: SuiteConfig = {
  id: 'deep-focus',
  name: 'Deep Focus',
  description: 'Sustained concentration for complex work. Minimal interruptions, long timers, protected flow state.',
  icon: '🎯',
  category: 'productivity',
  tags: ['deep-work', 'focus', 'flow-state', 'concentration', 'minimal-interruption'],
  
  suggestedUseCases: [
    'Need 60+ minutes uninterrupted',
    'Complex or creative work',
    'Protecting flow state',
    'Deep thinking time',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 90, // 60-120 minutes
  
  workspaceTemplates: [
    {
      name: 'Deep Work Log',
      type: 'csv',
      content: 'Date|Duration (min)|Project|Quality (1-10)|Distractions|Notes\n',
      description: 'Track deep work sessions over time',
    },
    {
      name: 'Session Notes',
      type: 'markdown',
      content: `# Deep Work Session

## Intention
What I'm working on:

## Setup
Distractions eliminated:

## Insights
Key learnings or breakthroughs:

## Next Steps
What to do next:

## Quality Rating
__ / 10
`,
      description: 'Session intentions, insights, and next steps',
    },
  ],
  
  initialContext: {
    focusMode: true,
    minimalInterruptions: true,
    defaultTimerMinutes: 90,
  },
};

