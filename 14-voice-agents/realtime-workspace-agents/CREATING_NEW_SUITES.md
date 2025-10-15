# Creating New Agent Suites - Complete Guide

**A step-by-step guide to creating specialized voice agent suites**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Example: Baby Care Suite](#example-baby-care-suite)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Agent Design Principles](#agent-design-principles)
5. [Workspace Template Best Practices](#workspace-template-best-practices)
6. [Testing Your Suite](#testing-your-suite)

---

## Overview

Each agent suite consists of:
- **3-5 specialized voice agents** that handle different aspects of a domain
- **Workspace templates** (markdown/CSV tabs) for tracking information
- **Suite metadata** (name, description, category, tags)
- **Handoff logic** between agents
- **Optional custom tools** specific to the domain

**File Structure:**
```
src/app/agentConfigs/suites/your-suite-name/
├── suite.config.ts          # Suite metadata & templates
├── prompts.ts               # Agent system prompts
├── tools.ts                 # Custom tools (optional)
├── agents/                  # Individual agent files
│   ├── agentOne.ts
│   ├── agentTwo.ts
│   └── agentThree.ts
└── index.ts                 # Exports & handoff wiring
```

---

## Example: Baby Care Suite

**Scenario:** You're caring for your sister's baby for a couple weeks and need help with:
- Feeding schedules and tracking
- Sleep routines and patterns
- Developmental milestones
- Health monitoring
- Emergency situations
- Calming techniques

### Suite Design

**Suite Name:** Baby Care Companion  
**Icon:** 👶  
**Category:** `mental-health` (caregiving support)  
**Tags:** `baby`, `infant-care`, `parenting`, `feeding`, `sleep`, `development`

**Agents (5):**

1. **Feeding Coach** 🍼
   - Tracks feeding times, amounts, types
   - Suggests schedules based on age
   - Monitors nutrition
   - Handles formula/breastmilk questions

2. **Sleep Specialist** 😴
   - Tracks sleep patterns
   - Suggests nap schedules
   - Helps with sleep training
   - Troubleshoots sleep issues

3. **Development Tracker** 📊
   - Monitors milestones (rolling, sitting, first words)
   - Age-appropriate activity suggestions
   - Developmental red flags
   - Playtime ideas

4. **Health Monitor** 🏥
   - Tracks temperature, diapers, symptoms
   - When to call doctor
   - Medication dosages
   - Emergency protocols

5. **Calming Coach** 🤱
   - Soothing techniques for crying
   - Stress management for caregiver
   - Reading baby's cues
   - Building routines

**Workspace Templates (6):**

1. **Feeding Log** (CSV)
   - Time | Type (bottle/breast) | Amount | Notes
   
2. **Sleep Schedule** (CSV)
   - Date | Sleep Start | Wake Time | Duration | Quality | Notes

3. **Daily Care** (CSV)
   - Time | Activity (diaper/bath/play) | Notes

4. **Health Journal** (Markdown)
   - Temperature readings
   - Symptoms
   - Medications given
   - Doctor contacts

5. **Milestones** (Markdown)
   - Age-based milestones
   - What baby can do
   - Next expected milestones

6. **Emergency Info** (Markdown)
   - Parents' contact info
   - Pediatrician
   - Hospital
   - Allergies
   - Medical history

---

## Step-by-Step Implementation

### Phase 1: Create Directory Structure (5 min)

```bash
cd src/app/agentConfigs/suites
mkdir -p baby-care/agents
touch baby-care/suite.config.ts
touch baby-care/prompts.ts
touch baby-care/tools.ts
touch baby-care/index.ts
touch baby-care/agents/feedingCoach.ts
touch baby-care/agents/sleepSpecialist.ts
touch baby-care/agents/developmentTracker.ts
touch baby-care/agents/healthMonitor.ts
touch baby-care/agents/calmingCoach.ts
```

### Phase 2: Define Suite Configuration (15 min)

**File:** `suite.config.ts`

```typescript
import { SuiteConfig } from '@/app/agentConfigs/types';

export const babyCareSuiteConfig: SuiteConfig = {
  id: 'baby-care',
  name: 'Baby Care Companion',
  description: 'Expert support for infant care - feeding, sleep, development, and health monitoring',
  icon: '👶',
  category: 'mental-health', // Caregiving support
  tags: [
    'baby',
    'infant-care',
    'parenting',
    'feeding',
    'sleep',
    'development',
    'health',
    'newborn'
  ],
  
  suggestedUseCases: [
    'First-time babysitting',
    'Caring for infant temporarily',
    'Tracking feeding and sleep patterns',
    'Monitoring developmental milestones',
    'Emergency baby care guidance',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 30, // Quick check-ins throughout day
  
  workspaceTemplates: [
    {
      name: 'Feeding Log',
      type: 'csv',
      content: `Time|Type|Amount (oz)|Duration (min)|Notes
06:30 AM|Bottle|4 oz|15|Finished completely
09:45 AM|Bottle|3 oz|10|Left 1 oz
`,
      description: 'Track all feedings with times, amounts, and notes',
    },
    {
      name: 'Sleep Schedule',
      type: 'csv',
      content: `Date|Sleep Start|Wake Time|Duration|Quality|Location|Notes
${new Date().toLocaleDateString()}|7:00 AM|9:30 AM|2h 30m|Good|Crib|Long morning nap
${new Date().toLocaleDateString()}|12:00 PM|1:45 PM|1h 45m|Restless|Stroller|Woke up crying
`,
      description: 'Monitor sleep patterns and quality',
    },
    {
      name: 'Daily Care Log',
      type: 'csv',
      content: `Time|Activity|Details|Notes
06:00 AM|Diaper Change|Wet|Normal
08:00 AM|Bath|10 min|Used baby soap
10:00 AM|Tummy Time|5 min|Happy and engaged
`,
      description: 'Track diapers, baths, activities',
    },
    {
      name: 'Health Journal',
      type: 'markdown',
      content: `# Health Monitoring

## Today's Vitals
- Temperature: 
- Overall mood: 
- Appetite: 

## Symptoms to Watch
- [ ] Fever
- [ ] Unusual crying
- [ ] Rash
- [ ] Vomiting
- [ ] Diarrhea

## Medications Given
(None yet)

## Notes
`,
      description: 'Monitor health and track any concerns',
    },
    {
      name: 'Milestones',
      type: 'markdown',
      content: `# Developmental Milestones

## Current Age: _____ months

## Recently Achieved
- [ ] Holds head up
- [ ] Rolls over
- [ ] Sits without support
- [ ] Crawls
- [ ] Pulls to stand
- [ ] First words

## Working On
- 

## Next Expected Milestones
- 

## Activities to Encourage Development
- 
`,
      description: 'Track baby\'s developmental progress',
    },
    {
      name: 'Emergency Info',
      type: 'markdown',
      content: `# Emergency Information

## Parents Contact
- Mom: 
- Dad: 
- Best time to call: 

## Medical Contacts
- Pediatrician: 
- After-hours clinic: 
- Hospital: 
- Poison Control: 1-800-222-1222

## Baby Information
- **Name:** 
- **Date of Birth:** 
- **Age:** 
- **Weight:** 
- **Allergies:** None known
- **Medications:** 
- **Medical conditions:** 

## Important Notes
- Formula brand: 
- Usual feeding times: 
- Sleep schedule: 
- Special instructions: 
`,
      description: 'Critical information for emergencies',
    },
  ],
  
  initialContext: {
    careType: 'temporary',
    experienceLevel: 'learning',
    supportStyle: 'reassuring',
  },
};
```

### Phase 3: Write Agent Prompts (30 min)

**File:** `prompts.ts`

```typescript
export const feedingCoachPrompt = `
You are a warm, knowledgeable Feeding Coach who helps caregivers confidently feed and nourish babies.

# Your Role
- Track feeding times, amounts, and patterns
- Suggest age-appropriate feeding schedules
- Answer questions about formula, bottles, breastmilk
- Help troubleshoot feeding issues (refusing bottle, etc.)
- Monitor for adequate nutrition

# Approach
- Be reassuring and non-judgmental
- Ask about baby's age to give age-appropriate advice
- Encourage tracking in the Feeding Log
- Watch for red flags (not eating enough, unusual patterns)
- Normalize common feeding challenges

# Conversation Flow
1. Check: When was last feeding?
2. Update: Log the feeding details
3. Assess: Is baby eating enough for their age?
4. Advise: When should next feeding be?
5. Support: Address any feeding concerns

# When to Hand Off
- Sleep issues → Transfer to sleepSpecialist
- Health concerns (fever, vomiting) → Transfer to healthMonitor
- Crying/fussiness → Transfer to calmingCoach
- Development questions → Transfer to developmentTracker

# Red Flags to Watch For
- Not eating for >6 hours (newborn) or >4 hours (older infant)
- Refusing multiple feedings
- Vomiting after every feeding
- Signs of dehydration
→ Immediately suggest calling pediatrician
`;

export const sleepSpecialistPrompt = `
You are a gentle Sleep Specialist who helps establish healthy sleep patterns for babies and peace of mind for caregivers.

# Your Role
- Track sleep patterns and quality
- Suggest age-appropriate nap schedules
- Help establish bedtime routines
- Troubleshoot sleep difficulties
- Support tired caregivers

# Approach
- Acknowledge that baby sleep is challenging
- Provide age-appropriate expectations (babies wake often!)
- Focus on safety (back to sleep, clear crib)
- Create predictable routines
- Support the caregiver's rest too

# Conversation Flow
1. Check: How did last sleep period go?
2. Update: Log sleep in Sleep Schedule
3. Assess: Is baby getting enough sleep for age?
4. Plan: When should next nap be?
5. Soothe: Address sleep struggles with empathy

# When to Hand Off
- Feeding time → Transfer to feedingCoach
- Baby won't settle/crying → Transfer to calmingCoach
- Health concerns → Transfer to healthMonitor

# Age-Appropriate Sleep Guidelines
- 0-3 months: 14-17 hours/day, wake every 2-3 hours
- 3-6 months: 12-16 hours/day, longer stretches at night
- 6-12 months: 12-15 hours/day, 2-3 naps

# Safety First
- Always back to sleep
- Firm surface, no loose blankets
- Cool room temperature
`;

export const developmentTrackerPrompt = `
You are an encouraging Development Tracker who celebrates every milestone and guides age-appropriate activities.

# Your Role
- Monitor developmental milestones
- Suggest activities to encourage development
- Normalize developmental timelines (all babies are different!)
- Flag any concerning delays
- Make development fun and engaging

# Approach
- Celebrate every achievement, no matter how small
- Provide age-based milestone checklists
- Suggest playful activities
- Reassure about normal variation
- Never alarm unnecessarily

# Conversation Flow
1. Check: What new things is baby doing?
2. Record: Update Milestones tracker
3. Celebrate: Acknowledge progress
4. Suggest: Age-appropriate activities
5. Preview: What to expect next

# When to Hand Off
- Feeding questions → Transfer to feedingCoach
- Sleep issues → Transfer to sleepSpecialist
- Health/medical concerns → Transfer to healthMonitor

# Developmental Domains
- **Physical:** Rolling, sitting, crawling, walking
- **Cognitive:** Object permanence, cause-effect
- **Language:** Cooing, babbling, first words
- **Social:** Smiling, responding to name, stranger anxiety

# Red Flags (Suggest pediatrician visit)
- Not responding to sounds by 4 months
- Not smiling by 3 months
- Loss of previously acquired skills
- Significant delays across multiple areas
`;

export const healthMonitorPrompt = `
You are a calm, thorough Health Monitor who helps track baby's health and knows when to seek medical help.

# Your Role
- Monitor temperature, symptoms, diaper output
- Track any medications given
- Assess when to call doctor vs. when to monitor
- Provide emergency protocols
- Keep accurate health records

# Approach
- Stay calm and factual
- Ask specific questions about symptoms
- Use the Health Journal for tracking
- Know when to escalate
- Never diagnose - always defer to pediatrician

# Conversation Flow
1. Assess: What are you concerned about?
2. Gather: Ask specific symptom questions
3. Record: Log in Health Journal
4. Advise: Monitor vs. call doctor
5. Reassure: Provide clear next steps

# When to Hand Off
- Routine feeding questions → Transfer to feedingCoach
- Sleep concerns → Transfer to sleepSpecialist
- Calming fussy baby → Transfer to calmingCoach

# Call Doctor Immediately If:
- Fever >100.4°F (38°C) in baby under 3 months
- Difficulty breathing
- Severe vomiting or diarrhea
- Rash with fever
- Unusually lethargic or won't wake
- Dehydration signs (no wet diapers, sunken soft spot)

# Normal vs. Concerning
**Normal:**
- Spitting up small amounts
- 6-8 wet diapers/day
- Fussiness in evening
- Sneezing, hiccups

**Concerning:**
- Projectile vomiting
- No wet diapers in 8+ hours
- Inconsolable crying for hours
- High fever
`;

export const calmingCoachPrompt = `
You are a soothing Calming Coach who helps caregivers understand baby's cues and find peace amid the chaos.

# Your Role
- Teach baby-calming techniques
- Help caregivers read baby's signals
- Support stressed caregivers
- Build confidence in soothing skills
- Normalize crying and frustration

# Approach
- Be the calm in the storm
- Validate the caregiver's stress
- Offer practical, try-this-now techniques
- Remind them: crying is normal communication
- Support caregiver's mental health too

# Conversation Flow
1. Assess: What's happening right now?
2. Rule out: Is baby hungry, tired, uncomfortable?
3. Suggest: Try these calming techniques
4. Support: It's okay to feel overwhelmed
5. Plan: When to take a break

# Calming Techniques Toolbox
- **The 5 S's:** Swaddle, Side/Stomach position (while awake), Shush, Swing, Suck
- **White noise:** Shushing, vacuum sound, fan
- **Movement:** Gentle bounce, rock, walk
- **Skin-to-skin:** Hold baby against your chest
- **Change of scenery:** Go outside, different room
- **Check basics:** Diaper, temperature, burping

# When to Hand Off
- Feeding time → Transfer to feedingCoach
- Persistent crying with health concerns → Transfer to healthMonitor
- Sleep training → Transfer to sleepSpecialist

# Support the Caregiver
- "It's okay to put baby in safe crib and take a 5-minute break"
- "Crying doesn't mean you're doing something wrong"
- "All caregivers feel overwhelmed sometimes"
- "You're doing a great job"

# When to Get Help
- You feel like you might hurt the baby
- Baby has been crying for hours despite trying everything
- You haven't slept in days and feel unsafe
→ Call baby's parents or ask for backup
`;
```

### Phase 4: Create Agent Files (20 min)

**File:** `agents/feedingCoach.ts`

```typescript
import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { feedingCoachPrompt } from '../prompts';

export const feedingCoachAgent = new RealtimeAgent({
  name: 'feedingCoach',
  voice: 'sage', // Warm, nurturing voice
  instructions: feedingCoachPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});
```

**File:** `agents/sleepSpecialist.ts`

```typescript
import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { sleepSpecialistPrompt } from '../prompts';

export const sleepSpecialistAgent = new RealtimeAgent({
  name: 'sleepSpecialist',
  voice: 'alloy', // Calm, soothing voice
  instructions: sleepSpecialistPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});
```

**File:** `agents/developmentTracker.ts`

```typescript
import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { developmentTrackerPrompt } from '../prompts';

export const developmentTrackerAgent = new RealtimeAgent({
  name: 'developmentTracker',
  voice: 'shimmer', // Encouraging, upbeat voice
  instructions: developmentTrackerPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});
```

**File:** `agents/healthMonitor.ts`

```typescript
import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { healthMonitorPrompt } from '../prompts';

export const healthMonitorAgent = new RealtimeAgent({
  name: 'healthMonitor',
  voice: 'echo', // Professional, calm voice
  instructions: healthMonitorPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});
```

**File:** `agents/calmingCoach.ts`

```typescript
import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { calmingCoachPrompt } from '../prompts';

export const calmingCoachAgent = new RealtimeAgent({
  name: 'calmingCoach',
  voice: 'verse', // Gentle, reassuring voice
  instructions: calmingCoachPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});
```

### Phase 5: Wire Up Suite (10 min)

**File:** `index.ts`

```typescript
import { AgentSuite } from '@/app/agentConfigs/types';
import { babyCareSuiteConfig } from './suite.config';
import { feedingCoachAgent } from './agents/feedingCoach';
import { sleepSpecialistAgent } from './agents/sleepSpecialist';
import { developmentTrackerAgent } from './agents/developmentTracker';
import { healthMonitorAgent } from './agents/healthMonitor';
import { calmingCoachAgent } from './agents/calmingCoach';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up handoffs - all agents can reach each other
const agents = [
  feedingCoachAgent,
  sleepSpecialistAgent,
  developmentTrackerAgent,
  healthMonitorAgent,
  calmingCoachAgent,
];

// Each agent can handoff to any other agent
agents.forEach(agent => {
  const otherAgents = agents.filter(a => a !== agent);
  (agent.handoffs as any).push(...otherAgents);
});

// Export suite
const babyCareSuite: AgentSuite = {
  ...babyCareSuiteConfig,
  agents,
  rootAgent: feedingCoachAgent, // Start with feeding as it's most frequent
  guardrails: [
    createModerationGuardrail('Baby Care Companion'),
  ],
};

export default babyCareSuite;
```

### Phase 6: Register Suite (5 min)

**File:** `src/app/agentConfigs/index.ts`

```typescript
// Add import
import babyCareSuite from './suites/baby-care';

// Add registration (after existing suites)
registerSuiteManually(suiteRegistry, babyCareSuite);
```

### Phase 7: Test (10 min)

```bash
npm run build
npm run dev
```

Open http://localhost:3000 → You should see both suites in the selector!

---

## Agent Design Principles

### 1. **Clear Scope & Boundaries**
Each agent should have:
- A specific domain of expertise
- Clear handoff triggers
- Defined responsibilities

**Example:**
```
✅ GOOD: "Feeding Coach handles all nutrition and feeding schedules"
❌ BAD: "Feeding Coach also does sleep, health, and development"
```

### 2. **Empathetic Tone**
Voice agents are companions, not robots:
- Use warm, supportive language
- Validate user's feelings
- Normalize struggles
- Celebrate wins

**Example:**
```
✅ GOOD: "It's completely normal for babies to wake every 2 hours. You're doing great."
❌ BAD: "Baby should sleep 8 hours. You need to fix this."
```

### 3. **Safety-First Mindset**
Always prioritize safety:
- Include clear "call doctor" criteria
- Never diagnose medical issues
- Provide emergency contact reminders
- Err on side of caution

**Example:**
```
✅ GOOD: "Fever over 100.4°F in a newborn requires immediate medical attention. Call your pediatrician now."
❌ BAD: "That fever is probably nothing, just monitor it."
```

### 4. **Actionable Guidance**
Users need concrete next steps:
- Specific techniques to try
- Clear checklists
- Time-based recommendations
- Trackable metrics

**Example:**
```
✅ GOOD: "Try the 5 S's: Swaddle, Side position, Shush loudly, Swing gently, offer Suck (pacifier)"
❌ BAD: "Just try to calm the baby down"
```

### 5. **Smart Handoffs**
Agents should know when to transfer:
- Monitor for keywords/triggers
- Suggest handoff proactively
- Explain why transferring
- Make handoff feel natural

**Example Handoff Triggers:**
```typescript
// In Feeding Coach prompt:
"If user mentions:
- 'won't sleep' → sleepSpecialist
- 'crying for hours' → calmingCoach  
- 'fever' or 'sick' → healthMonitor
- 'milestone' or 'development' → developmentTracker"
```

---

## Workspace Template Best Practices

### 1. **CSV Templates: Logging Data**
Best for:
- Time-series tracking (feeding, sleep, diapers)
- Repeated events
- Numerical data

**Structure:**
```csv
Timestamp|Primary Data|Secondary Data|Notes
```

**Example:**
```csv
Time|Type|Amount|Notes
06:30 AM|Bottle|4 oz|Hungry, finished quickly
```

### 2. **Markdown Templates: Reference & Notes**
Best for:
- Emergency information
- Checklists
- Free-form notes
- Instructions

**Structure:**
```markdown
# Main Topic

## Section 1
- Checklist item
- Checklist item

## Section 2
Free-form notes...
```

### 3. **Pre-populate with Examples**
Always include 1-2 sample entries:
- Shows user the expected format
- Reduces friction
- Provides context

### 4. **Include Today's Date**
For CSV logs, pre-fill current date:
```typescript
content: `Date|Sleep Start|Wake Time|Duration
${new Date().toLocaleDateString()}|7:00 AM|9:30 AM|2h 30m
`
```

### 5. **Age-Appropriate Content**
Reference the user's situation:
```markdown
## Current Age: _____ months
(User fills in, agents reference this)
```

---

## Testing Your Suite

### Functional Tests

**Test 1: Suite Appears in Selector**
```
1. Refresh browser
2. Open suite selector
3. Verify "Baby Care Companion" appears
4. Check icon, description, agent list
```

**Test 2: Workspace Initialization**
```
1. Select suite
2. Click "Start Session"
3. Verify 6 tabs appear with correct names
4. Open each tab, verify template content
```

**Test 3: Agent Connection**
```
1. Click "Connect"
2. Verify connection to feedingCoach
3. Speak to agent
4. Verify response
```

**Test 4: Agent Handoffs**
```
1. Talk to feedingCoach
2. Say "baby won't sleep"
3. Verify handoff to sleepSpecialist
4. Check transcript shows handoff
```

**Test 5: Workspace Tools**
```
1. Ask agent to "log a feeding at 9am, 4oz bottle"
2. Verify Feeding Log updates
3. Ask to "update sleep schedule"
4. Verify Sleep Schedule updates
```

### Edge Cases

- Empty suite (no agents) → Should fail validation
- Missing templates → Suite loads but workspace empty
- Duplicate agent names → Validation error
- Circular handoff loops → Agents can get stuck
- No root agent → Random agent selected

### User Experience

- **Voice Quality:** All 5 voices should sound distinct and appropriate
- **Response Time:** Agents respond within 2-3 seconds
- **Handoff Clarity:** User understands why handoff happened
- **Template Usefulness:** Workspace tabs provide real value
- **Mobile Friendly:** Suite selector works on phone

---

## Advanced: Custom Tools (Optional)

If your suite needs domain-specific functionality:

**File:** `tools.ts`

```typescript
import { tool } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';

export const calculateNextFeedingTime = tool({
  name: 'calculate_next_feeding',
  description: 'Calculate when next feeding should occur based on baby age and last feeding',
  parameters: {
    type: 'object',
    properties: {
      babyAgeMonths: { type: 'number' },
      lastFeedingTime: { type: 'string' },
    },
    required: ['babyAgeMonths', 'lastFeedingTime'],
  },
  execute: async ({ babyAgeMonths, lastFeedingTime }) => {
    // Logic to calculate feeding interval
    const intervalHours = babyAgeMonths < 1 ? 2.5 : 
                         babyAgeMonths < 3 ? 3 : 
                         babyAgeMonths < 6 ? 4 : 4;
    
    const lastTime = new Date(lastFeedingTime);
    const nextTime = new Date(lastTime.getTime() + intervalHours * 60 * 60 * 1000);
    
    return {
      nextFeedingTime: nextTime.toLocaleTimeString(),
      intervalHours,
      message: `Next feeding should be around ${nextTime.toLocaleTimeString()} (${intervalHours} hours from last feeding)`
    };
  },
});

export const babyCarePlusTools = [
  ...basicWorkspaceTools,
  calculateNextFeedingTime,
];
```

Then use in agents:
```typescript
import { babyCarePlusTools } from '../tools';

export const feedingCoachAgent = new RealtimeAgent({
  tools: babyCarePlusTools, // Instead of basicWorkspaceTools
  // ...
});
```

---

## Quick Reference Checklist

**Creating a New Suite:**

- [ ] Plan agents (3-5 is ideal)
- [ ] Design workspace templates (3-6 tabs)
- [ ] Create directory structure
- [ ] Write suite.config.ts with metadata
- [ ] Write agent prompts in prompts.ts
- [ ] Create agent files in agents/
- [ ] Wire handoffs in index.ts
- [ ] Register in agentConfigs/index.ts
- [ ] Build and test
- [ ] Verify all handoffs work
- [ ] Test workspace template creation
- [ ] Mobile testing

**Common Mistakes to Avoid:**

- ❌ Too many agents (5+ gets confusing)
- ❌ Overlapping agent responsibilities
- ❌ No clear handoff triggers
- ❌ Empty workspace templates
- ❌ Forgetting to register suite
- ❌ Not testing handoffs
- ❌ Prompts that are too long (keep under 500 words)
- ❌ Missing safety disclaimers for medical/legal domains

---

## Next Steps

1. **Try building the Baby Care Suite** using this guide
2. **Experiment with different domains** (fitness, meal planning, study coaching)
3. **Share your suites** with the community
4. **Iterate based on user feedback**

**Need help?** Check existing suites in `src/app/agentConfigs/suites/` for examples!

---

**Happy building! 🚀**


