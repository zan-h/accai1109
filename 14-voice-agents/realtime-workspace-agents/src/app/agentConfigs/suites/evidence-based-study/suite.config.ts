import { SuiteConfig } from '@/app/agentConfigs/types';

export const evidenceBasedStudySuiteConfig: SuiteConfig = {
  id: 'evidence-based-study',
  name: 'Evidence-Based Study Companion',
  description: 'Learn smarter, not harder. Voice-guided study system using spaced repetition, active recall, and proven learning science.',
  icon: '🎓',
  category: 'complex-work',
  disabled: false,
  tags: [
    'study',
    'learning',
    'active-recall',
    'spaced-repetition',
    'memory',
    'education',
    'exam-prep',
    'retention',
    'metacognition',
  ],
  
  suggestedUseCases: [
    'Master complex topics efficiently',
    'Prepare for exams with proven techniques',
    'Build long-term retention through spaced repetition',
    'Test yourself with active recall',
    'Understand concepts deeply with "why" questions',
    'Track learning progress and confidence',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 30, // 25-50 minute Pomodoro-style sessions
  
  workspaceTemplates: [
    {
      name: 'Knowledge Tracker',
      type: 'csv',
      content: `Topic|Status|Confidence|Last Studied|Next Review|Notes
React Hooks|Learning|3|${new Date().toLocaleDateString()}|${new Date(Date.now() + 2*24*60*60*1000).toLocaleDateString()}|Understanding useState and useEffect
JavaScript Closures|Review|4|${new Date(Date.now() - 3*24*60*60*1000).toLocaleDateString()}|${new Date(Date.now() + 4*24*60*60*1000).toLocaleDateString()}|Can explain with examples
Machine Learning Basics|New|1|—|${new Date().toLocaleDateString()}|Just starting to explore
`,
      description: 'Track what you\'re learning with spaced repetition schedule. Status: New/Learning/Review/Mastered. Confidence: 1-5 scale.',
    },
    {
      name: 'Active Recall Questions',
      type: 'csv',
      content: `Question|Answer|Topic|Difficulty|Last Tested|Result|Next Test
What is a closure in JavaScript?|A function that has access to variables in its outer scope even after the outer function returns|JavaScript Closures|Medium|${new Date(Date.now() - 2*24*60*60*1000).toLocaleDateString()}|Correct|${new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString()}
Explain the difference between useEffect and useLayoutEffect|useEffect runs after paint, useLayoutEffect runs before paint (synchronously)|React Hooks|Hard|${new Date(Date.now() - 1*24*60*60*1000).toLocaleDateString()}|Partial|${new Date().toLocaleDateString()}
What are the three key principles of learning science?|Spaced repetition, active recall, and elaborative interrogation|Learning Science|Easy|—|—|${new Date().toLocaleDateString()}
`,
      description: 'Question bank for self-testing. Test yourself before reviewing notes for maximum retention (retrieval practice).',
    },
  ],
  
  initialContext: {
    studyApproach: 'evidence-based',
    primaryTechniques: ['spaced-repetition', 'active-recall', 'elaborative-interrogation'],
    sessionStyle: 'focused-pomodoro',
    voiceOptimized: true,
  },
};

