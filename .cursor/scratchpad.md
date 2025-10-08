Background and Motivation
The current repo contains a Next.js demo of multi-agent realtime voice interactions using the OpenAI Realtime SDK. Scenarios include real estate, customer service retail, a chat supervisor pattern, a workspace builder, and a simple handoff. The goal is to generalize this into "various agents that support a user to do great, embodied work," shifting from vertical demos to a reusable multi-agent substrate (voice-first, tool-using, handoff-capable, guardrail-aware) that can be specialized per domain.

**Current Project:** Transform workspaceBuilder scenario into ADHD/Embodied Work Productivity System - a neurodivergent-friendly daily planning assistant that considers energy levels, emotional regulation needs, and body doubling support alongside traditional task management.

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

ADHD/Embodied Work Productivity System Transformation Plan

## Core Philosophy & Principles
Based on Joe Hudson's embodied work principles and ADHD-aware productivity:
- **Energy-first scheduling**: Match tasks to current energy levels, not rigid time blocks
- **Emotional awareness**: Recognize when regulation is needed before productivity crashes
- **Body doubling support**: Virtual accountability and presence without judgment
- **Adaptive planning**: Flexible systems that adjust to neurodivergent needs
- **Shame-free approach**: No guilt for changing plans or needing support
- **Whole-person integration**: Body, mind, emotions, and tasks as interconnected system

## Agent Team Design

### 1. Energy & Awareness Coach (formerly workspaceManager)
**Role**: Check-in facilitator and energy assessment specialist
**Personality**: Warm, intuitive, body-aware, non-judgmental
**Core Functions**:
- Current energy level assessment (physical, mental, emotional)
- Body scan and somatic awareness check-ins
- Emotional regulation needs identification
- Energy type matching (creative, analytical, social, restorative)
- Transition support between activities

**Key Tools**:
- `assess_current_energy`: Quick energy/mood/body check-in tool
- `suggest_regulation_practice`: Breathing, movement, grounding techniques
- `energy_timeline_tracker`: Track energy patterns over time
- `transition_support`: Help with task switching and context changes

### 2. Task & Priority Strategist (formerly designer)
**Role**: ADHD-friendly task planning and prioritization expert
**Personality**: Understanding, strategic, flexible, celebrates small wins
**Core Functions**:
- Break large tasks into micro-tasks and manageable chunks
- Match tasks to current energy levels and time available
- Identify dopamine-friendly task sequences and reward loops
- Manage executive function challenges (working memory, planning)
- Create accountability structures without pressure

**Key Tools**:
- `break_down_task`: Decompose overwhelming tasks into tiny steps
- `energy_task_matching`: Match tasks to current energy state
- `dopamine_sequencing`: Create motivating task order and rewards
- `context_switching_prep`: Minimize transition costs between tasks
- `progress_celebration`: Acknowledge and celebrate completed work

### 3. Body Doubling Companion (formerly estimator)
**Role**: Virtual presence and accountability partner
**Personality**: Supportive, present, encouraging, consistent
**Core Functions**:
- Provide silent companionship during focused work
- Gentle accountability check-ins without pressure
- Encouragement and motivation during difficult tasks
- Help with starting/stopping work sessions
- Emotional support when things don't go as planned

**Key Tools**:
- `start_focus_session`: Begin accompanied work time with check-ins
- `gentle_accountability`: Non-judgmental progress check-ins
- `encouragement_boost`: Motivational support when struggling
- `session_debrief`: Reflect on what worked/didn't work
- `adaptive_planning`: Adjust plans based on real experience

## Handoff Flow & Collaboration

### Session Initiation Flow:
1. **Energy Coach**: "How are you feeling right now? Let's check in with your body and energy."
2. **Task Strategist**: "Based on your energy, what feels manageable today? Let's plan together."
3. **Body Doubling Companion**: "I'm here to work alongside you. Want to start with something small?"

### Intelligent Handoffs:
- **Energy crashes** → Hand off to Energy Coach for regulation
- **Task overwhelm** → Hand off to Task Strategist for breaking down
- **Motivation/focus issues** → Hand off to Body Doubling Companion
- **End of work session** → Hand off to Energy Coach for reflection

### Continuous Collaboration:
- All agents share workspace state and energy/task context
- Cross-agent awareness of user's current needs and progress
- Seamless transitions based on user's real-time state

## Workspace Tab Structure

### Core Tabs:
1. **Daily Check-in**: Energy, mood, body awareness, intentions
2. **Task Board**: Current tasks organized by energy level and priority
3. **Energy Journal**: Pattern tracking over time
4. **Regulation Toolkit**: Go-to practices for different states
5. **Wins & Reflections**: Celebration and learning capture
6. **Body Doubling Log**: Session notes and accountability tracking

### Dynamic Content:
- Energy levels visualized with simple indicators
- Task status with gentle progress tracking
- Emotional regulation suggestions based on current state
- Body doubling session summaries and insights

## Technical Implementation Plan

### Phase 1: Agent Personality & Prompt Transformation
- Rewrite all agent prompts with ADHD/embodied work focus
- Develop conversation flows that prioritize energy and emotions
- Create shame-free, flexible interaction patterns
- Implement Joe Hudson-inspired somatic awareness techniques

### Phase 2: Tool Development
- Energy assessment and tracking tools
- Task breakdown and prioritization algorithms
- Body doubling session management
- Emotional regulation suggestion engine
- Progress celebration and reflection tools

### Phase 3: Workspace Integration
- Transform workspace tabs to support daily planning workflow
- Add energy/mood visualizations
- Implement flexible task board with energy-based organization
- Create regulation toolkit with quick-access practices

### Phase 4: Memory & Adaptation
- User pattern recognition (energy cycles, effective practices)
- Personalized suggestions based on past success
- Adaptive scheduling based on historical data
- Long-term habit and wellness tracking

## Success Criteria

### User Experience Goals:
- Reduced overwhelm and planning anxiety
- Increased self-awareness of energy and emotional patterns
- Better task completion through energy-matching
- Stronger sense of accomplishment and self-compassion
- More sustainable work practices over time

### Technical Goals:
- Seamless agent handoffs based on user state
- Effective energy and emotion tracking
- Useful task breakdown and prioritization
- Meaningful body doubling experience
- Persistent learning and adaptation

### Behavioral Outcomes:
- Users report feeling more in tune with their bodies
- Decreased shame around productivity challenges
- Increased completion of meaningful tasks
- Better energy management and sustainability
- Stronger connection between body, emotions, and work effectiveness

High-level Task Breakdown
1) Transform Agent Personalities and Prompts
   - Success: All three agents embody ADHD-friendly, embodied work principles with appropriate personalities and conversation flows
2) Develop Energy Assessment and Regulation Tools
   - Success: Tools for checking energy levels, suggesting regulation practices, and tracking patterns over time
3) Create ADHD-Friendly Task Management Tools
   - Success: Task breakdown, energy-matching, dopamine sequencing, and progress celebration tools
4) Build Body Doubling and Accountability Features
   - Success: Virtual presence tools, gentle check-ins, and session management for accountability
5) Transform Workspace Structure for Daily Planning
   - Success: Workspace tabs support energy-aware daily planning workflow with appropriate visualizations
6) Implement Pattern Recognition and Adaptation
   - Success: System learns user patterns and provides personalized suggestions based on past success
7) Testing with ADHD/Neurodivergent Users
   - Success: User testing validates effectiveness for target population with iterative improvements

Project Status Board - ADHD/Embodied Work Transformation
- [x] Extensive planning and agent team design (2025-09-29)
- [ ] Transform Agent 1: Energy & Awareness Coach (workspaceManager)
- [ ] Transform Agent 2: Task & Priority Strategist (designer)  
- [ ] Transform Agent 3: Body Doubling Companion (estimator)
- [ ] Develop energy assessment and regulation tools
- [ ] Create ADHD-friendly task management tools
- [ ] Build body doubling and accountability features
- [ ] Transform workspace tabs for daily planning workflow
- [ ] Implement pattern recognition and user adaptation
- [ ] Create ADHD-specific guardrails and safety measures
- [ ] Test with target user population
- [ ] Iterative refinement based on user feedback

Legacy Status (Completed):
- [x] Repo scan and current system mapping
- [x] App directory analysis and deletion impact assessment  
- [x] Run Next.js app locally for verification (2025-09-29)
- [x] Investigate missing Tailwind styles causing unformatted UI (2025-09-29)
- [x] Commit and push refactored codebase (2025-09-29)

Executor's Feedback or Assistance Requests
- **Phase 1 Complete**: Successfully transformed all three agents in workspaceBuilder scenario:
  - **Energy & Awareness Coach** (formerly workspaceManager): Body-aware check-ins, energy assessment, regulation support
  - **Task & Priority Strategist** (formerly designer): ADHD-friendly task breakdown, energy-matching, dopamine sequencing
  - **Body Doubling Companion** (formerly estimator): Virtual accountability, gentle presence, encouragement support
- **Agent handoffs redesigned** for intelligent energy-aware transitions between all three agents
- **Prompts completely rewritten** with neurodivergent-friendly language, somatic awareness, and shame-free approach
- **Development server running** on ports 3000 and 3001 - ready for testing transformed agents
- **Testing Phase**: Basic agent transformation complete, ready to test Energy Coach → Task Strategist → Body Doubling flow
- **Next steps**: Validate agent personalities and handoffs, then develop specialized tools and workspace tabs

Lessons
- Use `/api/responses` for structured moderation and supervisor iterations; keep tools non-parallel when tool outputs inform subsequent calls.
- Guardrail trip events are surfaced to the UI; ensure any new guardrails attach rationale and offending text for debugging.
- Include info useful for debugging in the program output.
- Read the file before you try to edit it.
- If there are vulnerabilities that appear in the terminal, run npm audit before proceeding
- Always ask before using the -force git command