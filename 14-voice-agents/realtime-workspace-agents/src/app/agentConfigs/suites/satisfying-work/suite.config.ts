import { SuiteConfig } from '@/app/agentConfigs/types';

export const satisfyingWorkSuiteConfig: SuiteConfig = {
  id: 'satisfying-work',
  name: 'Satisfying Work',
  description: 'Make work more enjoyable and stay in your body while doing it.',
  icon: '✨',
  category: 'productivity',
  disabled: false,
  tags: [
    'enjoyment',
    'embodiment',
    'fun',
    'satisfaction',
    'body-awareness',
    'work-quality',
  ],
  
  suggestedUseCases: [
    'Work feels like a slog',
    'Need to make boring work feel better',
    'Want to stay in your body while working',
    'Looking for more satisfaction from your work',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 35, // 25-45 min sessions
  
  workspaceTemplates: [
    {
      name: 'Session Notes',
      type: 'markdown',
      content: `# Work Session

## Getting Embodied
How I got into my body at the start:

## What Made Work Fun
What I tried to make this more enjoyable:

## Satisfaction Notes
What felt good about this session:
`,
      description: 'Track embodiment practices and what made work fun',
    },
    {
      name: 'Satisfaction Log',
      type: 'csv',
      content: 'Date|Task|Embodiment Practice|Fun Factor (1-10)|Notes\n',
      description: 'Track satisfaction levels over time',
    },
  ],
  
  initialContext: {
    focusArea: 'enjoyment',
    supportStyle: 'embodied',
    checkInFrequency: 'regular', // Every 15-20 min
  },
};

