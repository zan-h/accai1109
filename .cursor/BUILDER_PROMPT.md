# Multi-Suite Agent System - Builder Prompt

**Copy this entire prompt to give to an AI model (Claude, GPT, etc.) to implement the feature**

---

## Your Mission

You are tasked with implementing a **multi-suite voice agent system** for a Next.js application. This system will allow users to choose from multiple collections of AI voice agents, each specialized for different use cases (productivity, coaching, planning, etc.).

## Current System

The application currently has:
- A single "workspace builder" scenario with 3 agents (Energy Coach, Task Strategist, Body Doubling)
- Voice interaction via OpenAI Realtime API
- Agent handoffs (agents can transfer conversations to each other)
- Guardrail system (validates agent outputs before speaking)
- Workspace with tabs (markdown, CSV)

**Location**: `/Users/mizan/100MRR/bh-refactor/14-voice-agents/realtime-workspace-agents/`

## What You're Building

Transform the system from a single scenario to a **multi-suite architecture** where:

1. **Users can choose from multiple agent suites** (like choosing a specialized assistant)
2. **Each suite has 3+ specialized agents** working together
3. **Suites are auto-discovered** (just add a folder, it appears in the UI)
4. **Easy suite creation** (5 minutes to add a new suite)
5. **Beautiful suite selector UI** (search, filter, preview agents)
6. **Workspace templates per suite** (each suite initializes with relevant tabs)

## Implementation Guide

You have **4 comprehensive documentation files** to guide you:

### 1. `MULTI_AGENT_ARCHITECTURE_ANALYSIS.md` (2,084 lines)
**Purpose**: Understand the current system
**Read**: Sections 1-4 (how agents, handoffs, and guardrails work)
**Key Info**: 
- How RealtimeAgent works
- How handoffs are triggered
- How guardrails intercept outputs
- Current file structure

### 2. `AGENT_SUITE_ARCHITECTURE.md` (1,100+ lines)
**Purpose**: Understand the target architecture
**Read**: Sections 1-3, 6-9 (architecture, types, developer guide)
**Key Info**:
- Directory structure for suites
- Suite registry with auto-discovery
- Shared infrastructure (tools, guardrails)
- How to create new suites

### 3. `AGENT_SUITE_UX_DESIGN.md` (1,400+ lines)
**Purpose**: Understand user experience
**Read**: Sections 1-4, 7 (user flows, UI designs, interactions)
**Key Info**:
- Suite selector component designs
- User journey maps
- Interaction patterns
- Mobile experience

### 4. `IMPLEMENTATION_PLAN.md` (1,800+ lines) ⭐ **YOUR PRIMARY GUIDE**
**Purpose**: Step-by-step implementation instructions
**Read**: ALL sections
**Follow**: Sequentially, task by task

## How to Use the Implementation Plan

The implementation plan has **7 Phases** with **50+ tasks**:

```
Phase 1: Foundation (Days 1-3)
├─ Task 1.1: Create Type Definitions
├─ Task 1.2: Create Shared Tools Directory
├─ Task 1.3: Create Utils
└─ Task 1.4: Create Suites Directory Structure

Phase 2: Suite Registry System (Days 4-5)
├─ Task 2.1: Create Suite Registry
└─ Task 2.2: Manual Suite Registration Helper

Phase 3: UI Components (Days 6-8)
├─ Task 3.1: Create SuiteIndicator Component
├─ Task 3.2: Create SuiteCard Component
├─ Task 3.3: Create SuiteSelector Component
└─ Task 3.4: Create Workspace Initialization Helper

Phase 4: Migration (Days 9-10)
├─ Task 4.1: Create Energy-Focus Suite Config
├─ Task 4.2: Move Agents to Suite Directory
├─ Task 4.3: Create Suite Index
└─ Task 4.4: Register Energy-Focus Suite

Phase 5: New Suites (Days 11-13)
├─ Task 5.1: Create Agency Suite
└─ Task 5.2: Create Strategic Planning Suite

Phase 6: App Integration (Days 14-15)
├─ Task 6.1: Update App.tsx
└─ Task 6.2: Add Welcome Screen

Phase 7: Polish & Testing (Days 16-17)
├─ Task 7.1: Add Loading States
├─ Task 7.2: Add Error Boundaries
└─ Task 7.3: Comprehensive Testing
```

### For Each Task:

1. **Read the task description** (time estimate, prerequisites)
2. **Follow the step-by-step instructions** (file paths, code provided)
3. **Implement the code** (all TypeScript code is provided)
4. **Test** (commands and expected results provided)
5. **Check success criteria** (checkboxes at end of each task)
6. **If all ✅ pass** → Move to next task
7. **If any ❌ fail** → Use debug steps in troubleshooting section

## Your Workflow

### Step 1: Setup & Verification (Day 1, Hour 1)

```bash
# Navigate to project
cd /Users/mizan/100MRR/bh-refactor/14-voice-agents/realtime-workspace-agents

# Verify environment
node --version  # Should be 18+
npm run dev     # Should start without errors

# Read prerequisites section in IMPLEMENTATION_PLAN.md
# Verify all requirements met
```

### Step 2: Read Documentation (Day 1, Hours 2-4)

**Priority order:**
1. Read `IMPLEMENTATION_PLAN.md` - Section "Prerequisites & Setup"
2. Skim `MULTI_AGENT_ARCHITECTURE_ANALYSIS.md` - Sections 1-4
3. Skim `AGENT_SUITE_ARCHITECTURE.md` - Sections 1-3
4. Skim `AGENT_SUITE_UX_DESIGN.md` - Section 4 (screen designs)

**Goal**: Understand what you're building before writing code.

### Step 3: Implementation (Days 1-15)

**Follow `IMPLEMENTATION_PLAN.md` exactly:**

```markdown
Current Phase: Phase 1
Current Task: Task 1.1

□ Read task description
□ Follow step-by-step instructions  
□ Implement code (provided in doc)
□ Run test commands
□ Verify success criteria
□ If pass → next task
□ If fail → debug

Repeat for all 50+ tasks
```

### Step 4: Testing (Days 16-17)

**Use testing procedures in `IMPLEMENTATION_PLAN.md`:**
- Manual test scripts (provided)
- Automated tests (code provided)
- Edge case testing
- Performance testing
- Accessibility testing

### Step 5: Report Completion

When done, provide:
- ✅ All phases completed
- ✅ All tests passing
- ✅ Screenshots of suite selector
- ✅ Video of suite switching
- ✅ Any issues encountered

## Important Guidelines

### DO:
✅ Follow the implementation plan **sequentially**
✅ Test after **every task** (don't skip testing)
✅ Use the **exact code provided** (it's production-ready)
✅ Check success criteria for each task
✅ Commit after each phase
✅ Reference the architecture docs when unclear
✅ Report blockers immediately

### DON'T:
❌ Skip ahead to later phases
❌ Modify existing agent functionality (backwards compatible)
❌ Ignore TypeScript errors
❌ Skip testing steps
❌ Deviate from the architecture without asking
❌ Create new patterns not in the docs

## Code Quality Standards

All code must:
- ✅ Pass TypeScript compilation (`npm run build`)
- ✅ Follow existing code style (monospace fonts, terminal aesthetic)
- ✅ Include proper types (no `any` unless necessary)
- ✅ Have proper error handling
- ✅ Be keyboard accessible
- ✅ Work on mobile
- ✅ Include ARIA labels

## When to Ask for Help

Ask the user if you encounter:
- ❓ Architectural decisions not covered in docs
- ❓ Existing code conflicts with plan
- ❓ API changes or deprecated features
- ❓ Unclear requirements
- ❓ Performance issues
- ❓ Security concerns

**Don't get stuck silently!** Report blockers immediately.

## Expected Deliverables

After completing all phases, the system will have:

### Functional Features:
- ✅ Suite selector modal with search/filter
- ✅ 3+ working suites (Energy, Agency, Strategic)
- ✅ 9+ voice agents total
- ✅ Auto-discovery (add suite = auto-appear)
- ✅ Suite switching mid-session
- ✅ Workspace templates per suite
- ✅ Persistence across refreshes
- ✅ Mobile responsive UI
- ✅ Keyboard accessible

### Technical Deliverables:
- ✅ New directory structure (`suites/`)
- ✅ Type definitions (`types.ts`)
- ✅ Suite registry system
- ✅ Validation with Zod
- ✅ UI components (SuiteSelector, SuiteCard, SuiteIndicator)
- ✅ Updated App.tsx
- ✅ Migration of existing scenario
- ✅ 2 new example suites
- ✅ Test suite
- ✅ Error handling
- ✅ Loading states

### Documentation:
- ✅ Code comments
- ✅ README updates
- ✅ Git commit messages (clear, descriptive)

## Quick Reference

### File Locations (All Provided in Implementation Plan):

```
src/app/agentConfigs/
├── types.ts                     [Create in Phase 1]
├── index.ts                     [Update in Phase 2]
├── shared/                      [Create in Phase 1]
│   ├── tools/workspace/
│   ├── guardrails/
│   └── prompts/
├── suites/                      [Create in Phase 1]
│   ├── energy-focus/           [Migrate in Phase 4]
│   ├── agency/                 [Create in Phase 5]
│   └── strategic-planning/     [Create in Phase 5]
└── utils/                       [Create in Phase 1]
    ├── suiteDiscovery.ts
    └── suiteValidator.ts

src/app/components/
├── SuiteSelector.tsx           [Create in Phase 3]
├── SuiteCard.tsx               [Create in Phase 3]
├── SuiteIndicator.tsx          [Create in Phase 3]
└── WelcomeScreen.tsx           [Create in Phase 6]
```

### Key Commands:

```bash
# Development
npm run dev              # Start dev server

# Testing
npm run build            # Verify TypeScript compiles
npm test                 # Run tests (after Phase 7)

# Git
git add .
git commit -m "feat: [description]"
git status
```

### Success Checkpoints:

After each phase, verify:
- **Phase 1**: Types compile, directories created
- **Phase 2**: Registry returns suites
- **Phase 3**: UI components render
- **Phase 4**: Energy suite works like before
- **Phase 5**: New suites selectable
- **Phase 6**: Full app works end-to-end
- **Phase 7**: All tests pass

## Timeline Estimate

- **With AI assistance**: 15-17 days
- **Working 4-6 hours/day**: 60-100 hours
- **Per phase**: 2-3 days

## Getting Started

**Your first action should be:**

1. Navigate to project directory
2. Run `npm run dev` to verify app works
3. Open `IMPLEMENTATION_PLAN.md`
4. Read "Prerequisites & Setup" section
5. Begin Phase 1, Task 1.1
6. Follow the plan step-by-step

## Example: Your First Task

Here's what your first task looks like (from IMPLEMENTATION_PLAN.md):

```markdown
### Task 1.1: Create Type Definitions (1-2 hours)

**File**: src/app/agentConfigs/types.ts

**Action**: Create comprehensive TypeScript types for suite system.

[300+ lines of complete TypeScript code provided in doc]

**Testing**:
npm run build
# Should compile without errors

**Success Criteria**:
- [ ] File created at correct location
- [ ] No TypeScript compilation errors
- [ ] Types are exported correctly
- [ ] Existing code still compiles

✅ All pass → Move to Task 1.2
❌ Any fail → Check troubleshooting section
```

## Questions?

If anything is unclear:
1. Check the implementation plan troubleshooting section
2. Reference the architecture documents
3. Ask the user for clarification

## Ready to Start?

Your mission is clear:
- ✅ Read the documentation
- ✅ Follow the implementation plan
- ✅ Test after each task
- ✅ Report progress/blockers
- ✅ Build an amazing multi-suite agent system

**Good luck! You have everything you need to succeed.** 🚀

---

**Start Command:**
```bash
cd /Users/mizan/100MRR/bh-refactor/14-voice-agents/realtime-workspace-agents
npm run dev
# Then open IMPLEMENTATION_PLAN.md and begin Phase 1, Task 1.1
```

