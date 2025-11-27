// Emotional Regulation - Parts Work Suite Configuration

import type { SuiteConfig } from '@/app/agentConfigs/types';

export const emotionalRegulationSuite: SuiteConfig = {
  id: 'emotional-regulation-parts-work',
  name: 'Emotional Regulation - Parts Work',
  description: 'Simple, accessible parts work to process emotions and clear blocks. Feel it, understand it, release it.',
  icon: '🌊',
  category: 'emotional-regulation',
  tags: [
    'emotional-regulation',
    'parts-work',
    'emotions',
    'blocks',
    'feelings',
    'processing',
    'self-awareness',
    'somatic'
  ],
  
  suggestedUseCases: [
    'Feeling stuck on a task',
    'Experiencing an overwhelming emotion',
    'Processing difficult feelings',
    'Clearing emotional blocks',
    'Understanding recurring patterns',
    'Quick emotional check-in (3-5 min)'
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 10, // 3-15 minutes depending on agent
  
  workspaceTemplates: [
    {
      name: 'Emotion Check-In Log',
      type: 'csv',
      description: 'Track your emotion processing sessions',
      content: `Date,Time,Initial Feeling,Body Location,Part Name,Part's Job,What It Needed,Key Insight,Block Cleared
${new Date().toLocaleDateString()},2:30 PM,Anxious,Chest (tight),The Worrier,Keep me safe by planning,Reassurance that I have capacity,It's trying to protect me from failure,Yes
${new Date().toLocaleDateString()},4:15 PM,Overwhelmed,Heavy shoulders,The Avoider,Protect from judgment,Breaking task into smaller steps,It shows up when things feel too big,Yes
`,
    },
    {
      name: 'Parts Library',
      type: 'markdown',
      description: 'A collection of the different parts you\'ve met',
      content: `# My Parts

A collection of the different parts I've met.

## The Worrier
- **Shows up when**: Facing deadlines, uncertainty
- **Feels like**: Tight chest, racing thoughts
- **Job**: Keeps me safe by planning everything
- **What helps**: Acknowledging risks, making simple plans, knowing I have capacity

## The Avoider  
- **Shows up when**: Task feels overwhelming
- **Feels like**: Heavy body, fatigue, "don't wanna"
- **Job**: Protects me from failure/judgment
- **What helps**: Breaking task into tiny steps, compassion, remembering it's trying to help

---

*Add your parts as you meet them*

## [Part Name]
- **Shows up when**: 
- **Feels like**: 
- **Job**: 
- **What helps**: 

`,
    },
    {
      name: 'Processing Notes',
      type: 'markdown',
      description: 'Space for insights, patterns, and breakthroughs',
      content: `# Processing Notes

A space for insights, patterns, and breakthroughs.

## ${new Date().toLocaleDateString()}

### What I Noticed Today
- 
- 

### Aha Moments
- 
- 

### Patterns I'm Seeing
- 
- 

---

## [Previous Date]

[Your past entries...]

`,
    },
  ],
  
  initialContext: {
    purpose: `This suite helps you process emotions and clear blocks using simplified parts work.

The approach:
1. IDENTIFY - Notice what you're feeling and where in your body
2. DIALOGUE - Understand the part holding this emotion and what it needs
3. INTEGRATE - Thank the part, harvest insights, release the block

This is NOT therapy - it's practical emotional regulation for daily life.
Focus on feeling and processing emotions in the present moment, not deep trauma work.`,
    
    emphasize: [
      'Every emotion has a purpose',
      'Parts are trying to help (even if the method doesn\'t work)',
      'The goal is understanding and releasing, not changing or fixing',
      'Stay with body sensations - feel it, don\'t just think about it'
    ],
  },
};

