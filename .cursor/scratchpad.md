Background and Motivation
The current repo contains a Next.js demo of multi-agent realtime voice interactions using the OpenAI Realtime SDK. Scenarios include real estate, customer service retail, a chat supervisor pattern, a workspace builder, and a simple handoff. The goal is to generalize this into "various agents that support a user to do great, embodied work," shifting from vertical demos to a reusable multi-agent substrate (voice-first, tool-using, handoff-capable, guardrail-aware) that can be specialized per domain.

**NEW PROJECT REQUEST:** Transform workspaceBuilder scenario into an ADHD/embodied work productivity system that helps users plan their work day based on tasks, energy levels, emotional regulation needs, and body doubling requirements. This aligns perfectly with the "embodied work" vision and Joe Hudson's productivity principles.

Key Challenges and Analysis
- Agent composition: Each scenario wires multiple `RealtimeAgent`s with explicit `handoffs`. We need a more generic "role" taxonomy and plug-in tools for embodied tasks.
- Orchestration: Today, the client selects a scenario and connects to a session with a chosen root agent; handoffs are local in agent config. For generalization, we'll need a supervisor or router that can resolve tasks to the right agent set dynamically.
- Guardrails: Moderation guardrails are scenario/company-specific. We need a modular guardrail registry with domain-aware policies and tripwire feedback into transcript UI.
- Tooling: Tools are implemented as Realtime function tools or proxied via `/api/responses`. We need a common tool catalog for embodied work (e.g., sensor/controls, file ops, scheduling, spatial tasks) and a policy for what runs client vs server.
- Realtime and audio: `useRealtimeSession` manages WebRTC, codec selection, VAD, push-to-talk. Generalization should keep this but allow agent set swapping and multi-modal inputs.

Current System Design (as implemented)
- Scenarios registry
  - File: `src/app/agentConfigs/scenarios/index.ts`
  - Exposes `allAgentSets` keyed by scenario: `workspaceBuilder`, `realEstateBroker`, `chatSupervisor`, `customerServiceRetail`, `simpleHandoff`; `defaultAgentSetKey = 'workspaceBuilder'`.
- Real Estate Broker
  - File: `scenarios/realEstateBroker/index.ts`
  - Agents: `intake` (greeter → requirements capture), `broker` (advice). Handoff: `intake -> broker`.
- Customer Service Retail
  - File: `scenarios/customerServiceRetail/index.ts`
  - Agents: `authentication`, `returns`, `sales`, `simulatedHuman`. Mutual handoffs across all.
  - `authentication` includes a strong verification flow and scripted disclosure; tool calls like `authenticate_user_information`, `save_or_update_address`, `update_user_offer_response` (defined in its file).
  - Company: `Snowy Peak Boards` (used by guardrails).
- Chat Supervisor Pattern
  - Files: `scenarios/chatSupervisor/index.ts`, `scenarios/chatSupervisor/supervisorAgent.ts`
  - `chatAgent` defers to tool `getNextResponseFromSupervisor` for all substantive responses; the tool calls `/api/responses` with system instructions and iterates function calls (policy lookup, account info, nearest store) via `handleToolCalls` until a final message.
  - Company: `NewTelco` (guardrails/company name usage exemplar).
- Workspace Builder
  - File: `scenarios/workspaceBuilder/index.ts`
  - Agents: `workspaceManager`, `designer`, `estimator`; directional handoffs among them. Includes domain-specific guardrails in `scenarios/workspaceBuilder/guardrails.ts`.
- Simple Handoff
  - File: `scenarios/simpleHandoff/index.ts` (minimal chain; not expanded here).
- Session lifecycle and transport
  - File: `hooks/useRealtimeSession.ts`
  - Creates `RealtimeSession(rootAgent, { transport: OpenAIRealtimeWebRTC, model, config, outputGuardrails, context })`.
  - Manages connect/disconnect, WebRTC audio element, VAD / PTT, history events, guardrail trip events, and agent handoffs.
- UI and scenario selection
  - File: `App.tsx`
  - Uses `?agentConfig=` to pick scenario, reorders initial agents to set selected as root; sets guardrails: `createModerationGuardrail(realEstateCompanyName)`.
  - Triggers initial greeting by sending a simulated "hi" after connect.
- Guardrails
  - Files: `agentConfigs/guardrails/moderation.ts`, `scenarios/workspaceBuilder/guardrails.ts`
  - Implement async output moderation by calling `/api/responses` with a zod JSON schema; if tripwire triggers, UI annotates transcript with category/rationale.
- Backend API
  - `api/session/route.ts` creates ephemeral realtime session tokens.
  - `api/responses/route.ts` proxies to OpenAI Responses API (structured or text), used by supervisor and guardrails.

App Directory Structure Analysis

## Core Application Files (CRITICAL - DO NOT DELETE)
1. **App.tsx** (18KB, 536 lines)
   - Main application component and orchestration hub
   - Manages session lifecycle, agent selection, UI state
   - Handles codec selection, audio playback, WebRTC connections
   - Contains workspace versioning logic and localStorage management
   - **Deletion Impact**: Application would completely break

2. **layout.tsx** (407B, 21 lines)
   - Next.js root layout with metadata and basic HTML structure
   - Imports global CSS and environment setup
   - **Deletion Impact**: Next.js app would not render

3. **page.tsx** (566B, 20 lines)
   - Entry point wrapping App.tsx with context providers
   - Provides TranscriptProvider, EventProvider, WorkspaceProvider
   - **Deletion Impact**: Application would have no route and no context

4. **types.ts** (3.9KB, 171 lines)
   - Central type definitions for the entire application
   - Defines interfaces for agents, tools, transcripts, guardrails, workspace tabs
   - **Deletion Impact**: TypeScript compilation would fail

5. **globals.css** (1.3KB, 41 lines)
   - Tailwind CSS imports and global styles
   - **Deletion Impact**: UI would lose all styling

## Context Providers (CRITICAL - DO NOT DELETE)
Located in `/contexts/`:
- **TranscriptContext.tsx**: Manages conversation history and transcript items
- **EventContext.tsx**: Handles client/server event logging and debugging
- **WorkspaceContext.tsx**: Manages workspace state with tabs, localStorage persistence
- **Deletion Impact**: Would break state management across the application

## UI Components (MOSTLY CRITICAL)
Located in `/components/`:

### Essential Components:
- **BottomToolbar.tsx**: Connection controls, PTT, settings - **CRITICAL**
- **Transcript.tsx**: Conversation display with markdown/guardrail support - **CRITICAL**
- **Events.tsx**: Debug panel for event logging - **USEFUL for debugging**
- **GuardrailChip.tsx**: Displays moderation warnings - **CRITICAL for safety**

### Workspace-Specific Components (CONDITIONALLY DELETABLE):
- **Workspace.tsx**: Container for workspace builder scenario
- **workspace/Sidebar.tsx**: Tab management for workspace
- **workspace/TabContent.tsx**: Content renderer for markdown/CSV tabs
- **Deletion Impact**: Only affects `workspaceBuilder` scenario; other scenarios would work fine

## Custom Hooks (CRITICAL - DO NOT DELETE)
Located in `/hooks/`:
- **useRealtimeSession.ts**: Core WebRTC/OpenAI session management
- **useAudioDownload.ts**: Audio recording and download functionality  
- **useHandleSessionHistory.ts**: Session event processing and transcript management
- **Deletion Impact**: Would break core voice interaction functionality

## Agent Configurations (SCENARIO-DEPENDENT)
Located in `/agentConfigs/`:

### Core Infrastructure (CRITICAL):
- **index.ts**: Exports all scenarios and main registry
- **types.ts**: Agent configuration type definitions  
- **guardrails/**: Moderation and safety systems

### Individual Scenarios (CONDITIONALLY DELETABLE):
- **scenarios/workspaceBuilder/**: Workspace building agents and tools
- **scenarios/realEstateBroker/**: Real estate consultation agents
- **scenarios/chatSupervisor/**: Supervisor pattern with tool routing
- **scenarios/customerServiceRetail/**: Complex customer service flow
- **scenarios/simpleHandoff/**: Minimal handoff example

**Deletion Impact per Scenario**:
- Deleting any scenario folder removes that option from the dropdown
- App gracefully falls back to `defaultAgentSetKey = 'workspaceBuilder'`
- Other scenarios continue to work normally

## API Routes (CRITICAL - DO NOT DELETE)
Located in `/api/`:
- **session/route.ts**: Creates ephemeral OpenAI session tokens
- **responses/route.ts**: Proxies to OpenAI Responses API for structured/text generation
- **Deletion Impact**: Would break agent communication and session establishment

## Utility Libraries (CRITICAL - DO NOT DELETE)
Located in `/lib/`:
- **audioUtils.ts**: WAV conversion and audio processing
- **codecUtils.ts**: Audio codec handling (PCMU/PCMA/Opus)
- **envSetup.ts**: Environment configuration
- **Deletion Impact**: Would break audio functionality and codec selection

## What Can Be Safely Deleted

### Deletable with Minimal Impact:
1. **Specific Scenario Folders**: Any individual scenario in `/agentConfigs/scenarios/` except the default
   - Remove unwanted use cases (e.g., delete `realEstateBroker` if not needed)
   - Update `index.ts` to remove references
   - Change `defaultAgentSetKey` if deleting the current default

2. **Workspace-Related Components** (if not using workspace scenario):
   - `/components/Workspace.tsx`
   - `/components/workspace/` entire folder
   - `/contexts/WorkspaceContext.tsx`
   - Note: Would break `workspaceBuilder` scenario

3. **Debug/Development Components**:
   - `/components/Events.tsx` (loses debugging capability)
   - Audio download functionality in hooks (loses recording feature)

### Deletion Strategy Examples:

**Minimal Voice-Only App** (delete these):
```
/agentConfigs/scenarios/workspaceBuilder/
/agentConfigs/scenarios/realEstateBroker/  
/agentConfigs/scenarios/customerServiceRetail/
/agentConfigs/scenarios/chatSupervisor/
/components/Workspace.tsx
/components/workspace/
/contexts/WorkspaceContext.tsx
/hooks/useAudioDownload.ts (and remove from App.tsx)
```
Keep only `simpleHandoff` scenario, results in ~70% size reduction.

**Single-Purpose App** (e.g., real estate only):
```
# Keep only realEstateBroker scenario
# Delete all other scenario folders
# Update defaultAgentSetKey to 'realEstateBroker'
# Remove workspace components
```

### NEVER DELETE:
- Core files: App.tsx, layout.tsx, page.tsx, types.ts, globals.css
- Context providers (except WorkspaceContext if removing workspace)
- Essential components: BottomToolbar, Transcript, GuardrailChip
- Core hooks: useRealtimeSession, useHandleSessionHistory  
- API routes: session/, responses/
- Core lib utilities: audioUtils, codecUtils, envSetup
- Base agent configs: index.ts, guardrails/

**Consequence Summary**: Deleting scenarios = loss of specific use cases. Deleting workspace = loss of document editing. Deleting core files = complete application failure.

Gaps relative to "embodied work"
- No generic task routing beyond static per-scenario handoffs.
- Tools are domain-specific; no standard interfaces for embodied actions (devices, files, spatial memory, scheduling, procedure execution).
- Limited memory: conversation history only; no persistent user/task state or episodic memory.
- Single-tenant guardrail policy per scenario; not user- or org-scoped.
- No explicit capability model (who can do what), nor competency ratings for routing.

## ADHD/Embodied Work Productivity System - Detailed Plan

### Vision & Core Principles
Create a voice-first productivity companion that understands the whole person - not just tasks, but energy, emotions, body states, and neurodivergent needs. Based on Joe Hudson's productivity principles of working WITH your natural patterns rather than against them.

### Target User Needs
- **Energy Management**: Matching tasks to current energy levels (high/medium/low cognitive load)
- **Emotional Regulation**: Recognizing when breaks, grounding, or co-regulation is needed
- **Body Doubling**: Virtual accountability presence for focus and task completion
- **Flexible Planning**: Adaptive scheduling that responds to real-time capacity
- **Shame-Free Productivity**: No judgment, just supportive redirection
- **Transition Support**: Help with task switching and context changes
- **Sensory Awareness**: Recognition of overstimulation or understimulation needs

### Three-Agent Architecture

#### 1. Energy & Awareness Coach (Root Agent)
**Role**: Primary intake and continuous check-ins on whole-person state
**Personality**: Warm, non-judgmental, attuned, grounding presence
**Core Functions**:
- Initial energy/mood/capacity check-in
- Emotional regulation assessment ("How's your nervous system feeling?")
- Body awareness prompts ("What does your body need right now?")
- Sensory environment assessment (noise, lighting, stimulation levels)
- Recognition of overwhelm or dysregulation signals
- Transition support between tasks

**Key Conversation Flows**:
1. Morning check-in: "How are you showing up today?"
2. Energy assessment: "What's your cognitive/emotional/physical energy like?"
3. Regulation needs: "Do you need grounding, movement, or settling?"
4. Handoff decisions: When to route to Task Strategist vs Body Doubling Companion

**Tools Needed**:
- `assess_current_state`: Structured check-in capturing energy, mood, capacity
- `suggest_regulation_activity`: Breathing, movement, grounding techniques
- `log_energy_pattern`: Track energy patterns over time for learning

#### 2. Task & Priority Strategist 
**Role**: ADHD-friendly task planning and energy-task matching
**Personality**: Organized but flexible, understands executive dysfunction, breaks things down naturally
**Core Functions**:
- Task breakdown into manageable chunks (15-30 min segments)
- Energy-task matching (high energy = complex work, low energy = admin)
- Priority triage using urgency vs importance vs energy required
- Time estimation with ADHD tax (things take longer than expected)
- Flexible scheduling that adapts to real-time capacity changes
- Recognition of hyperfocus vs avoidance patterns

**Key Conversation Flows**:
1. Task capture: "What's on your mind that needs to get done?"
2. Energy matching: "Given your current energy, what feels possible?"
3. Breakdown assistance: "Let's make this feel manageable"
4. Priority coaching: "What matters most right now?"
5. Adaptation: "How can we adjust this plan to fit reality?"

**Tools Needed**:
- `capture_task_brain_dump`: Voice-to-text rapid task capture
- `estimate_task_energy`: Categorize tasks by cognitive load required
- `create_flexible_schedule`: Time blocks that can be moved/adjusted
- `track_task_completion_patterns`: Learn user's productive patterns

#### 3. Body Doubling Companion
**Role**: Accountability presence and focus support
**Personality**: Encouraging, present, non-intrusive, celebrates small wins
**Core Functions**:
- Virtual co-working presence ("I'm here with you")
- Focus session facilitation (Pomodoro-style but adapted to user needs)
- Gentle accountability without shame
- Transition support between tasks
- Celebration of completions, no matter how small
- Recognition when to take breaks or switch tasks

**Key Conversation Flows**:
1. Session setup: "What are we working on together?"
2. Presence maintenance: "I'm here, you're doing great"
3. Check-ins: "How's it going? Need anything?"
4. Transition support: "Ready to switch gears?"
5. Completion celebration: "Look what you accomplished!"

**Tools Needed**:
- `start_focus_session`: Timer and presence setup
- `provide_gentle_check_in`: Periodic "how's it going?" prompts
- `celebrate_completion`: Positive reinforcement for any progress
- `detect_struggle_signals`: Recognize when user needs support or break

### Workspace Structure & Data Tracking

The workspace will maintain several tabs to track patterns and support planning:

#### Core Tabs:
1. **Today's Plan** (markdown): Current day structure, energy levels, priority tasks
2. **Energy Patterns** (csv): Historical data on energy levels throughout day/week
3. **Task Bank** (csv): Ongoing list of tasks categorized by energy requirement
4. **Regulation Toolkit** (markdown): Personalized strategies for emotional regulation
5. **Wins & Insights** (markdown): Celebration log and pattern insights
6. **Body Doubling Log** (csv): Focus session records and what worked

### Agent Handoff Patterns

**Primary Flow**: Energy Coach → Task Strategist → Body Doubling Companion → Back to Energy Coach

**Dynamic Handoffs**:
- Energy Coach detects overwhelm → Immediately to regulation tools, then reassess
- Task Strategist recognizes avoidance patterns → Hand to Body Doubling Companion for accountability
- Body Doubling Companion notices energy drop → Back to Energy Coach for check-in
- Any agent can call for "regulation break" and return to Energy Coach

### Technical Implementation Plan

#### Phase 1: Core Agent Development (2-3 days)
1. **Rename and restructure existing workspaceBuilder agents**:
   - `workspaceManager` → `energyCoach` 
   - `designer` → `taskStrategist`
   - `estimator` → `bodyDoublingCompanion`

2. **Rewrite agent prompts and personalities**:
   - Remove interior design context
   - Add ADHD awareness and trauma-informed language
   - Include Joe Hudson productivity principles
   - Focus on whole-person assessment

3. **Update workspace tools**:
   - Modify tab creation for productivity-focused structure
   - Add energy tracking and pattern recognition
   - Create regulation activity suggestions

#### Phase 2: Specialized Tools (3-4 days)
1. **Energy Assessment Tools**:
   - `assess_current_state`: Structured check-in form
   - `log_energy_pattern`: Time-series energy tracking
   - `suggest_regulation`: Personalized regulation strategies

2. **Task Management Tools**:
   - `brain_dump_capture`: Voice-to-task conversion
   - `energy_task_matcher`: Algorithm for matching tasks to energy
   - `flexible_scheduler`: Adaptive time blocking

3. **Body Doubling Tools**:
   - `focus_session_timer`: Customizable focus blocks
   - `accountability_check`: Gentle progress prompts
   - `completion_celebration`: Positive reinforcement system

#### Phase 3: Pattern Recognition & Learning (2-3 days)
1. **Data Analysis**:
   - Energy pattern recognition over time
   - Task completion rate analysis
   - Optimal focus session length detection

2. **Personalization**:
   - Learn user's peak energy times
   - Adapt regulation suggestions based on what works
   - Customize body doubling approach to user preferences

#### Phase 4: Integration & Testing (2-3 days)
1. **Smooth handoffs between agents**
2. **User experience flow testing**
3. **Guardrail setup for mental health safety**
4. **Voice interaction optimization**

### Success Criteria

**User Experience Success**:
- User feels understood and supported, not judged
- Planning feels flexible and adaptive, not rigid
- Tasks get completed without burnout or shame spirals
- User develops better self-awareness of their patterns

**Technical Success**:
- Smooth voice-driven workflow between all three agents
- Workspace accurately tracks patterns and insights
- Tools provide meaningful value for productivity planning
- System adapts to user's changing needs throughout the day

**Behavioral Success**:
- Increased task completion rates
- Better energy management and fewer crashes
- More awareness of regulation needs
- Sustainable productivity patterns (not just hustle)

### Specific Implementation Tasks

#### Task Breakdown for Execution:
1. **Setup and Preparation**
   - Create new scenario folder: `scenarios/adhdProductivity/`
   - Copy and rename existing agent files
   - Update scenario index and registry

2. **Energy Coach Agent**
   - Write comprehensive prompt focused on whole-person check-ins
   - Implement energy assessment tools
   - Create regulation suggestion system
   - Design handoff logic to other agents

3. **Task Strategist Agent** 
   - Develop ADHD-friendly task planning prompts
   - Build energy-task matching algorithms
   - Create flexible scheduling tools
   - Implement task breakdown assistance

4. **Body Doubling Companion Agent**
   - Write supportive, non-judgmental presence prompts
   - Build focus session management tools
   - Create gentle accountability systems
   - Implement completion celebration features

5. **Workspace Structure**
   - Design productivity-focused tab templates
   - Implement pattern tracking features
   - Create insight generation tools
   - Build regulation toolkit interface

6. **Testing and Refinement**
   - Test complete user journey flows
   - Verify handoff logic works smoothly
   - Validate tool functionality
   - Ensure mental health safety guardrails

This system would be groundbreaking - there's nothing like this that combines voice AI, ADHD awareness, embodied work principles, and multi-agent collaboration for productivity support.

## ADHD Productivity System Project Status Board

### Phase 1: Core Agent Development (2-3 days)
- [ ] 1.1: Create new scenario folder structure (`scenarios/adhdProductivity/`)
- [ ] 1.2: Rename and restructure existing agents (workspaceManager → energyCoach, etc.)
- [ ] 1.3: Rewrite Energy Coach agent prompts with ADHD awareness
- [ ] 1.4: Rewrite Task Strategist agent prompts with executive dysfunction understanding
- [ ] 1.5: Rewrite Body Doubling Companion agent prompts with trauma-informed language
- [ ] 1.6: Update workspace tools for productivity-focused structure
- [ ] 1.7: Update scenario registry and handoff patterns

---

## 🔄 PHASE 1 DETAILED EXECUTOR HANDOFF

### Overview
Transform the existing `workspaceBuilder` scenario into an ADHD/embodied work productivity system with three specialized agents. This phase focuses on core agent development, prompt rewriting, and basic infrastructure setup.

### Prerequisites & Context
- **Current Location**: `/src/app/agentConfigs/scenarios/workspaceBuilder/`
- **Current Agents**: `workspaceManager`, `designer`, `estimator` 
- **Target Transformation**: → `energyCoach`, `taskStrategist`, `bodyDoublingCompanion`
- **Core Philosophy**: Replace interior design context with ADHD-aware, whole-person productivity support

### File Structure to Create
```
src/app/agentConfigs/scenarios/adhdProductivity/
├── index.ts                    (handoff configuration)
├── energyCoach.ts             (was workspaceManager.ts)
├── taskStrategist.ts          (was designer.ts)  
├── bodyDoublingCompanion.ts   (was estimator.ts)
├── prompts.ts                 (all agent prompts)
├── utils.ts                   (copy from workspaceBuilder)
├── guardrails.ts              (ADHD-specific safety)
└── __tests__/                 (copy test structure)
    └── adhdProductivity.integration.test.ts
```

### Task 1.1: Create New Scenario Folder Structure

**Action**: Create the new folder and copy base files
```bash
# Create new scenario folder
mkdir -p src/app/agentConfigs/scenarios/adhdProductivity/__tests__

# Copy existing files as templates
cp src/app/agentConfigs/scenarios/workspaceBuilder/utils.ts src/app/agentConfigs/scenarios/adhdProductivity/
cp src/app/agentConfigs/scenarios/workspaceBuilder/__tests__/workspaceManagerAgent.integration.test.ts src/app/agentConfigs/scenarios/adhdProductivity/__tests__/adhdProductivity.integration.test.ts
```

**Success Criteria**: 
- ✅ New folder structure exists
- ✅ Utils file copied successfully
- ✅ Test template file copied

### Task 1.2: Create Core Agent Files

**Action**: Create the three new agent files by copying and renaming existing ones

**File: `energyCoach.ts`** (based on workspaceManager.ts)
- Copy `workspaceManager.ts` → `energyCoach.ts`
- Keep the workspace tools (these will be updated in Task 1.6)
- Update imports to reference new prompts
- Change agent name from 'workspaceManager' to 'energyCoach'

**File: `taskStrategist.ts`** (based on designer.ts)  
- Copy `designer.ts` → `taskStrategist.ts`
- Keep the search tool structure (will adapt for task research)
- Update imports and agent name to 'taskStrategist'

**File: `bodyDoublingCompanion.ts`** (based on estimator.ts)
- Copy `estimator.ts` → `bodyDoublingCompanion.ts` 
- Keep the calculate tool structure (will adapt for focus timing)
- Update imports and agent name to 'bodyDoublingCompanion'

**Success Criteria**:
- ✅ Three agent files created with basic structure
- ✅ Imports updated to reference new prompt file
- ✅ Agent names updated in RealtimeAgent constructors

### Task 1.3: Create Energy Coach Prompts

**File: `prompts.ts`** - Create comprehensive prompt collection

**Energy Coach Prompt Requirements**:
```typescript
export const energyCoachPrompt = `
You are a warm, attuned Energy & Awareness Coach specializing in ADHD and embodied work principles.

# Your Role
Help users understand their current state - energy levels, emotional needs, body signals, and capacity - then guide them to appropriate support.

# Core Principles (Joe Hudson inspired)
- Work WITH natural patterns, not against them
- Whole-person awareness (mind, body, emotions, energy)
- Shame-free, judgment-free approach
- Adaptive and responsive to real-time needs
- Regulation before productivity

# Personality & Tone
- Warm, grounding presence
- Non-judgmental and accepting
- Curious and attuned to subtle signals
- Gentle but direct when needed
- Uses somatic/body-based language

# Initial Check-in Flow
1. Warm greeting and presence establishment
2. Energy assessment: "How are you showing up today?"
3. Body awareness: "What's your body telling you right now?"
4. Emotional regulation check: "How's your nervous system feeling?"
5. Capacity assessment: "What feels possible for you today?"
6. Environment check: "How's your space supporting you?"

# Handoff Decision Logic
- High energy + clear tasks → Hand to Task Strategist
- Moderate energy + need for accountability → Hand to Body Doubling Companion
- Low energy or dysregulation → Stay for regulation support first
- Overwhelm signals → Immediate regulation, then reassess

# Key Phrases & Language
- "How are you showing up today?"
- "What's your body telling you?"
- "Let's take a moment to check in with yourself"
- "That sounds really hard" (validation)
- "What would feel supportive right now?"
- "There's no right or wrong way to do this"

# Tools to Use
- assess_current_state: Capture comprehensive state check-in
- suggest_regulation_activity: Offer personalized regulation techniques
- log_energy_pattern: Track patterns over time
- makeWorkspaceChanges: Update workspace with insights

IMPORTANT: Always start with the person's current state before moving to tasks or productivity.
`;
```

**Success Criteria**:
- ✅ Comprehensive Energy Coach prompt written
- ✅ ADHD-aware language and principles included
- ✅ Clear handoff logic defined
- ✅ Trauma-informed, shame-free approach

### Task 1.4: Create Task Strategist Prompts  

**Task Strategist Prompt Requirements**:
```typescript
export const taskStrategistPrompt = `
You are an expert Task & Priority Strategist who understands ADHD, executive dysfunction, and embodied work principles.

# Your Role
Help users organize their tasks in a way that works WITH their brain, energy levels, and natural patterns - not against them.

# Core ADHD Awareness
- Executive dysfunction is real and valid
- Tasks often take longer than expected ("ADHD tax")
- Breaking down big tasks prevents overwhelm
- Energy-task matching is crucial
- Flexibility prevents shame spirals
- Hyperfocus and avoidance are both normal patterns

# Personality & Approach
- Organized but never rigid
- Understands that "productivity systems" often fail neurodivergent brains
- Breaks things down naturally without being asked
- Validates difficulty and offers concrete support
- Celebrates ANY progress, no matter how small

# Core Functions
1. **Task Capture**: Brain dump in whatever way works for the user
2. **Energy Matching**: Match task complexity to current energy levels
3. **Breakdown Assistance**: Make overwhelming tasks feel manageable  
4. **Priority Triage**: Focus on what truly matters vs perfectionism
5. **Flexible Scheduling**: Time blocks that can move and adapt
6. **Pattern Recognition**: Notice hyperfocus vs avoidance patterns

# Energy-Task Matching Framework
- **High Energy Tasks**: Complex thinking, creative work, difficult conversations
- **Medium Energy Tasks**: Routine work, emails, planning, organizing
- **Low Energy Tasks**: Data entry, simple admin, familiar routines

# Language & Phrases
- "Let's make this feel manageable"
- "What's the smallest possible step?"
- "Given your current energy, what feels doable?"
- "There's no perfect system, just what works for you today"
- "Let's adjust this to fit reality"
- "You know your brain better than anyone"

# Handoff Logic
- User needs accountability for specific tasks → Hand to Body Doubling Companion
- User becomes overwhelmed → Hand back to Energy Coach for regulation
- Tasks are organized and user feels confident → Check if they want body doubling support

# Tools to Use
- capture_task_brain_dump: Voice-to-text rapid task capture
- estimate_task_energy: Categorize tasks by cognitive load required
- create_flexible_schedule: Time blocks that can be moved/adjusted
- makeWorkspaceChanges: Update task lists and schedules in workspace

IMPORTANT: Always validate the difficulty of tasks and offer concrete breakdown support.
`;
```

**Success Criteria**:
- ✅ ADHD-aware task planning approach
- ✅ Executive dysfunction understanding built in
- ✅ Energy-task matching framework defined
- ✅ Flexible, shame-free language

### Task 1.5: Create Body Doubling Companion Prompts

**Body Doubling Companion Prompt Requirements**:
```typescript
export const bodyDoublingCompanionPrompt = `
You are a gentle, encouraging Body Doubling Companion who provides virtual accountability and presence for people with ADHD.

# Your Role
Offer warm, non-intrusive presence while users work on their tasks. Provide gentle accountability without shame, celebrate any progress, and support transitions between tasks.

# Understanding Body Doubling
Body doubling is when someone works alongside another person for:
- Accountability without judgment
- Gentle external structure
- Reduced isolation and overwhelm
- Support for task initiation and completion
- Help with transitions and context switching

# Personality & Presence
- Warm, encouraging, and present
- Non-intrusive but available
- Celebrates small wins genuinely
- Never judges pace or progress
- Understands ADHD time blindness and task switching difficulties
- Offers gentle check-ins without being demanding

# Core Functions
1. **Session Setup**: "What are we working on together?"
2. **Presence Maintenance**: Regular but non-disruptive check-ins
3. **Gentle Accountability**: "How's it going?" without pressure
4. **Transition Support**: Help switching between tasks or taking breaks
5. **Completion Celebration**: Acknowledge ANY progress made
6. **Struggle Recognition**: Notice when user needs different support

# Focus Session Framework
- **Flexible timing**: Not rigid Pomodoro - adapt to user's natural rhythms
- **Check-in frequency**: User preference (every 15-30-45 minutes)
- **Break encouragement**: Normalize and encourage breaks
- **Transition help**: Support for starting and stopping tasks

# Language & Phrases
- "I'm here with you"
- "You're doing great"
- "How's it going over there?"
- "Ready to take a break?"
- "Look what you accomplished!"
- "That was hard work - well done"
- "Want to switch gears?"
- "I'm proud of you for trying"

# Handoff Logic
- User energy drops significantly → Hand back to Energy Coach
- User wants to add new tasks or reorganize → Hand to Task Strategist
- User becomes overwhelmed → Hand back to Energy Coach for regulation support
- Session complete successfully → Celebrate and check if they want to continue

# Tools to Use
- start_focus_session: Timer and presence setup for focus work
- provide_gentle_check_in: Periodic "how's it going?" prompts
- celebrate_completion: Positive reinforcement for any progress
- makeWorkspaceChanges: Log session results and insights

IMPORTANT: Your presence should feel supportive, not supervisory. Adapt to each user's unique needs and working style.
`;
```

**Success Criteria**:
- ✅ Body doubling concept clearly understood and implemented
- ✅ Trauma-informed, shame-free accountability approach
- ✅ Flexible timing and presence framework
- ✅ Genuine celebration and encouragement language

### Task 1.6: Update Workspace Tools

**Action**: Modify the workspace tools in `energyCoach.ts` to be productivity-focused

**Key Changes Needed**:

1. **Update tab creation logic** to create productivity-focused tabs:
   - "Today's Plan" (markdown)
   - "Energy Patterns" (csv) 
   - "Task Bank" (csv)
   - "Regulation Toolkit" (markdown)
   - "Wins & Insights" (markdown)
   - "Body Doubling Log" (csv)

2. **Update `makeWorkspaceChanges` tool description**:
   ```typescript
   description: 'Make changes to productivity workspace - update energy levels, task progress, insights, or regulation notes.'
   ```

3. **Keep all existing workspace tools** but update the system prompt in `makeWorkspaceChanges` to understand productivity context instead of interior design.

**Success Criteria**:
- ✅ Workspace tools updated for productivity context
- ✅ Tab creation logic creates appropriate productivity tabs
- ✅ Tool descriptions updated to reflect new purpose

### Task 1.7: Create Index and Update Registry

**File: `index.ts`** - Create the agent handoff configuration
```typescript
import { energyCoach } from './energyCoach';
import { taskStrategist } from './taskStrategist';  
import { bodyDoublingCompanion } from './bodyDoublingCompanion';

// Wire up bidirectional hand-offs between agents
(energyCoach.handoffs as any).push(taskStrategist, bodyDoublingCompanion);
(taskStrategist.handoffs as any).push(energyCoach, bodyDoublingCompanion);
(bodyDoublingCompanion.handoffs as any).push(energyCoach, taskStrategist);

export const adhdProductivityScenario = [
  energyCoach,
  taskStrategist,
  bodyDoublingCompanion,
];
```

**Update Main Scenario Registry**: 
- File: `src/app/agentConfigs/scenarios/index.ts`
- Add import: `import { adhdProductivityScenario } from './adhdProductivity';`
- Add to allAgentSets: `adhdProductivity: adhdProductivityScenario,`
- Update defaultAgentSetKey: `export const defaultAgentSetKey = 'adhdProductivity';`

**Success Criteria**:
- ✅ Agent handoffs properly configured
- ✅ Scenario exported correctly  
- ✅ Main registry updated to include new scenario
- ✅ Default scenario set to adhdProductivity

### Phase 1 Completion Checklist

Before marking Phase 1 complete, verify:

- [ ] ✅ All 7 task files created and properly structured
- [ ] ✅ All three agent prompts written with ADHD awareness
- [ ] ✅ Workspace tools updated for productivity context
- [ ] ✅ Scenario registry updated and new scenario set as default
- [ ] ✅ All imports and exports working correctly
- [ ] ✅ Basic app functionality maintained (can select scenario and start session)
- [ ] ✅ No TypeScript compilation errors
- [ ] ✅ Agent handoffs configured correctly

### Testing Phase 1

**Manual Test Checklist**:
1. Start the development server (`npm run dev`)
2. Navigate to the app with `?agentConfig=adhdProductivity`
3. Verify the new scenario appears in dropdown
4. Start a voice session and confirm energyCoach responds
5. Test basic workspace tab creation
6. Verify agent can hand off to other agents (even if prompts aren't perfect yet)

### Handoff to Phase 2

Once Phase 1 is complete, the foundation will be ready for Phase 2: Specialized Tools Development. Document any issues or insights in the "Executor's Feedback" section of the scratchpad.

---

### Phase 2: Specialized Tools (3-4 days)
- [ ] 2.1: Implement Energy Assessment Tools (`assess_current_state`, `log_energy_pattern`)
- [ ] 2.2: Build Task Management Tools (`brain_dump_capture`, `energy_task_matcher`)
- [ ] 2.3: Create Body Doubling Tools (`focus_session_timer`, `accountability_check`)
- [ ] 2.4: Develop regulation suggestion system
- [ ] 2.5: Build flexible scheduling algorithms
- [ ] 2.6: Create completion celebration system

### Phase 3: Pattern Recognition & Learning (2-3 days)
- [ ] 3.1: Implement energy pattern tracking over time
- [ ] 3.2: Build task completion rate analysis
- [ ] 3.3: Create optimal focus session length detection
- [ ] 3.4: Develop personalization algorithms for regulation suggestions
- [ ] 3.5: Build adaptive body doubling approach customization

### Phase 4: Integration & Testing (2-3 days)
- [ ] 4.1: Test smooth handoffs between all three agents
- [ ] 4.2: Validate complete user journey flows
- [ ] 4.3: Implement mental health safety guardrails
- [ ] 4.4: Optimize voice interaction patterns
- [ ] 4.5: Create comprehensive test scenarios
- [ ] 4.6: Performance and user experience validation

### Previous System Tasks (Background)
- [x] Repo scan and current system mapping
- [x] App directory analysis and deletion impact assessment  
- [x] Run Next.js app locally for verification (2025-09-29)
- [x] Investigate missing Tailwind styles causing unformatted UI (2025-09-29)
- [x] Commit and push refactored codebase (2025-09-29)

Executor's Feedback or Assistance Requests

**PLANNER MODE COMPLETE**: Created comprehensive plan for ADHD/Embodied Work Productivity System transformation. The plan includes:

✅ **Detailed Vision & Principles**: Voice-first productivity companion understanding whole-person needs
✅ **Three-Agent Architecture**: Energy Coach, Task Strategist, Body Doubling Companion with specific roles
✅ **Technical Implementation Plan**: 4 phases over 10-12 days with clear success criteria
✅ **Workspace Structure**: 6 specialized tabs for tracking energy patterns, tasks, and insights
✅ **Agent Handoff Logic**: Dynamic routing based on user state and needs
✅ **Specialized Tools**: 15+ custom tools for energy assessment, task management, and body doubling

**PHASE 1 HANDOFF PREPARED**: Created detailed executor handoff document for Phase 1 implementation below. Ready for agent execution.

**Key Innovation**: This system would be groundbreaking - combining voice AI, ADHD awareness, embodied work principles, and multi-agent collaboration for productivity support. No existing tools address this intersection of neurodivergence, whole-person awareness, and AI assistance.

Previous system notes:
- App directory analysis complete. The structure is well-organized with clear separation between core functionality, scenarios, and UI components.
- Next.js dev server restarted via `npm run dev`; confirmed listening on port 3001.
- Styling issue investigated - CSS bundle properly generated and served, likely browser caching or mixed content issue.
- Successfully committed and pushed refactored codebase with cleaned up scenarios and enhanced workspace builder functionality.
- Next.js dev server restarted via `npm run dev`; confirmed listening on port 3000.

Lessons
- Use `/api/responses` for structured moderation and supervisor iterations; keep tools non-parallel when tool outputs inform subsequent calls.
- Guardrail trip events are surfaced to the UI; ensure any new guardrails attach rationale and offending text for debugging.
- Include info useful for debugging in the program output.
- Read the file before you try to edit it.
- If there are vulnerabilities that appear in the terminal, run npm audit before proceeding
- Always ask before using the -force git command