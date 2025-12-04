# Baby Care Suite Implementation - AI Assistant Prompt

**Copy this entire prompt to give to Claude, GPT, or any AI coding assistant**

---

## Your Mission

Implement a **Baby Care Companion** voice agent suite for a Next.js application with OpenAI Realtime API. This suite helps users care for an infant with 5 specialized AI voice agents, workspace templates for tracking, and intelligent handoffs.

## Context

You're working in an existing multi-suite voice agent system that already has:
- ✅ Suite registry and auto-discovery
- ✅ Suite selector UI component
- ✅ Workspace template initialization
- ✅ Agent handoff system
- ✅ One example suite (Energy & Focus)

**Your job:** Add a second suite for baby care.

**Project Location:** `/Users/mizan/100MRR/bh-refactor/14-voice-agents/realtime-workspace-agents/`

## Reference Documents

You have access to these guides:
1. **`CREATING_NEW_SUITES.md`** - Complete step-by-step guide (800+ lines)
2. **`src/app/agentConfigs/suites/energy-focus/`** - Working example suite
3. **`src/app/agentConfigs/types.ts`** - Type definitions

**READ `CREATING_NEW_SUITES.md` FIRST** - It contains all the code you need!

## What to Build

### Suite Overview

**Name:** Baby Care Companion  
**Icon:** 👶  
**ID:** `baby-care`  
**Category:** `mental-health`

### 5 Voice Agents

1. **Feeding Coach** (`feedingCoach`) - Voice: `sage`
   - Tracks feeding schedules, amounts, nutrition
   - Answers bottle/formula questions
   - Root agent (users start here)

2. **Sleep Specialist** (`sleepSpecialist`) - Voice: `alloy`
   - Monitors sleep patterns and schedules
   - Suggests age-appropriate nap routines
   - Helps with sleep training

3. **Development Tracker** (`developmentTracker`) - Voice: `shimmer`
   - Tracks milestones (rolling, sitting, crawling)
   - Suggests age-appropriate activities
   - Celebrates achievements

4. **Health Monitor** (`healthMonitor`) - Voice: `echo`
   - Monitors temperature, symptoms
   - Tracks medications
   - Knows when to escalate to doctor

5. **Calming Coach** (`calmingCoach`) - Voice: `verse`
   - Teaches soothing techniques
   - Supports stressed caregivers
   - Helps read baby's cues

### 6 Workspace Templates

1. **Feeding Log** (CSV) - Time, Type, Amount, Notes
2. **Sleep Schedule** (CSV) - Date, Start, Wake, Duration, Quality
3. **Daily Care Log** (CSV) - Diapers, baths, activities
4. **Health Journal** (Markdown) - Vitals, symptoms, medications
5. **Milestones** (Markdown) - Developmental tracking
6. **Emergency Info** (Markdown) - Contacts, medical info

## Implementation Instructions

### Step 1: Read the Guide (CRITICAL)

**Open and read:** `CREATING_NEW_SUITES.md`

This file contains:
- Complete code for ALL agents
- Complete workspace templates
- Agent prompts (500+ lines)
- File structure
- Registration instructions

**Do NOT skip this step!** All the code you need is already written there.

### Step 2: Create Directory Structure

```bash
cd src/app/agentConfigs/suites
mkdir -p baby-care/agents
touch baby-care/suite.config.ts
touch baby-care/prompts.ts
touch baby-care/index.ts
touch baby-care/agents/feedingCoach.ts
touch baby-care/agents/sleepSpecialist.ts
touch baby-care/agents/developmentTracker.ts
touch baby-care/agents/healthMonitor.ts
touch baby-care/agents/calmingCoach.ts
```

### Step 3: Copy Code from Guide

**All the code is in `CREATING_NEW_SUITES.md`!**

Copy from the guide into these files:

1. **`suite.config.ts`** → Section "Phase 2: Define Suite Configuration"
2. **`prompts.ts`** → Section "Phase 3: Write Agent Prompts"
3. **`agents/feedingCoach.ts`** → Section "Phase 4: Create Agent Files"
4. **`agents/sleepSpecialist.ts`** → Section "Phase 4"
5. **`agents/developmentTracker.ts`** → Section "Phase 4"
6. **`agents/healthMonitor.ts`** → Section "Phase 4"
7. **`agents/calmingCoach.ts`** → Section "Phase 4"
8. **`index.ts`** → Section "Phase 5: Wire Up Suite"

### Step 4: Register Suite

**File:** `src/app/agentConfigs/index.ts`

Add these lines after the existing `energyFocusSuite` registration:

```typescript
// Add import at top
import babyCareSuite from './suites/baby-care';

// Add registration (after existing suites)
registerSuiteManually(suiteRegistry, babyCareSuite);
```

### Step 5: Build & Test

```bash
npm run build
# Should see: ✅ Registered suite: Baby Care Companion (baby-care)

npm run dev
# Open http://localhost:3000
```

## Success Criteria

After implementation, verify:

### Build & Registration
- [ ] `npm run build` succeeds
- [ ] Console shows: `✅ Registered suite: Baby Care Companion (baby-care)`
- [ ] Console shows: `📦 Registered suites: [ 'energy-focus', 'baby-care' ]`
- [ ] No TypeScript errors

### UI Verification
- [ ] Suite selector shows 2 suites
- [ ] Baby Care suite has 👶 icon
- [ ] Description displays correctly
- [ ] Shows "5 agents" count
- [ ] Clicking "Learn More" expands to show all 5 agents

### Workspace Templates
- [ ] Selecting suite creates 6 tabs
- [ ] Tab names match specification
- [ ] CSV tabs have pipe-delimited format
- [ ] Markdown tabs have proper headers
- [ ] Emergency Info tab has contact fields

### Voice Interaction
- [ ] Can connect to feedingCoach
- [ ] Agent responds to voice
- [ ] Agent can create/edit workspace tabs
- [ ] Asking about sleep triggers handoff to sleepSpecialist
- [ ] Asking about milestones triggers handoff to developmentTracker
- [ ] All 5 agents reachable via handoffs

### Edge Cases
- [ ] Refresh page → suite persists
- [ ] Switch between suites → workspace changes
- [ ] Disconnect/reconnect works
- [ ] Project switching works (Cmd+P)

## Testing Script

Run this test sequence:

```markdown
1. Open http://localhost:3000
2. Suite selector appears
3. See "Baby Care Companion" with 👶
4. Click "Learn More"
5. See 5 agents listed
6. Click "Start Session"
7. 6 workspace tabs appear
8. Click "Connect"
9. Say: "I just fed the baby 4 ounces at 9am"
   → feedingCoach should respond and offer to log it
10. Say: "The baby won't sleep"
   → Should handoff to sleepSpecialist
11. Say: "What milestones should I watch for?"
   → Should handoff to developmentTracker
12. Say: "The baby has a fever"
   → Should handoff to healthMonitor
13. Say: "The baby won't stop crying"
   → Should handoff to calmingCoach
```

All handoffs should work smoothly!

## Common Issues & Solutions

### Issue: "Cannot find module './suites/baby-care'"
**Fix:** Check file paths match exactly:
```
src/app/agentConfigs/suites/baby-care/index.ts
```

### Issue: "Suite validation failed"
**Fix:** Verify suite.config.ts has all required fields:
- id, name, description, icon, category, tags (array)
- workspaceTemplates (array with 6 items)

### Issue: "Agent not found in handoffs"
**Fix:** Check index.ts - all 5 agents should be in the `agents` array

### Issue: Build succeeds but suite doesn't appear
**Fix:** Make sure you registered in `agentConfigs/index.ts`:
```typescript
registerSuiteManually(suiteRegistry, babyCareSuite);
```

### Issue: Workspace templates not appearing
**Fix:** Check `workspaceTemplates` array in suite.config.ts has `type: 'csv'` or `type: 'markdown'`

### Issue: Handoffs not working
**Fix:** Verify in `index.ts` that handoffs are wired:
```typescript
agents.forEach(agent => {
  const otherAgents = agents.filter(a => a !== agent);
  (agent.handoffs as any).push(...otherAgents);
});
```

## Code Style Guidelines

Match the existing codebase:
- Use TypeScript
- Export with `export default` for suites
- Use `basicWorkspaceTools` from shared tools
- Follow naming: camelCase for agent names
- Voice options: sage, alloy, shimmer, echo, verse
- Keep prompts under 500 words each
- Use monospace fonts in UI (font-mono class)

## Time Estimate

- Reading guide: 15-20 minutes
- Copy/pasting code: 15-20 minutes
- Testing: 10-15 minutes
- **Total: 40-55 minutes**

Most of the work is already done in the guide!

## Your Workflow

1. ✅ Read `CREATING_NEW_SUITES.md` completely
2. ✅ Create directory structure
3. ✅ Copy code from guide into files
4. ✅ Register suite in index.ts
5. ✅ Build and test
6. ✅ Verify all 13 success criteria
7. ✅ Run testing script
8. ✅ Report completion

## Reporting Results

When done, provide:

**Summary:**
```
✅ Suite created: Baby Care Companion
✅ Agents: 5 (feedingCoach, sleepSpecialist, developmentTracker, healthMonitor, calmingCoach)
✅ Templates: 6 workspace tabs
✅ Build status: Success
✅ Tests passed: [X/13]
```

**Screenshots:**
- Suite selector showing both suites
- Workspace with 6 tabs
- Example of handoff in transcript

**Issues Encountered:**
- List any problems and how you solved them

## Important Notes

- **ALL CODE IS PROVIDED** in `CREATING_NEW_SUITES.md` - you should mostly be copy/pasting!
- **Don't rewrite the prompts** - they're carefully designed, use them as-is
- **Test handoffs thoroughly** - this is the most important feature
- **Safety first** - The healthMonitor has medical disclaimers, keep them
- **Agent voices matter** - Each agent has a distinct voice for personality

## Questions?

If you encounter issues:
1. Check `CREATING_NEW_SUITES.md` troubleshooting section
2. Look at `energy-focus` suite as working example
3. Verify file paths match exactly
4. Check build output for specific errors

---

**Ready? Start by reading `CREATING_NEW_SUITES.md`!** 🚀

All the code you need is already written there. This should take 40-55 minutes total.

