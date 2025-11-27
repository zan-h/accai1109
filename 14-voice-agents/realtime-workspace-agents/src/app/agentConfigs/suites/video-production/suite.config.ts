import { SuiteConfig } from '@/app/agentConfigs/types';

export const videoProductionSuiteConfig: SuiteConfig = {
  id: 'video-production',
  name: 'Video Production Companion',
  description: 'Complete video production workflow from ideation to publishing with specialized agents for research, strategy, scripting, production, and launch optimization.',
  icon: '🎬',
  category: 'complex-work',
  disabled: true, // Temporarily disabled
  tags: [
    'video-production',
    'youtube',
    'content-creation',
    'scriptwriting',
    'video-editing',
    'publishing',
    'strategy',
    'research',
  ],
  
  suggestedUseCases: [
    'Creating YouTube videos from idea to publish',
    'Developing video content strategy',
    'Scriptwriting with visual planning',
    'Optimizing videos for discovery and engagement',
    'Learning what works for your channel over time',
  ],
  
  userLevel: 'intermediate',
  estimatedSessionLength: 60, // Full workflow takes time, but can work in sessions
  
  workspaceTemplates: [
    {
      name: 'Video Strategy',
      type: 'markdown',
      description: 'Foundation for everything - audience, goal, message, titles, hook, CTA',
      content: `# Video Strategy

## Target Audience
[Who are you speaking to?]

## Video Goal
[Educate/Entertain/Inspire/Convert?]

## Core Message (One Sentence)
[What's the takeaway?]

## Title Options (3-5 variations, keyword-rich)
1. [Title option 1]
2. [Title option 2]
3. [Title option 3]
4. [Title option 4]
5. [Title option 5]

## Hook Promise (First 5 seconds)
[What keeps them watching?]

## Outcome Promise (5-10 words)
[What will viewer achieve/learn/gain?]

## CTA (Call to Action)
[What should viewers do?]

## Thumbnail Concept
- Visual idea: [Face/Object/Scene?]
- Text overlay: [3-5 words max]
- Emotional tone: [Curiosity/Shock/Calm/Excited?]
`,
    },
    {
      name: 'Script Flow',
      type: 'markdown',
      description: 'Complete script with visuals plan and storyboard',
      content: `# Script Flow - [Video Title]

## Hook (0-5 sec)
[Problem/Question/Bold statement]

## Intro (5-15 sec)
[Who you are, what they'll learn]

## Value Section 1
[Main point + example/story]

## Value Section 2
[Main point + example/story]

## Value Section 3
[Main point + example/story]

## Transition to CTA
[Natural bridge]

## CTA & Outro
[Clear next step + reminder to subscribe]

## Retention Hooks
[Mark places for pattern interrupts - every 30-60 sec]

---

## Visuals Plan

### A-roll
Talking head / primary narrative
- Framing: [Wide/Medium/Close-up]
- Eyeline: [Camera direct / slightly off]

### B-roll
Cutaways, screen capture, product shots
- Scene 1: [describe]
- Scene 2: [describe]
- Scene 3: [describe]

### Graphics
- Titles: [style/placement]
- Lower thirds: [when to use]
- Chapter cards: [at timestamps]
- Overlays: [text emphasis points]

### On-screen Text & Captions
- Accuracy: [auto-captions reviewed]
- Legibility: [font size, contrast]

### Thumbnail Concept
- Face/Subject: [describe]
- 3-5 word big idea: [text]
- Contrast: [color scheme]

### End Screen & Cards
- Next watch: [suggested video]
- CTA card: [subscribe/playlist]

## Storyboard Notes
[Visual sequence sketch or shot-by-shot notes]
`,
    },
    {
      name: 'Production Checklist',
      type: 'markdown',
      description: 'Pre-recording checklist and shot list',
      content: `# Production Checklist

## Pre-Recording
- [ ] Camera/phone charged & tested
- [ ] Lighting set up
- [ ] Audio tested (mic check)
- [ ] Background/setting ready
- [ ] Script/bullet points accessible
- [ ] Timer set for recording session

## Shot List
### Main talking head footage
- [ ] Take 1
- [ ] Take 2
- [ ] Take 3 (safety)

### B-roll
- [ ] B-roll shot 1: [describe]
- [ ] B-roll shot 2: [describe]
- [ ] B-roll shot 3: [describe]

### Cutaway/Reaction Shots
- [ ] Insert 1: [describe]
- [ ] Insert 2: [describe]

## Shorts Plan (≤60s)
- Hook (0-2s): [startling stat/visual/promise]
- 1 Insight or Demo: [quick, visual, tactile]
- Payoff Visual: [result, before→after, chart pop]
- CTA: [point to long-form or comment prompt]

## Shot List (Lean)
### A-ROLL
- Angle / lens / framing / takes
- Key lines to punch-in (mark ★)

### B-ROLL
- Scene → action → purpose (Beat #)
- Screen-caps (timestamps or steps)
- Inserts (hands, UI, whiteboard)

### AUDIO NOTES
- [ ] Room tone ✓
- [ ] Wild lines ✓
- [ ] VO pickups ✓
`,
    },
    {
      name: 'Launch Optimizer',
      type: 'markdown',
      description: 'Publishing metadata and optimization strategy',
      content: `# Launch Optimizer - [Video Title]

## Metadata

### Final Title (Under 60 characters, keyword-front-loaded)
[Title here]

### Description
**First 2 lines (Hook + CTA):**
[Line 1]
[Line 2]

**Timestamps:** (If applicable)
- 00:00 [Section]
- 00:45 [Section]
- 02:15 [Section]

**Links:** (Products/Resources mentioned)
- [Link 1]: [URL]
- [Link 2]: [URL]

**Hashtags:** (3-5 relevant tags)
#tag1 #tag2 #tag3

### Tags (15-20 relevant keywords)
[keyword1, keyword2, keyword3, ...]

## Thumbnail

### Visual Element
[Face/Object/Text?]

### Text Overlay  
[3-5 words max, high contrast]

### Emotion Conveyed
[Curiosity/Shock/Calm/Excited?]

## Publishing Strategy

### Upload Time
[When is your audience most active?]

### Community Tab Tease
[Post 1-2 hours before]

### First Comment Pinned
[Conversation starter]
`,
    },
    {
      name: 'Video Ideas',
      type: 'csv',
      description: 'Pipeline of all video ideas with status tracking',
      content: `Date Added|Topic|Target Audience|Status|Priority|Notes
${new Date().toLocaleDateString()}|Example: How to cold email|Founders|Researching|High|Check competitor videos
${new Date().toLocaleDateString()}|Example: Best productivity apps|Solopreneurs|Backlog|Medium|Ali Abdaal covered this
`,
    },
    {
      name: 'Research Notes',
      type: 'markdown',
      description: 'Competitor analysis and market research findings',
      content: `# Research Notes - [Video Topic]

## Competitor Videos Found

### Video 1: [Title]
- Creator: [Name]
- Views: [Count]
- Upload Date: [Date]
- CTR estimate: [%]
- Key hook: [What they used]
- Strengths: [What worked]
- Gaps: [What they missed]

### Video 2: [Title]
- Creator: [Name]
- Views: [Count]
- Upload Date: [Date]
- CTR estimate: [%]
- Key hook: [What they used]
- Strengths: [What worked]
- Gaps: [What they missed]

### Video 3: [Title]
- Creator: [Name]
- Views: [Count]
- Upload Date: [Date]
- CTR estimate: [%]
- Key hook: [What they used]
- Strengths: [What worked]
- Gaps: [What they missed]

## Common Patterns
- Hook styles: [What's common]
- Thumbnail styles: [What's common]
- Video length: [Average]

## Unique Angle Opportunities
1. [Gap/angle not covered]
2. [Different perspective]
3. [Updated information]

## Market Demand Signals
- Search volume: [High/Medium/Low]
- Trending: [Yes/No]
- Evergreen potential: [High/Medium/Low]
`,
    },
    {
      name: 'Performance Log',
      type: 'csv',
      description: 'Analytics tracking for all published videos',
      content: `Date Published|Video Title|CTR %|Avg View %|Watch Time|First 30s Drop %|Biggest Dip (timestamp)|Comments|What Worked|What to Test Next
${new Date().toLocaleDateString()}|Example: How to cold email|6.2|47|8m 23s|18|2:34 (transition)|23|Strong hook, clear structure|Try shorter intro
`,
    },
    {
      name: 'Learning Library',
      type: 'markdown',
      description: 'What works for YOUR channel - personalized knowledge base',
      content: `# What Works for MY Channel

## Hook Patterns That Convert (High CTR)
- [Pattern 1]: [Example] - CTR: X%
- [Pattern 2]: [Example] - CTR: X%

## Topics That Resonate (High Retention)
- [Topic 1]: [Why it worked]
- [Topic 2]: [Why it worked]

## Thumbnail Styles That Click
- [Style 1]: [Example + result]
- [Style 2]: [Example + result]

## Title Formulas
- [Formula 1]: [Example]
- [Formula 2]: [Example]

## Editing Techniques
- [Technique 1]: [When to use]
- [Technique 2]: [When to use]

## Mistakes to Avoid
- [Mistake 1]: [What happened]
- [Mistake 2]: [What happened]

## Next Video Hypotheses
1. [Hypothesis based on data]
2. [Hypothesis based on data]
`,
    },
  ],
  
  initialContext: {
    wipLimit: 1, // One active video project at a time
    workflow: 'flexible', // No forced gates, user controls flow
  },
};

