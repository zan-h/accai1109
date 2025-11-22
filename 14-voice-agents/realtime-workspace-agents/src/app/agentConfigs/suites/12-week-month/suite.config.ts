import { SuiteConfig } from '@/app/agentConfigs/types';

export const twelveWeekMonthSuiteConfig: SuiteConfig = {
  id: '12-week-month',
  name: '12‑Week Month Coach',
  description: 'A focused, voice‑driven system that turns 12 weeks into a high‑leverage "year" with specialized agents for vision, planning, execution, decisions, and reviews.',
  icon: '⏱️',
  category: 'productivity',
  disabled: true, // Temporarily disabled
  tags: ['12WY', 'planning', 'focus', 'review', 'scorecards', 'execution', 'accountability'],
  
  suggestedUseCases: [
    'Quarter acceleration',
    'Exam sprint',
    'Product launch',
    'Habit reset',
    'Goal achievement',
  ],
  
  userLevel: 'intermediate',
  estimatedSessionLength: 20, // Daily check-ins, 40-60 for reviews
  
  workspaceTemplates: [
    {
      name: '12WM Roadmap',
      type: 'markdown',
      content: `# 12‑Week Month Roadmap

## North Star (one sentence)
[Describe the vivid end‑state]

## Outcomes (3–5)
1. **[Outcome]** — **Lag Metric:** [target] by Week 12  
   **Leads:** [weekly inputs]  
   **Risks:** [top 1–2]
2. **[Outcome 2]** — **Lag Metric:** [target] by Week 12  
   **Leads:** [weekly inputs]  
   **Risks:** [top 1–2]
3. **[Outcome 3]** — **Lag Metric:** [target] by Week 12  
   **Leads:** [weekly inputs]  
   **Risks:** [top 1–2]

## Constraints & Non‑Negotiables
- Time: [hours/week]  
- Energy windows: [best times]  
- Hard commitments: [list]
`,
      description: 'North Star + 3–5 Outcomes with measures and constraints',
    },
    {
      name: 'Outcomes & Measures',
      type: 'csv',
      content: `Outcome|Lag Metric|Target|Lead Measure|Weekly Target|Owner|Notes
Grow MRR|£/mo|+£500|Demos booked|8/wk|Me|Track conversion rate
Complete dissertation chapter 3|Pages|50 pages|Writing sessions|5/wk|Me|Need quiet mornings
`,
      description: 'Track outcomes with lag and lead measures',
    },
    {
      name: 'Weekly Plan',
      type: 'csv',
      content: `Week#|Dates|Big 3|Time Blocks (hrs)|Buffers (hrs)|Recovery Plan|Risks|Notes
1|${new Date().toLocaleDateString()}|A,B,C|12|3|Walk+sleep guardrails|Travel Tue|—
2|||12|3|||—
`,
      description: 'Week‑by‑week plan with Big 3 and time blocks',
    },
    {
      name: 'Capacity Map',
      type: 'markdown',
      content: `# Capacity Map

## Available Hours
- Total hours available: [ ]  
- Focus windows (best energy): [ ]  
- Meetings (fixed commitments): [ ]  
- Personal constraints: [ ]

## Weekly Rhythm
- Monday: 
- Tuesday: 
- Wednesday: 
- Thursday: 
- Friday: 
- Weekend: 

## Energy Management
- Peak energy times: 
- Low energy times: 
- Recovery activities: 
`,
      description: 'Map weekly capacity and energy patterns',
    },
    {
      name: 'Daily Log',
      type: 'csv',
      content: `Date|Clean Commitment|Sprint Result|Blockers|Mood(0–5)|Notes
${new Date().toLocaleDateString()}|Write intro @desk 10:00 20m|Done|—|3|Felt scattered; reset helped
${new Date().toLocaleDateString()}|Review data @office 14:00 30m|Partial|Missing files|2|Need to follow up
`,
      description: 'Log daily commitments and execution',
    },
    {
      name: 'Sprint Notes',
      type: 'markdown',
      content: `# Sprint Notes

## Session 1
- **Intent:** 
- **Start/End:** 
- **Outcome:** 
- **Next micro‑step:** 

## Session 2
- **Intent:** 
- **Start/End:** 
- **Outcome:** 
- **Next micro‑step:** 
`,
      description: 'Capture details from focus sprints',
    },
    {
      name: 'Decision Matrix',
      type: 'csv',
      content: `Decision|Criteria (≤3)|Weights|Option A Score|Option B Score|Option C Score|Pick|Tiny Bet (≤48h)|Notes
Landing page focus|Speed,Impact,Confidence|5,4,3|12|10|8|A|Ship H1 test|—
Hire contractor|Cost,Quality,Speed|4,5,3|11|13|9|B|Request samples|—
`,
      description: 'Track decisions with criteria and scoring',
    },
    {
      name: 'Scorecards',
      type: 'csv',
      content: `Week#|Lead Measure|Target|Actual|%|Lag Metric|Movement|Notes
1|Demos booked|8|6|75%|MRR|+£0|Need outreach system
1|Writing sessions|5|4|80%|Pages written|12|Good progress
`,
      description: 'Track lead/lag metrics weekly',
    },
    {
      name: 'Weekly Review',
      type: 'markdown',
      content: `# Weekly Review (Week __)

## Numbers
- **Lead Measures:** 
- **Lag Measures:** 
- **Execution Score:** _% (planned blocks actually done)

## What Worked / Why
- 

## What Failed / Why
- 

## Adjustments for Next Week (max 3)
1. 
2. 
3. 
`,
      description: 'Weekly reflection and adjustment',
    },
    {
      name: 'Cycle Review',
      type: 'markdown',
      content: `# Cycle Review (Week 12)

## Summary
- **Outcomes hit/missed:** 
- **Critical lessons (3):**
  1. 
  2. 
  3. 

## Process Rules to Carry Forward
1. 
2. 

## Next Cycle
- What to start: 
- What to stop: 
- What to continue: 
`,
      description: '12‑week cycle retrospective',
    },
  ],
  
  initialContext: {
    supportStyle: 'direct-compassionate',
    defaultSprintMinutes: 20,
    methodologyVersion: '12WM-v1',
  },
};

