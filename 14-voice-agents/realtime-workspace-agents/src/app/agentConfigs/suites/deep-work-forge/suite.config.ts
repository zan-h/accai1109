import { SuiteConfig } from '@/app/agentConfigs/types';

export const deepWorkForgeSuiteConfig: SuiteConfig = {
  id: 'deep-work-forge',
  name: 'Deep Work Forge',
  description: 'A simple, focused deep work session. Set your intention and dive into distraction-free work with agent support at key moments.',
  icon: '🔥',
  category: 'productivity',
  tags: ['deep-work', 'focus', 'flow-state', 'productivity', 'simple'],
  
  suggestedUseCases: [
    'Deep work sessions on complex projects',
    'Writing and creative work',
    'Problem-solving and strategic thinking',
    'Learning and skill development',
    'Research and analysis work',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 60, // Flexible: 30-120 minutes
  
  workspaceTemplates: [
    {
      name: 'Session Intention',
      type: 'markdown',
      content: `# Deep Work Session

## What I'm Working On
- 

## Why This Matters
- 

## Success Looks Like
- 

## Time Block
- Duration: ___ minutes
- Started: ___
- Completed: ___
`,
      description: 'Set your intention and track your deep work session',
    },
    {
      name: 'Session Notes',
      type: 'markdown',
      content: `# Session Notes

## Key Insights
- 

## Blockers Encountered
- 

## Next Steps
- 

## Reflection
*What worked well? What would I do differently next time?*
`,
      description: 'Capture insights and learnings during the session',
    },
  ],
  
  initialContext: {
    focusMode: true,
    minimalInterruptions: true,
  },
};

