import { SuiteConfig } from '@/app/agentConfigs/types';

export const flowSprintsSuiteConfig: SuiteConfig = {
  id: 'flow-sprints',
  name: 'Flow Sprints Challenge',
  description: 'Turn productivity into a game. See how many tasks you can complete in focused time sprints. Every completion is celebrated and tracked. Build momentum, beat your records, and make work feel like winning.',
  icon: '⚡',
  category: 'productivity',
  tags: ['sprints', 'gamification', 'momentum', 'focus', 'time-boxing', 'motivation', 'challenge'],
  
  suggestedUseCases: [
    'Beat procrastination with momentum',
    'Clear a backlog quickly',
    'Build daily productivity habits',
    'Make boring tasks feel like a game',
    'Track personal productivity records',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 15, // Quick sprints throughout day
  
  workspaceTemplates: [
    {
      name: 'Sprint Log',
      type: 'csv',
      content: `Date|Time|Sprint Duration|Task|Completed At|Time Taken|Sprint Total|Energy|Notes
${new Date().toLocaleDateString()}|10:00|30min|Draft email to client|10:12|12min|1/5|high|Good focus
${new Date().toLocaleDateString()}|10:12|30min|Review proposal|10:25|13min|2/5|high|In the zone
${new Date().toLocaleDateString()}|10:25|30min|File expenses|10:28|3min|3/5|high|Quick win!
`,
      description: 'Every task completion auto-logged here (agent writes this!)',
    },
    {
      name: 'Personal Bests',
      type: 'csv',
      content: `Sprint Type|Record|Tasks Completed|Date Set|Total Time|Avg Time/Task|Notes
15-min Sprint|5 tasks|5|${new Date().toLocaleDateString()}|15min|3min|Morning energy!
30-min Sprint|8 tasks|8|${new Date().toLocaleDateString()}|30min|3.75min|Personal best
60-min Sprint|12 tasks|12|${new Date().toLocaleDateString()}|60min|5min|Deep work flow
Morning Sprint|10 tasks|10|${new Date().toLocaleDateString()}|45min|4.5min|Best morning ever
`,
      description: 'Your productivity records - beat these!',
    },
    {
      name: 'Daily Streaks',
      type: 'csv',
      content: `Date|Sprints Completed|Tasks Done|Total Focus Time|Best Sprint|Streak Day|Energy Level|Win of the Day
${new Date().toLocaleDateString()}|3|18|90min|8 tasks in 30min|1|high|Cleared entire inbox
${new Date(Date.now() - 1*24*60*60*1000).toLocaleDateString()}|2|12|60min|7 tasks in 30min|—|medium|Good momentum
${new Date(Date.now() - 2*24*60*60*1000).toLocaleDateString()}|4|22|120min|9 tasks in 30min|—|high|New record!
`,
      description: 'Daily productivity streaks - keep the chain going!',
    },
    {
      name: 'Sprint Stats',
      type: 'markdown',
      content: `# Sprint Stats & Analytics

## Current Streak
🔥 **3 days** of completing at least 2 sprints/day

## All-Time Records
- **Most tasks in 15 min:** 5 tasks ⭐
- **Most tasks in 30 min:** 8 tasks ⭐
- **Most tasks in 60 min:** 12 tasks ⭐
- **Best single day:** 22 tasks ✨
- **Longest streak:** 7 days 🏆

## This Week
- Sprints completed: 12
- Tasks completed: 67
- Total focus time: 6 hours
- Average sprint: 5.5 tasks
- Best day: Monday (22 tasks)

## Patterns & Insights
- **Peak performance:** Morning (9-11 AM)
- **Best sprint length:** 30 minutes
- **Most productive day:** Monday
- **Avg time per task:** 4.2 minutes
- **Flow state %:** 75% of sprints

## Momentum Metrics
- Tasks/day average: 18
- Completed sprints: 45 total
- Win rate: 85% (hit target or better)
`,
      description: 'Your productivity analytics',
    },
    {
      name: 'Challenge Board',
      type: 'markdown',
      content: `# Active Challenges

## Today's Challenge
**Goal:** Complete 3 sprints of 30 minutes each
**Progress:** ⬜⬜⬜ (0/3)
**Reward:** New personal best + streak continues

---

## Weekly Challenge
**Goal:** 15 total sprints this week
**Progress:** ⬛⬛⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ (3/15)
**Reward:** Unlock "Flow Master" badge

---

## Sprint Challenges (Pick One Per Sprint)

### Speed Challenges
- [ ] **Quick Fire:** 10 tasks in 15 minutes
- [ ] **Speed Demon:** 15 tasks in 30 minutes
- [ ] **Marathon:** 20 tasks in 60 minutes

### Specialty Challenges
- [ ] **Inbox Zero:** Clear all email in one sprint
- [ ] **Quick Wins Only:** 10 tasks under 2 minutes each
- [ ] **Deep Work:** One complex task, uninterrupted focus
- [ ] **Morning Blitz:** 3 sprints before noon
- [ ] **Energy Match:** Complete sprint matching your energy level

### Streak Challenges
- [ ] **Three-peat:** 3 sprints in one day
- [ ] **Week Warrior:** Sprint every day this week
- [ ] **Early Bird:** Sprint before 9 AM for 5 days
- [ ] **Consistency King:** 2 sprints/day for 30 days

---

## Completed Challenges 🏆
- ✅ **Quick Fire** - 10 tasks in 15 min (Mar 15)
- ✅ **Three-peat** - 3 sprints in one day (Mar 14)
`,
      description: 'Gamified challenges to keep you motivated',
    },
    {
      name: 'Sprint Prep',
      type: 'markdown',
      content: `# Sprint Preparation

## Before You Start

### 1. Choose Sprint Type
- **15-min Blitz:** Quick wins, high energy
- **30-min Flow:** Balanced productivity
- **60-min Deep Work:** Complex tasks

### 2. Set Your Target
How many tasks can you complete?
- Beginner: 3-5 tasks
- Intermediate: 6-10 tasks
- Advanced: 10+ tasks

### 3. Prep Your List
- [ ] Tasks are specific and actionable
- [ ] Tasks are sized appropriately
- [ ] Everything you need is within reach
- [ ] Distractions eliminated

### 4. Energy Check
- High energy → Tackle hard stuff
- Medium energy → Mix of tasks
- Low energy → Quick admin wins

---

## Sprint Rules

1. **Timer is sacred** - No pausing once started
2. **Complete, don't perfect** - Done > perfect
3. **Log everything** - Every task gets recorded
4. **Celebrate wins** - Acknowledge each completion
5. **Stay focused** - One sprint, one mission

---

## Quick Start Templates

### Email Blitz (15 min)
- Clear 10 emails
- Each response < 90 seconds
- Batch similar emails

### Admin Sprint (30 min)
- File documents
- Schedule appointments
- Process receipts
- Return calls

### Creative Sprint (60 min)
- One deep work task
- No context switching
- Protect flow state
`,
      description: 'How to prepare for maximum productivity',
    },
    {
      name: 'Task Queue',
      type: 'csv',
      content: `Priority|Task|Est Time|Energy|Context|Ready|Notes
1|Respond to client email|5min|low|@computer|yes|Simple reply
2|Review contract|15min|high|@computer|yes|Need to focus
3|Schedule dentist|3min|low|@calls|yes|Quick call
4|Draft proposal outline|20min|high|@computer|yes|Creative work
5|File expenses|10min|low|@computer|yes|Admin task
6|Call supplier|8min|medium|@calls|yes|Follow up
7|Update spreadsheet|12min|medium|@computer|yes|Data entry
`,
      description: 'Tasks ready for your next sprint',
    },
    {
      name: 'Celebrations',
      type: 'markdown',
      content: `# Sprint Wins & Celebrations 🎉

## Recent Victories

### ${new Date().toLocaleDateString()} - CRUSHING IT! ⚡
- Completed 8 tasks in 30-min sprint
- NEW PERSONAL BEST! 🏆
- Maintained focus 100% of the time
- Cleared entire admin backlog
- **Feeling:** Unstoppable momentum

### ${new Date(Date.now() - 1*24*60*60*1000).toLocaleDateString()} - Solid Performance 💪
- 3 sprints completed
- 18 total tasks done
- Streak extended to 3 days
- **Feeling:** Building confidence

---

## Milestone Achievements

- 🏆 **100 Tasks Club** - Completed 100+ tasks
- 🔥 **Week Streak** - 7 consecutive days
- ⚡ **Speed Demon** - 15 tasks in 30 minutes
- 🎯 **Perfect Day** - 5 sprints in one day
- 💎 **Flow Master** - 10 sprints in flow state

---

## Why This Works

"I completed 8 tasks in 30 minutes today. Last week, I could barely do 5. Seeing the numbers go up is addictive. I actually look forward to my sprint sessions now."

"The timer creates urgency. Knowing every task is logged makes me want to see how high I can push the count. It's like a game."

"I never thought I'd enjoy productivity tracking, but watching my streaks build is incredibly motivating."

---

## Keep Building Momentum!

Every sprint makes you better.
Every task logged is evidence of your capability.
Every record broken proves you're growing.

**Your turn. How high can you go?**
`,
      description: 'Celebrate your wins - you earned it!',
    },
  ],
  
  initialContext: {
    gamificationMode: 'high',
    defaultSprintLength: 30,
    celebrationStyle: 'enthusiastic',
    trackingEnabled: true,
  },
};

