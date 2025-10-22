import { SuiteConfig } from '@/app/agentConfigs/types';

export const gtdSuiteConfig: SuiteConfig = {
  id: 'gtd',
  name: 'GTD Capture & Organize',
  description: 'Get everything out of your head and into a trusted system. Voice-optimized for rapid capture of tasks, ideas, and commitments with automatic organization.',
  icon: '📥',
  category: 'productivity',
  tags: ['gtd', 'capture', 'organize', 'inbox-zero', 'task-management', 'clarity', 'focus'],
  
  suggestedUseCases: [
    'Clear mental clutter',
    'Rapid task capture throughout the day',
    'Process overflowing inbox',
    'Weekly review and planning',
    'Get projects and tasks organized',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 15, // Quick captures, 60 min for weekly review
  
  workspaceTemplates: [
    {
      name: 'Inbox',
      type: 'csv',
      content: `Captured|Item|Type|Status|Notes
${new Date().toISOString()}|Call dentist to schedule checkup|task|new|—
${new Date().toISOString()}|Idea for blog post about AI agents|idea|new|—
${new Date().toISOString()}|Follow up with Sarah about project|task|new|—
`,
      description: 'Raw capture of everything - process this regularly',
    },
    {
      name: 'Quick Capture',
      type: 'csv',
      content: `Time|What|Context|Energy|Processed
${new Date().toLocaleTimeString()}|Buy milk|@errands|low|no
${new Date().toLocaleTimeString()}|Email John re: proposal|@work|medium|no
${new Date().toLocaleTimeString()}|Book flight for conference|@computer|high|no
`,
      description: 'Lightning-fast voice captures (agent auto-adds here)',
    },
    {
      name: 'Next Actions',
      type: 'csv',
      content: `Context|Action|Project|Energy|Time|Status|Notes
@work|Draft Q1 report outline|Quarterly Review|high|30m|open|—
@home|Replace kitchen light bulb|Home Maintenance|low|5m|open|—
@calls|Call insurance about claim|Insurance Claim|medium|15m|open|Need policy number
@computer|Research CRM options|Sales System|high|45m|open|—
@errands|Drop off package at UPS|—|low|10m|open|—
`,
      description: 'Single-step tasks organized by context',
    },
    {
      name: 'Projects',
      type: 'markdown',
      content: `# Active Projects

## Quarterly Review
**Outcome:** Complete and present Q1 performance review
**Next Action:** Draft Q1 report outline (@work, 30m)
**Waiting For:** Data from finance team (requested 3/15)
**Target Date:** March 31

---

## Sales System
**Outcome:** Implement new CRM for team
**Next Action:** Research CRM options (@computer, 45m)
**Waiting For:** —
**Target Date:** April 15

---

## Home Maintenance
**Outcome:** Complete spring home repairs
**Next Action:** Replace kitchen light bulb (@home, 5m)
**Waiting For:** —
**Target Date:** Ongoing

---

# Template for New Project
## [Project Name]
**Outcome:** [What does "done" look like?]
**Next Action:** [Very next physical action]
**Waiting For:** [Anything blocked or delegated]
**Target Date:** [When does this need to be done?]
`,
      description: 'Multi-step outcomes with next actions',
    },
    {
      name: 'Waiting For',
      type: 'csv',
      content: `Date|What|Who|Context|Follow-up Date|Status|Notes
${new Date().toLocaleDateString()}|Budget approval|Manager|Team meeting|${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}|pending|Asked on Monday
${new Date().toLocaleDateString()}|Book recommendations|Friend|Email|${new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString()}|pending|—
${new Date().toLocaleDateString()}|Plumber estimate|ABC Plumbing|Phone|${new Date(Date.now() + 2*24*60*60*1000).toLocaleDateString()}|pending|Should hear back Fri
`,
      description: 'Things delegated or pending from others',
    },
    {
      name: 'Someday Maybe',
      type: 'markdown',
      content: `# Someday/Maybe

## Learning & Skills
- Learn Spanish
- Take photography course
- Study machine learning

## Projects to Consider
- Redesign home office
- Write a book about productivity
- Start a podcast

## Places to Visit
- Japan
- Iceland
- New Zealand

## Things to Try
- Rock climbing
- Pottery class
- Meditation retreat

## Ideas
- App idea: Voice-first task manager
- Blog series on GTD for busy parents
- YouTube channel about minimal living
`,
      description: 'Ideas and projects to review later (not now)',
    },
    {
      name: 'Calendar',
      type: 'csv',
      content: `Date|Time|Event|Location|Duration|Prep Needed|Notes
${new Date().toLocaleDateString()}|09:00|Team standup|Zoom|30m|Review sprint board|Daily
${new Date().toLocaleDateString()}|14:00|Dentist appointment|123 Main St|60m|Bring insurance card|—
${new Date(Date.now() + 1*24*60*60*1000).toLocaleDateString()}|10:00|Client presentation|Office|90m|Finalize slides|Important
`,
      description: 'Time-specific commitments (not a to-do list)',
    },
    {
      name: 'Contexts',
      type: 'markdown',
      content: `# GTD Contexts

## What are contexts?
Contexts are the situations/tools/places where you can do certain tasks.

## My Active Contexts
- **@work** - At the office or work computer
- **@home** - At home
- **@computer** - Any computer with internet
- **@calls** - Phone calls to make
- **@errands** - Out and about (stores, post office, etc.)
- **@waiting** - Waiting for someone/something
- **@low-energy** - Brain-dead tasks for tired times
- **@creative** - High-energy creative work

## Energy Levels
- **High:** Complex thinking, writing, designing
- **Medium:** Email, calls, planning
- **Low:** Filing, organizing, simple errands

## Time Available
- **< 5 min:** Quick wins
- **15-30 min:** Focused tasks
- **60+ min:** Deep work blocks
`,
      description: 'Your contexts for organizing actions',
    },
    {
      name: 'Weekly Review',
      type: 'markdown',
      content: `# Weekly Review

**Date:** _________
**Week of:** _________

## 1. Get Clear (Empty Your Head)
- [ ] Write down any lingering thoughts, ideas, or to-dos
- [ ] Check physical inboxes (mail, receipts, notes)
- [ ] Check digital inboxes (email, messages, downloads)

## 2. Get Current (Process Everything)
- [ ] Process Inbox to zero
- [ ] Process Quick Capture to zero
- [ ] Review all Next Actions - still relevant?
- [ ] Review all Projects - move forward or archive?
- [ ] Review Waiting For - any follow-ups needed?
- [ ] Review Calendar - past week and next 2 weeks
- [ ] Review Someday/Maybe - anything ready to activate?

## 3. Get Creative (Future Planning)
- What went well this week?
- What could be better?
- Any new projects or commitments to add?
- Any projects to complete or archive?

## 4. Weekly Stats
- Inbox items processed: ___
- Next Actions completed: ___
- Projects moved forward: ___
- New ideas captured: ___

## Notes & Reflections
`,
      description: 'Weekly review template (GTD cornerstone)',
    },
  ],
  
  initialContext: {
    captureMode: 'always-ready',
    processingStyle: 'clarifying',
    defaultContext: '@work',
  },
};

