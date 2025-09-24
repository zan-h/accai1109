Background and Motivation
The current repo contains a Next.js demo of multi-agent realtime voice interactions using the OpenAI Realtime SDK. Scenarios include real estate, customer service retail, a chat supervisor pattern, a workspace builder, and a simple handoff. The goal is to generalize this into “various agents that support a user to do great, embodied work,” shifting from vertical demos to a reusable multi-agent substrate (voice-first, tool-using, handoff-capable, guardrail-aware) that can be specialized per domain.

Key Challenges and Analysis
- Agent composition: Each scenario wires multiple `RealtimeAgent`s with explicit `handoffs`. We need a more generic “role” taxonomy and plug-in tools for embodied tasks.
- Orchestration: Today, the client selects a scenario and connects to a session with a chosen root agent; handoffs are local in agent config. For generalization, we’ll need a supervisor or router that can resolve tasks to the right agent set dynamically.
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

Gaps relative to “embodied work”
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
- [ ] Introduce Agent Capability Model and Registry
- [ ] Add Dynamic Router/Supervisor for Task Assignment
- [ ] Create Common Embodied Tools Catalog
- [ ] Memory and State Layer
- [ ] Guardrail Policy Modularization
- [ ] Scenario Abstraction and Runtime Switching
- [ ] Testing & Validation

Executor's Feedback or Assistance Requests
- None yet. Next, we’ll finalize the capability schema and router design for your review before implementation.

Lessons
- Use `/api/responses` for structured moderation and supervisor iterations; keep tools non-parallel when tool outputs inform subsequent calls.
- Guardrail trip events are surfaced to the UI; ensure any new guardrails attach rationale and offending text for debugging.

