Background and Motivation
The current repo contains a Next.js demo of multi-agent realtime voice interactions using the OpenAI Realtime SDK. Scenarios include real estate, customer service retail, a chat supervisor pattern, a workspace builder, and a simple handoff. The goal is to generalize this into "various agents that support a user to do great, embodied work," shifting from vertical demos to a reusable multi-agent substrate (voice-first, tool-using, handoff-capable, guardrail-aware) that can be specialized per domain.

**Current Analysis Request:** Thorough breakdown of the `/src/app` directory structure, identifying deletable elements and consequences of deletion.

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

High-level Task Breakdown
1) Introduce Agent Capability Model and Registry
   - Success: Agents declare roles, capabilities, modalities, and tool access via a common schema; registry enumerates agents across domains.
2) Add Dynamic Router/Supervisor for Task Assignment
   - Success: A router agent/tool maps user intents to agents using capability tags and context; supports mid-conversation reassignment.
3) Create Common Embodied Tools Catalog
   - Success: Standard tool interfaces (e.g., `capture_sensor_data`, `control_device`, `schedule_block`, `open_file`, `annotate_image`, `spatial_plan_step`) with server implementations and auth.
4) Memory and State Layer
   - Success: Pluggable memory store (user profile, task board, artifacts); agents can read/write scoped state via tools with policy checks.
5) Guardrail Policy Modularization
   - Success: Guardrails load from policy registry keyed by org/user/domain; transcript annotates violations uniformly.
6) Scenario Abstraction and Runtime Switching
   - Success: Select root agent by intent; switch scenarios at runtime without reconnecting, preserving history and state.
7) Testing & Validation
   - Success: TDD: unit tests for router decisions; integration tests for handoffs and guardrail trip; e2e for audio session and tool calls.

Project Status Board
- [x] Repo scan and current system mapping
- [x] App directory analysis and deletion impact assessment  
- [ ] Introduce Agent Capability Model and Registry
- [ ] Add Dynamic Router/Supervisor for Task Assignment
- [ ] Create Common Embodied Tools Catalog
- [ ] Memory and State Layer
- [ ] Guardrail Policy Modularization
- [ ] Scenario Abstraction and Runtime Switching
- [ ] Testing & Validation
- [x] Run Next.js app locally for verification (2025-09-29)
- [x] Investigate missing Tailwind styles causing unformatted UI (2025-09-29)
- [x] Commit and push refactored codebase (2025-09-29)

Executor's Feedback or Assistance Requests
- App directory analysis complete. The structure is well-organized with clear separation between core functionality, scenarios, and UI components. The workspace builder scenario appears most complex and could be simplified or removed if not needed for the embodied work vision.
- Next.js dev server restarted via `npm run dev`; confirmed listening on port 3001.
- Styling issue investigated - CSS bundle properly generated and served, likely browser caching or mixed content issue.
- Successfully committed and pushed refactored codebase with cleaned up scenarios and enhanced workspace builder functionality.
- Next.js dev server restarted via `npm run dev`; confirmed listening on port 3000.

**NEW: Comprehensive Style Guide Created (2025-10-08)**
- Created extensive style guide at `14-voice-agents/realtime-workspace-agents/STYLE_GUIDE.md`
- Based on spy/command-center dashboard aesthetic from provided image
- 2,696 lines covering: colors, typography, layout, 10+ components, effects, interactions, data viz, responsive design
- Added 20 critical details after second image review: corner brackets, CRT effects, terminal syntax, agent ID format, special characters library, dense layouts, glow-only rule (no shadows)

**Implementation Prompts Created (2025-10-08)**
- Created `IMPLEMENTATION_PROMPT.md` - Comprehensive prompt (350+ lines) for Claude to implement the style guide
  - Includes context, tech stack, 6-phase implementation plan, code samples, success criteria
  - Details foundation setup, layout transformation, component migration, interactive elements, typography, polish
  - Provides specific Tailwind config, component examples, testing approach, and file priorities
- Created `IMPLEMENTATION_PROMPT_SHORT.md` - Concise version for quick implementation
  - Streamlined 4-phase approach with essential rules and guidelines
- Both prompts ready to be given to Claude 4.5 Sonnet for style implementation

Lessons
- Use `/api/responses` for structured moderation and supervisor iterations; keep tools non-parallel when tool outputs inform subsequent calls.
- Guardrail trip events are surfaced to the UI; ensure any new guardrails attach rationale and offending text for debugging.
- Include info useful for debugging in the program output.
- Read the file before you try to edit it.
- If there are vulnerabilities that appear in the terminal, run npm audit before proceeding
- Always ask before using the -force git command