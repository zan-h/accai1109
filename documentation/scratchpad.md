# Study Suite: Evidence-Based Learning Agent System

## Background and Motivation

**User Request:** 
> "make a study 3 agent study suite that uses the latest science around learning to help people learn. also include it in the 'complex task' category"

**Goal:**
Create a comprehensive study agent suite that incorporates evidence-based learning science to help people learn more effectively. The suite will be in the 'complex-work' category (not just 3 agents, but optimally designed for learning workflows).

**Status:**
PLANNER MODE - Designing the suite architecture and implementation plan.

## Key Challenges and Analysis

### Learning Science Principles to Incorporate

Based on the latest cognitive psychology and education research, the suite will incorporate:

**1. Spaced Repetition (Ebbinghaus Forgetting Curve)**
- Review material at increasing intervals (1 day, 3 days, 1 week, 2 weeks, 1 month)
- Combat forgetting through strategic timing
- Build long-term retention

**2. Active Recall / Retrieval Practice**
- Test yourself BEFORE reviewing notes (pre-testing effect)
- Generate answers from memory rather than passive re-reading
- Significantly more effective than highlighting or re-reading

**3. Interleaving**
- Mix topics and problem types rather than blocking (same topic repeatedly)
- Improves discrimination and flexible application
- More challenging but leads to deeper learning

**4. Elaborative Interrogation**
- Ask "why" and "how" questions
- Connect new information to existing knowledge
- Create meaningful associations

**5. Concrete Examples & Analogies**
- Link abstract concepts to concrete, relatable examples
- Use metaphors and analogies
- Dual coding: combine visual and verbal information

**6. Metacognition (Think About Thinking)**
- Reflect on what you know vs. don't know
- Identify confusion and knowledge gaps
- Plan learning strategies consciously

**7. Generation Effect**
- Produce answers/content rather than passively consuming
- Explain concepts in your own words
- Create summaries, diagrams, or teach others

**8. Testing Effect**
- Frequent low-stakes testing enhances retention
- Practice questions > passive review
- Feedback is crucial

**9. Desirable Difficulties**
- Some struggle during learning improves long-term retention
- Challenges that force deeper processing
- Balance between too easy and overwhelming

### Suite Architecture Considerations

**Agent Design:**
- Each agent specializes in a specific learning phase
- Agents use timers for focused study sessions (Pomodoro-style)
- Handoffs between study modes
- Workspace templates track progress and schedule reviews

**Workspace Templates:**
- Knowledge tracking (what to learn, what's learned)
- Spaced repetition schedule
- Active recall question bank
- Study session logs
- Confusion/question capture
- Concept maps and connections

**User Experience:**
- Beginner-friendly (anyone can use it)
- Voice-optimized for hands-free studying
- Encourages evidence-based techniques naturally
- Reduces cognitive load through guided sessions

## Suite Design: Evidence-Based Study Companion

### Suite Metadata
- **ID**: `evidence-based-study`
- **Name**: Evidence-Based Study Companion
- **Description**: Learn smarter, not harder. Voice-guided study system using spaced repetition, active recall, and proven learning science.
- **Icon**: 🎓
- **Category**: `complex-work`
- **Tags**: `study`, `learning`, `active-recall`, `spaced-repetition`, `memory`, `education`, `exam-prep`, `retention`
- **User Level**: `beginner`
- **Estimated Session**: 25-50 minutes (Pomodoro-style)

### Agents (3)

**1. Study Strategist** 🎯 (Root Agent)
- Helps plan what to learn and when
- Schedules study sessions using spaced repetition principles
- Breaks down topics into manageable chunks
- Identifies knowledge gaps through pre-testing
- Sets up study sessions with clear goals
- Manages spaced repetition schedule and interleaving
- Tracks what's been learned vs. needs review

**2. Deep Processor** 🔍
- Facilitates elaborative interrogation (asking why/how)
- Helps create concrete examples and analogies
- Builds connections between concepts
- Guides concept mapping
- Encourages explaining in own words
- Uses dual coding (visual + verbal)
- Helps understand the "why" behind concepts

**3. Active Recall & Metacognition Coach** 🧠
- Guides retrieval practice (testing yourself)
- Asks questions to generate answers from memory
- Uses "generation effect" and "testing effect"
- Creates practice questions from material
- Provides immediate feedback
- Timed study sessions with check-ins
- Helps reflect on learning process
- Identifies what you know vs. don't know
- Clarifies confusion points
- Guides self-assessment and confidence tracking
- Teaches learning strategies through practice

### Workspace Templates (2)

**1. Knowledge Tracker** (CSV)
- Topic | Status (New/Learning/Review/Mastered) | Confidence (1-5) | Last Studied | Next Review | Notes
- Tracks what you're learning with spaced repetition schedule
- Shows when to review each topic
- Records confidence levels for metacognition
- Enables evidence-based spaced repetition

**2. Active Recall Questions** (CSV)
- Question | Answer | Topic | Difficulty | Last Tested | Result | Next Test Date
- Question bank for self-testing (retrieval practice)
- Tracks testing history and performance
- Agent can quiz you from this bank
- Enables evidence-based active recall practice

**Why these 2?**
These directly support the two most effective learning techniques from research:
1. **Spaced Repetition** → Knowledge Tracker schedules reviews
2. **Active Recall/Testing Effect** → Question bank enables retrieval practice

Everything else (planning, concept maps, reflection) can be done through voice conversation with the agents.

---

## High-level Task Breakdown

### **Phase 1: Suite Structure Setup** (Executor: 10 minutes)

#### Task 1.1: Create Directory Structure
- **Action**: Create folder structure for the suite
- **Success Criteria**: 
  - Folder created at `src/app/agentConfigs/suites/evidence-based-study/`
  - `agents/` subfolder created
  - Files created: `suite.config.ts`, `prompts.ts`, `index.ts`
- **Verification**: Files exist with correct names
- **Estimated Time**: 5 minutes

---

### **Phase 2: Suite Configuration** (Executor: 20 minutes)

#### Task 2.1: Write Suite Configuration
- **Action**: Create `suite.config.ts` with metadata and workspace templates
- **Success Criteria**:
  - 2 essential workspace templates defined with sample content
  - Metadata complete (id, name, description, icon, category, tags)
  - Templates include helpful examples and structure
  - Uses dynamic dates where appropriate
  - Knowledge Tracker enables spaced repetition
  - Active Recall Questions enables testing practice
- **Verification**: File compiles without errors, templates are useful
- **Estimated Time**: 15 minutes

---

### **Phase 3: Agent Prompts** (Executor: 40 minutes)

#### Task 3.1: Write Agent System Prompts
- **Action**: Create `prompts.ts` with all 3 agent prompts
- **Content for each prompt**:
  - Role and expertise
  - Learning science principles to apply
  - Conversation flow
  - Tool usage guidelines
  - Handoff triggers
  - Voice and tone
  - Include TIMER_NOTIFICATION_GUIDELINES for Active Recall & Metacognition Coach
- **Success Criteria**:
  - All 3 prompts written (Study Strategist, Deep Processor, Active Recall & Metacognition Coach)
  - Each prompt 400-600 words (longer for merged agent)
  - Clear handoff logic
  - Incorporates learning science principles
  - Timer guidelines included for Active Recall & Metacognition Coach
  - Merged agent combines retrieval practice + self-reflection naturally
- **Verification**: Prompts are clear, actionable, and evidence-based
- **Estimated Time**: 30 minutes

---

### **Phase 4: Agent Files** (Executor: 15 minutes)

#### Task 4.1: Create Individual Agent Files
- **Action**: Create 3 agent files in `agents/` folder
- **Files to create**:
  - `studyStrategist.ts`
  - `deepProcessor.ts`
  - `activeRecallMetacognition.ts`
- **Success Criteria**:
  - Each agent imports correct prompt
  - Appropriate voice selected for each agent
  - Timer tools added to Active Recall & Metacognition Coach
  - Basic workspace tools added to all agents
  - Handoffs array initialized (empty, wired in index.ts)
- **Verification**: All files compile, agents properly configured
- **Estimated Time**: 10 minutes

---

### **Phase 5: Wire Suite Together** (Executor: 10 minutes)

#### Task 5.1: Create Suite Index with Handoffs
- **Action**: Create `index.ts` to wire agents together
- **Success Criteria**: 
  - Import all agents
  - Wire handoffs between agents (logical study workflow)
  - Export complete AgentSuite
  - Set Study Strategist as root agent
  - Include moderation guardrail
- **Verification**: No circular dependencies, handoffs make sense
- **Estimated Time**: 10 minutes

---

### **Phase 6: Register Suite** (Executor: 5 minutes)

#### Task 6.1: Register in Main Config
- **Action**: Add suite to `src/app/agentConfigs/index.ts`
- **Success Criteria**:
  - Import statement added
  - Suite registered in registry
  - No duplicate IDs
- **Verification**: Build succeeds, no errors
- **Estimated Time**: 5 minutes

---

### **Phase 7: Build & Test** (Executor: 10 minutes)

#### Task 7.1: Verify Build
- **Action**: Run build and check for errors
- **Success Criteria**:
  - `npm run build` succeeds
  - No TypeScript errors
  - No linting errors
- **Verification**: Clean build output
- **Estimated Time**: 5 minutes

#### Task 7.2: Manual UI Test
- **Action**: Start dev server and verify suite appears
- **Success Criteria**:
  - Suite appears in suite selector
  - Icon, name, description correct
  - All 3 agents listed
  - Category shows "complex-work"
- **Verification**: Suite visible and configured correctly
- **Estimated Time**: 5 minutes

---

### **Phase 8: Functional Testing** (Executor: 20 minutes)

#### Task 8.1: Test Workspace Initialization
- **Action**: Select suite and start new session
- **Success Criteria**:
  - 2 workspace tabs created (Knowledge Tracker, Active Recall Questions)
  - Templates load with correct content
  - Dynamic dates populated
  - CSV tabs render correctly
- **Verification**: Workspace initializes properly
- **Estimated Time**: 5 minutes

#### Task 8.2: Test Agent Connection
- **Action**: Connect to Study Strategist
- **Success Criteria**:
  - Voice connection establishes
  - Agent responds appropriately
  - Can speak and receive responses
  - Agent personality matches prompt
- **Verification**: Voice agent works correctly
- **Estimated Time**: 5 minutes

#### Task 8.3: Test Agent Handoffs
- **Action**: Trigger handoffs between agents
- **Success Criteria**:
  - Request transition to Active Recall & Metacognition Coach → handoff occurs
  - Request transition to Deep Processor → handoff occurs
  - Request transition back to Study Strategist → handoff occurs
  - Transcript shows handoff messages
  - All handoff paths work (3 agents can reach each other)
- **Verification**: Handoffs function smoothly
- **Estimated Time**: 10 minutes

---

### **Phase 9: Timer Integration Testing** (Executor: 10 minutes)

#### Task 9.1: Test Timer Functionality with Active Recall & Metacognition Coach
- **Action**: Ask Active Recall & Metacognition Coach to start a study timer
- **Success Criteria**:
  - Timer starts and displays correctly
  - Agent checks in at intervals (if enabled)
  - Timer notifications work
  - Can pause/resume/stop timer
  - Agent combines retrieval practice with metacognitive reflection
- **Verification**: Timer integration works with agent
- **Estimated Time**: 10 minutes

---

### **Phase 10: User Experience Testing** (Executor: 15 minutes)

#### Task 10.1: Test Complete Study Workflow
- **Action**: Run through realistic study scenario
- **Scenario**:
  1. Start with Study Strategist - plan learning "React Hooks"
  2. Study Strategist adds "React Hooks" to Knowledge Tracker
  3. Hand off to Deep Processor - understand useState deeply with "why" questions
  4. Hand off to Active Recall & Metacognition Coach - test knowledge and reflect
  5. Coach adds questions to Active Recall Questions bank
  6. Back to Study Strategist - schedule next review in Knowledge Tracker
  7. Verify both workspace tabs updated correctly
- **Success Criteria**:
  - Workflow feels natural and helpful
  - Agents guide toward evidence-based techniques
  - Knowledge Tracker shows topics with review dates
  - Active Recall Questions populated with test questions
  - Learning science principles are evident in practice
  - The merged Active Recall & Metacognition agent flows naturally
- **Verification**: Suite provides genuine value for learning
- **Estimated Time**: 15 minutes

---

### **Phase 11: Documentation** (Executor: 15 minutes)

#### Task 11.1: Document Suite Features
- **Action**: Create README for suite (optional, if needed for team)
- **Contents**:
  - Learning science principles used
  - Agent descriptions
  - How to use the suite effectively
  - Example workflows
  - Tips for maximizing retention
- **Success Criteria**: Clear documentation exists
- **Verification**: Readable and helpful
- **Estimated Time**: 15 minutes (optional)

---

## **Total Estimated Time**: 2-2.5 hours

---

## Project Status Board

**Current Phase: PLANNER MODE - Design Complete**

### Quick Reference Checklist

**Phase 1: Suite Structure Setup**
- [x] 1.1: Create directory structure

**Phase 2: Suite Configuration**
- [x] 2.1: Write suite.config.ts with 2 essential workspace templates

**Phase 3: Agent Prompts**
- [x] 3.1: Write all 3 agent system prompts

**Phase 4: Agent Files**
- [x] 4.1: Create 3 individual agent files

**Phase 5: Wire Suite Together**
- [x] 5.1: Create index.ts with handoffs

**Phase 6: Register Suite**
- [x] 6.1: Register in main config

**Phase 7: Build & Test**
- [x] 7.1: Verify build succeeds ✅ Build successful!
- [ ] 7.2: Manual UI test - IN PROGRESS

**Phase 8: Functional Testing**
- [ ] 8.1: Test workspace initialization
- [ ] 8.2: Test agent connection
- [ ] 8.3: Test agent handoffs

**Phase 9: Timer Integration Testing**
- [ ] 9.1: Test timer functionality with Active Recall Coach

**Phase 10: User Experience Testing**
- [ ] 10.1: Test complete study workflow

**Phase 11: Documentation (Optional)**
- [ ] 11.1: Document suite features

---

## Critical Information for Executor

### Repository Details
- **Root**: `/Users/mizan/100MRR/accai adhd/14-voice-agents/realtime-workspace-agents/`
- **Suite Location**: `src/app/agentConfigs/suites/evidence-based-study/`
- **Framework**: Next.js 15.3.1 with OpenAI Agents SDK

### Key Files to Reference
- **Suite Template**: `src/app/agentConfigs/suites/_suite-template/` (starter template)
- **Example Suites**: 
  - `writing-companion/` (7 agents, complex workflow)
  - `gtd/` (5 agents, productivity focus)
  - `baby-care/` (5 agents, caregiving)
- **Types**: `src/app/agentConfigs/types.ts` (SuiteConfig, AgentSuite interfaces)
- **Timer Tools**: `src/app/agentConfigs/shared/tools/workspace/timerTools.ts`
- **Timer Guidelines**: `src/app/agentConfigs/shared/prompts/timerNotifications.ts`
- **Workspace Tools**: `src/app/agentConfigs/shared/tools/workspace/workspaceTools.ts`
- **Guide**: `CREATING_NEW_SUITES.md` (complete implementation guide)

### Learning Science Principles to Implement

**Core Techniques:**
1. **Spaced Repetition** - Review Scheduler manages timing
2. **Active Recall** - Active Recall Coach tests memory
3. **Elaborative Interrogation** - Deep Processor asks why/how
4. **Interleaving** - Review Scheduler mixes topics
5. **Metacognition** - Metacognition Guide tracks awareness
6. **Generation Effect** - Produce answers from memory
7. **Testing Effect** - Frequent low-stakes practice
8. **Concrete Examples** - Deep Processor creates analogies

**Research Citations** (for prompt design):
- Ebbinghaus Forgetting Curve (spaced repetition)
- Roediger & Karpicke (retrieval practice)
- Kornell & Bjork (interleaving)
- Dunlosky et al. (learning techniques effectiveness)

### Voice Selection Guidelines
- **Study Strategist**: `shimmer` (encouraging, organized, systematic)
- **Deep Processor**: `alloy` (thoughtful, patient, philosophical)
- **Active Recall & Metacognition Coach**: `echo` (clear, focused, reflective)

### Timer Integration
- Active Recall & Metacognition Coach should include timer tools for study sessions
- Import: `import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';`
- Add to tools array: `tools: [...basicWorkspaceTools, ...timerTools]`
- Include in prompt: `import { TIMER_NOTIFICATION_GUIDELINES } from '../../shared/prompts/timerNotifications';`

---

## Executor's Feedback or Assistance Requests

**Status**: ✅ **EXECUTOR MODE - CODEBASE CLEANUP COMPLETED**

**Task Completed:** Removed all non-necessary elements from the codebase

**What Was Removed:**

**Unused Dependencies Removed:**
- `gsap` - NOT USED (0 files)
- `react-intersection-observer` - NOT USED (0 files)
- `@react-three/drei` - Only used for decorative ParticleField
- `@react-three/fiber` - Only used for decorative ParticleField
- `three` - Only used for decorative ParticleField
- `locomotive-scroll` - Only used for SmoothScroll component
- `@types/three` - Dev dependency for unused Three.js

**Unnecessary Components Removed:**
- `src/app/components/ambient/ParticleField.tsx` - Decorative WebGL particles (DELETED)
- `src/app/components/ambient/GradientMesh.tsx` - Decorative gradient background (DELETED)
- `src/app/components/SmoothScroll.tsx` - Smooth scrolling wrapper (DELETED)
- `src/app/components/ambient/` - Empty folder (DELETED)

**Code Changes Made:**
1. **App.tsx**:
   - Removed imports for GradientMesh and ParticleField
   - Removed JSX rendering of ambient components
   - Removed `particlesEnabled` state and related useEffect hooks
   - Removed `particlesEnabled` from settings state

2. **layout.tsx**:
   - Removed SmoothScroll import
   - Removed SmoothScroll wrapper from JSX

3. **SettingsModal.tsx**:
   - Removed `particlesEnabled` from settings interface
   - Removed "Particle Effects" toggle from UI

4. **package.json**:
   - Removed 7 unused dependencies
   - Added `zustand` (was missing, required by useExperimentStore)

**Additional Maintenance:**
- ✅ Ran `npm install` to update package-lock.json
- ✅ Ran `npm audit fix` to fix 3 security vulnerabilities (1 critical, 1 high, 1 moderate)
- ✅ Code compiles successfully
- ✅ Type checking passes
- ✅ No linting errors

**Verification:**
- Build command: `npm run build` - Compiles successfully ✓
- No imports of removed dependencies remain in codebase ✓
- All deleted components removed from imports ✓

**Note:** Chainlit was not found in the codebase (never existed). Canvas-confetti is retained as it's actively used by the Timer component for celebration effects.

---

## Lessons

### Study Suite Design Lessons

**Lesson 1: Evidence-based learning techniques**
The most effective learning techniques backed by research are:
1. Spaced repetition (Ebbinghaus)
2. Active recall / retrieval practice
3. Interleaving (mixing topics)
4. Elaborative interrogation (asking why)
5. Concrete examples and analogies
6. Metacognition (self-awareness)
7. Testing effect (practice testing)
8. Generation effect (producing answers)

**Lesson 2: Suite structure best practices**
- 3-5 agents is optimal (not too many to overwhelm)
- Each agent should have clear scope and handoff triggers
- Root agent should be the natural entry point
- Category: `complex-work` for sophisticated workflows
- Include timer tools for time-bounded activities

**Lesson 3: Workspace templates should be minimal and focused**
- Include sample data to show format
- Use dynamic dates where appropriate
- **Less is more** - 2 essential templates better than 7 optional ones
- Focus on templates that enable core learning science:
  - Knowledge Tracker for spaced repetition
  - Active Recall Questions for testing effect
- Everything else (planning, reflection, concept maps) can be voice conversation
- Templates should directly support the most effective techniques

**Lesson 4: Learning science in practice**
- Don't just mention techniques - guide users to apply them
- Use timers for focused study sessions (Pomodoro)
- Track progress to enable spaced repetition
- Pre-testing reveals knowledge gaps
- Explain concepts in own words (generation effect)

**Lesson 5: Agent voices should match personality**
- Study Strategist: `shimmer` (encouraging, organized, systematic)
- Deep Processor: `alloy` (thoughtful, patient, philosophical)
- Active Recall & Metacognition Coach: `echo` (clear, focused, reflective)

---

### General Project Lessons (Retained)

**Lesson 6: Simple is better**
Initial plan was overly complex with shared guidelines, multi-phase rollout, etc. User correctly identified that we just needed to update the system prompts directly. This saved significant time and complexity.

**Lesson 7: Agent prompts are powerful**
Each agent can handle multiple modes (thoughtful setup vs quick start) based on simple natural language instructions. No code changes needed - just clear prompt instructions.

**Lesson 8: Include info useful for debugging in the program output**
Always add helpful logging and error messages in production.

**Lesson 9: Read the file before you try to edit it**
Always verify file contents before making changes to avoid errors.

**Lesson 10: Security practices**
- Run `npm audit` if vulnerabilities appear in terminal
- Always ask before using `-force` git commands
- Never commit `.env.local` or secrets to repository

**Lesson 11: Supabase Generated Types**
When Supabase types (`src/app/lib/supabase/types.ts`) are out of sync with the database schema (missing tables), the build will fail with type errors. **Temporary fix:** cast to `any`. **Permanent fix:** Regenerate types using `supabase gen types`.

**Lesson 12: Codebase Cleanup Best Practices**
When removing unused dependencies and components:
1. Search for imports before removing packages (use grep to find usage)
2. Remove component files first, then update imports in parent components
3. Clean up related state management (e.g., settings, localStorage)
4. Remove dependencies from package.json last
5. Always run `npm install` after modifying package.json
6. Run `npm audit fix` to address any security vulnerabilities
7. Verify build compiles successfully (code + types)
8. Check for hidden dependencies (e.g., zustand was missing but required)
9. Keep dependencies that are actively used (e.g., canvas-confetti for Timer)
10. Empty folders should be removed to keep structure clean
