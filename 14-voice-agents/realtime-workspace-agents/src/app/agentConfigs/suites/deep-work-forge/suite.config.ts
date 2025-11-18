import { SuiteConfig } from '@/app/agentConfigs/types';

export const deepWorkForgeSuiteConfig: SuiteConfig = {
  id: 'deep-work-forge',
  name: 'Deep Work Forge',
  description: 'A structured 90-minute ritual for deep, focused work. Four distinct stages guided by specialized agents: Prepare (5 min) → Launch (25 min) → Sustain (50 min) → Close (10 min). Each stage has a clear purpose and dedicated agent to guide you through it.',
  icon: '🔥',
  category: 'productivity',
  tags: ['deep-work', 'focus', 'ritual', 'structure', 'flow-state', 'productivity', 'multi-stage'],
  
  suggestedUseCases: [
    'Deep work sessions on complex projects',
    'Writing and creative work',
    'Problem-solving and strategic thinking',
    'Learning and skill development',
    'Research and analysis work',
  ],
  
  userLevel: 'intermediate',
  estimatedSessionLength: 90, // 90-minute ritual
  
  workspaceTemplates: [
    {
      name: 'Session Intention',
      type: 'markdown',
      content: `# Deep Work Session

## Session Intention
*Set by you during Prepare stage*

**Why am I doing this?**
- [Your deeper motivation goes here]

**Win condition for this block:**
- [Specific, measurable outcome]

**Reward / next anchor:**
- [What happens after success]

---

## Stage Progress
- [ ] Prepare (5 min) - Set intention
- [ ] Launch (25 min) - Get into flow
- [ ] Sustain (50 min) - Maintain momentum
- [ ] Close (10 min) - Capture wins
`,
      description: 'Your intention and progress tracker for this session',
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
    ritualEnabled: true,
    ritualType: 'deep-work-forge',
    stageTracking: true,
    intentionRequired: true,
  },
};

