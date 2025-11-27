import { SuiteConfig } from '@/app/agentConfigs/types';

export const flowSprintsSuiteConfig: SuiteConfig = {
  id: 'task-sprint',
  name: 'Task Sprint',
  description: 'Race the clock to complete as many tasks as possible. Close open loops, tackle avoidance, get scored at the end.',
  icon: '🏃',
  category: 'productivity',
  disabled: false,
  tags: ['sprints', 'gamification', 'tasks', 'scoring', 'speed', 'completion'],
  
  suggestedUseCases: [
    'Lots of small tasks piling up',
    'Need gamified motivation',
    'Want to clear your backlog',
    'Beat your personal records',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 20, // 15-30 min sprints
  
  workspaceTemplates: [
    {
      name: 'Sprint Log',
      type: 'csv',
      content: 'Date|Duration (min)|Tasks Done|Score|New Record?|Notes\n',
      description: 'Track each sprint with scoring',
    },
    {
      name: 'Task Queue',
      type: 'csv',
      content: 'Task|Difficulty (1-5)|Status|Sprint Completed|Notes\n',
      description: 'Tasks ready for sprints',
    },
    {
      name: 'Personal Records',
      type: 'markdown',
      content: `# Personal Records

## Best Scores by Sprint Length
- 15 min: ___
- 20 min: ___
- 30 min: ___

## Improvement Trends
Track how your scores improve over time.
`,
      description: 'Best scores and improvement tracking',
    },
  ],
  
  initialContext: {
    gamificationMode: 'high',
    defaultSprintLength: 20,
    scoringEnabled: true,
  },
};
