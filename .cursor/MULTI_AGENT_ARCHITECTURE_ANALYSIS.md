# Multi-Agent System Architecture Analysis
**Deep Dive into Realtime Voice Agent System with Handoffs & Guardrails**

---

## Table of Contents
1. [Directory Structure & File Organization](#directory-structure--file-organization)
2. [System Overview](#system-overview)
3. [Core Architecture Components](#core-architecture-components)
4. [Multi-Agent Orchestration](#multi-agent-orchestration)
5. [Agent Handoff Mechanism](#agent-handoff-mechanism)
6. [Guardrail System](#guardrail-system)
7. [Data Flow & Communication](#data-flow--communication)
8. [How to Modify System Prompts](#how-to-modify-system-prompts)
9. [How to Assess and Debug Handovers](#how-to-assess-and-debug-handovers)
10. [Testing Strategies](#testing-strategies)
11. [Architectural Patterns & Best Practices](#architectural-patterns--best-practices)

---

## Directory Structure & File Organization

### 📁 Complete File Tree

```
14-voice-agents/realtime-workspace-agents/
├── src/app/
│   │
│   ├── agentConfigs/                    🤖 MULTI-AGENT SYSTEM CORE
│   │   ├── index.ts                     ⭐ [EXPORTS] Main entry point - re-exports all scenarios
│   │   ├── types.ts                     📘 [TYPES] RealtimeAgent, FunctionTool type definitions
│   │   │
│   │   ├── scenarios/                   🎭 AGENT SCENARIOS
│   │   │   ├── index.ts                 ⭐ [REGISTRY] Scenario registry (allAgentSets, defaultAgentSetKey)
│   │   │   │
│   │   │   └── workspaceBuilder/        💼 WORKSPACE BUILDER SCENARIO
│   │   │       ├── index.ts             ⭐ [ORCHESTRATION] Wires up agent handoffs, exports scenario
│   │   │       │
│   │   │       ├── prompts.ts           📝 [CRITICAL] All agent system prompts
│   │   │       │   ├── energyCoachPrompt2
│   │   │       │   ├── taskStrategistPrompt2
│   │   │       │   └── bodyDoublingPrompt2
│   │   │       │
│   │   │       ├── workspaceManager.ts  🧘 [AGENT] Energy Coach agent definition
│   │   │       │   ├── energyCoachAgent: RealtimeAgent
│   │   │       │   ├── workspaceTools: FunctionTool[]
│   │   │       │   ├── workspaceInfoTool
│   │   │       │   └── makeWorkspaceChanges (server-side tool)
│   │   │       │
│   │   │       ├── designer.ts          📋 [AGENT] Task Strategist agent definition
│   │   │       │   ├── taskStrategistAgent: RealtimeAgent
│   │   │       │   └── searchTheWeb (server-side tool)
│   │   │       │
│   │   │       ├── estimator.ts         👥 [AGENT] Body Doubling agent definition
│   │   │       │   ├── bodyDoublingAgent: RealtimeAgent
│   │   │       │   └── calculate (server-side tool)
│   │   │       │
│   │   │       ├── utils.ts             🔧 Helper functions (fetchResponsesMessage)
│   │   │       │
│   │   │       ├── guardrails.ts        🛡️ Scenario-specific guardrails (optional)
│   │   │       │
│   │   │       └── __tests__/           🧪 Integration tests
│   │   │           └── workspaceManagerAgent.integration.test.ts
│   │   │
│   │   └── guardrails/                  🛡️ GUARDRAIL SYSTEM
│   │       ├── index.ts                 📦 Exports all guardrails
│   │       │
│   │       ├── moderation.ts            ⭐ [CORE] Moderation guardrail
│   │       │   ├── runGuardrailClassifier()
│   │       │   └── createModerationGuardrail()
│   │       │
│   │       ├── contextAwareGuardrail.ts 🎯 Context-aware workflow enforcement
│   │       │   ├── runContextAwareClassifier()
│   │       │   └── createContextAwareGuardrail()
│   │       │
│   │       ├── customGuardrail.ts       💼 Custom business rules template
│   │       │   ├── runCustomGuardrailClassifier()
│   │       │   └── createCustomBusinessGuardrail()
│   │       │
│   │       └── __tests__/               🧪 Guardrail unit tests
│   │           └── customGuardrail.test.ts
│   │
│   ├── contexts/                        🔄 STATE MANAGEMENT
│   │   ├── ProjectContext.tsx           ⭐ Multi-project state (projects, current project)
│   │   ├── WorkspaceContext.tsx         ⭐ Workspace tabs state (tabs, selected tab)
│   │   ├── TranscriptContext.tsx        💬 Conversation history state
│   │   └── EventContext.tsx             📊 Debug event logging state
│   │
│   ├── hooks/                           🎣 CUSTOM HOOKS
│   │   ├── useRealtimeSession.ts        ⭐ [CRITICAL] WebRTC session management
│   │   │   ├── connect()
│   │   │   ├── disconnect()
│   │   │   ├── sendUserText()
│   │   │   ├── onAgentHandoff callback
│   │   │   └── guardrail event handling
│   │   │
│   │   ├── useHandleSessionHistory.ts   📜 Transcript event handlers
│   │   │   ├── handleHistoryAdded()
│   │   │   ├── handleGuardrailTripped()
│   │   │   └── handleAgentHandoff()
│   │   │
│   │   └── useAudioDownload.ts          🎙️ Audio recording utilities
│   │
│   ├── components/                      🎨 UI COMPONENTS
│   │   ├── Transcript.tsx               💬 Conversation display (messages, breadcrumbs, guardrails)
│   │   ├── BottomToolbar.tsx            🎛️ Connection controls, PTT, settings
│   │   ├── Events.tsx                   📊 Debug panel (client/server events)
│   │   ├── GuardrailChip.tsx            ⚠️ Guardrail violation display
│   │   ├── ProjectSwitcher.tsx          🔄 Command palette (Cmd+P)
│   │   │
│   │   └── workspace/                   📂 Workspace UI
│   │       ├── Sidebar.tsx              📑 Tab management
│   │       └── TabContent.tsx           📄 Tab content renderer (markdown, CSV)
│   │
│   ├── api/                             🔌 API ROUTES
│   │   ├── session/
│   │   │   └── route.ts                 ⭐ [CRITICAL] Creates ephemeral OpenAI session tokens
│   │   │
│   │   └── responses/
│   │       └── route.ts                 ⭐ [CRITICAL] Proxy to OpenAI Responses API
│   │                                       (Used by guardrails, server-side tools)
│   │
│   ├── lib/                             🔧 UTILITIES
│   │   ├── audioUtils.ts                🎵 WAV conversion, audio processing
│   │   ├── codecUtils.ts                📡 Codec selection (opus, pcmu, pcma)
│   │   ├── envSetup.ts                  ⚙️ Environment configuration
│   │   └── projectUtils.ts              📁 Project helper functions
│   │
│   ├── App.tsx                          ⭐ [CRITICAL] Main application orchestrator
│   │   ├── Agent selection & connection logic
│   │   ├── Guardrail registration
│   │   ├── Context injection
│   │   ├── Handoff event handling
│   │   └── Auto-disconnect on project switch
│   │
│   ├── page.tsx                         🏠 Root page (wraps App with context providers)
│   ├── layout.tsx                       📐 Root layout (metadata, fonts, HTML structure)
│   ├── types.ts                         📘 Global TypeScript types
│   └── globals.css                      🎨 Global styles (Tailwind, CSS variables)
│
├── public/                              🖼️ Static assets
│
├── package.json                         📦 Dependencies
│   ├── @openai/agents                   (Realtime SDK)
│   ├── openai                           (Responses API)
│   └── next, react, typescript, etc.
│
├── tailwind.config.ts                   🎨 Tailwind configuration
├── tsconfig.json                        ⚙️ TypeScript configuration
└── next.config.ts                       ⚙️ Next.js configuration
```

---

### 🎯 Key Files by Concern

#### 1. Agent System Core (Start Here)

| File | Purpose | When to Edit |
|------|---------|--------------|
| **`agentConfigs/scenarios/index.ts`** | Scenario registry | Adding new scenarios |
| **`agentConfigs/scenarios/workspaceBuilder/index.ts`** | Handoff wiring | Changing agent relationships |
| **`agentConfigs/scenarios/workspaceBuilder/prompts.ts`** | System prompts | Modifying agent behavior ⭐ |
| **`agentConfigs/scenarios/workspaceBuilder/workspaceManager.ts`** | Energy Coach agent | Adding tools, changing voice |
| **`agentConfigs/scenarios/workspaceBuilder/designer.ts`** | Task Strategist agent | Adding tools, changing voice |
| **`agentConfigs/scenarios/workspaceBuilder/estimator.ts`** | Body Doubling agent | Adding tools, changing voice |

#### 2. Session & Connection Management

| File | Purpose | When to Edit |
|------|---------|--------------|
| **`hooks/useRealtimeSession.ts`** | WebRTC session lifecycle | Connection logic, event handling |
| **`hooks/useHandleSessionHistory.ts`** | Transcript event processing | Custom event handlers |
| **`App.tsx`** | Application orchestrator | Guardrail registration, context injection |
| **`api/session/route.ts`** | Ephemeral token generation | OpenAI API key config |

#### 3. Guardrail System

| File | Purpose | When to Edit |
|------|---------|--------------|
| **`agentConfigs/guardrails/moderation.ts`** | Basic safety guardrail | Moderation categories |
| **`agentConfigs/guardrails/contextAwareGuardrail.ts`** | Workflow enforcement | Conversation stage rules |
| **`agentConfigs/guardrails/customGuardrail.ts`** | Business rules template | Domain-specific rules |
| **`api/responses/route.ts`** | Proxy for classifications | Error handling |

#### 4. State Management

| File | Purpose | When to Edit |
|------|---------|--------------|
| **`contexts/ProjectContext.tsx`** | Multi-project state | Project CRUD operations |
| **`contexts/WorkspaceContext.tsx`** | Workspace tabs state | Tab CRUD operations |
| **`contexts/TranscriptContext.tsx`** | Conversation history | Transcript customization |
| **`contexts/EventContext.tsx`** | Debug event logging | Event tracking |

#### 5. UI Components

| File | Purpose | When to Edit |
|------|---------|--------------|
| **`components/Transcript.tsx`** | Message display | Transcript styling, markdown |
| **`components/BottomToolbar.tsx`** | Controls | Adding buttons, settings |
| **`components/GuardrailChip.tsx`** | Guardrail violations | Warning display |
| **`components/ProjectSwitcher.tsx`** | Project switcher | Fuzzy search, UI |

---

### 📂 File Dependencies Flow

```
                    ┌─────────────┐
                    │   App.tsx   │  ← Entry point
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐     ┌──────▼──────┐   ┌─────▼─────┐
    │Scenarios│     │useRealtime  │   │ Contexts  │
    │Registry │     │  Session    │   │(State Mgt)│
    └────┬────┘     └──────┬──────┘   └─────┬─────┘
         │                 │                 │
    ┌────▼──────────┐      │            ┌────▼────────┐
    │workspaceBuilder│      │            │WorkspaceCtx │
    └────┬──────────┘      │            └────┬────────┘
         │                 │                 │
    ┌────▼──────┐     ┌────▼────────┐  ┌────▼────────┐
    │3x Agents  │     │RealtimeSDK  │  │localStorage │
    │(prompts)  │     │(WebRTC)     │  │(persistence)│
    └────┬──────┘     └──────┬──────┘  └─────────────┘
         │                   │
    ┌────▼──────┐      ┌─────▼──────┐
    │Tools      │      │Guardrails  │
    │(workspace)│      │(validation)│
    └────┬──────┘      └─────┬──────┘
         │                   │
    ┌────▼───────────────────▼──────┐
    │    /api/responses (Proxy)     │
    │  (Tool iteration, classify)   │
    └───────────────────────────────┘
```

---

### 🔍 How to Navigate the Codebase

#### Scenario 1: "I want to change what an agent says"
```
1. Open: agentConfigs/scenarios/workspaceBuilder/prompts.ts
2. Find: export const [agentName]Prompt2 = `...`
3. Edit: System prompt instructions
4. Test: Connect and converse
```

#### Scenario 2: "I want to add a new tool to an agent"
```
1. Open: agentConfigs/scenarios/workspaceBuilder/workspaceManager.ts (or designer.ts, estimator.ts)
2. Create: new tool with tool() helper
3. Add: to agent's tools array
4. Test: Agent should now have access to tool
```

#### Scenario 3: "I want to change handoff logic"
```
1. Open: agentConfigs/scenarios/workspaceBuilder/index.ts
2. Modify: handoffs array wiring
3. Open: agentConfigs/scenarios/workspaceBuilder/prompts.ts
4. Edit: Handoff instructions in prompts
5. Test: Converse and verify handoff triggers correctly
```

#### Scenario 4: "I want to add a new guardrail"
```
1. Create: new file in agentConfigs/guardrails/myGuardrail.ts
2. Use: contextAwareGuardrail.ts or customGuardrail.ts as template
3. Export: from agentConfigs/guardrails/index.ts
4. Register: in App.tsx outputGuardrails array
5. Test: Trigger guardrail and verify it blocks/warns
```

#### Scenario 5: "I want to debug a handoff"
```
1. Open: components/Events.tsx (toggle events panel in UI)
2. Open: Browser console
3. Connect and converse
4. Watch for:
   - Breadcrumb in transcript: "Agent: [name]"
   - Event: "agent_handoff"
   - Console log: "🔀 Agent handoff to: [name]"
```

#### Scenario 6: "I want to understand workspace tools"
```
1. Start: agentConfigs/scenarios/workspaceBuilder/workspaceManager.ts
2. See: workspaceTools array (add_workspace_tab, set_tab_content, etc.)
3. Find: Implementation in contexts/WorkspaceContext.tsx
4. See: How tools call React context methods
5. See: makeWorkspaceChanges for server-side tool pattern
```

---

### 🎨 Visual File Importance Legend

| Symbol | Meaning |
|--------|---------|
| ⭐ | **Critical** - Core system functionality |
| 🤖 | Multi-agent system files |
| 🛡️ | Guardrail system files |
| 🔄 | State management files |
| 🎣 | Custom React hooks |
| 💬 | Conversation/transcript related |
| 🔧 | Utility/helper functions |
| 🧪 | Test files |
| 📘 | Type definitions |
| 🎨 | UI/styling files |

---

### 📊 File Size & Complexity Matrix

| File | Lines | Complexity | Edit Frequency |
|------|-------|------------|----------------|
| **prompts.ts** | 291 | Low | High ⭐ |
| **workspaceManager.ts** | 344 | Medium | Medium |
| **useRealtimeSession.ts** | 210 | High | Low |
| **App.tsx** | 599 | High | Medium |
| **WorkspaceContext.tsx** | 311 | Medium | Low |
| **moderation.ts** | 100 | Low | Medium |
| **index.ts (scenario)** | 18 | Low | Medium |

**Edit Frequency Guide:**
- **High**: You'll modify this often (prompts, guardrail rules)
- **Medium**: Occasional edits (adding tools, UI tweaks)
- **Low**: Rarely change (core infrastructure)

---

### 🚀 Quick Start Checklist

When starting with this codebase:

- [ ] Read `prompts.ts` - Understand agent personalities and flows
- [ ] Read `workspaceBuilder/index.ts` - See how handoffs are wired
- [ ] Skim `useRealtimeSession.ts` - Understand connection lifecycle
- [ ] Skim `App.tsx` - See how pieces connect
- [ ] Run the app and test a full conversation
- [ ] Open Events panel and watch events flow
- [ ] Make a small prompt change and test
- [ ] Add a console.log to a tool and trigger it
- [ ] Try triggering a guardrail
- [ ] Read this architecture doc fully

---

### 🔗 Cross-File Reference Map

**If you're editing prompts, you might also need:**
- `index.ts` - To change handoff wiring
- Agent definition files - To add/remove tools

**If you're adding a tool, you might also need:**
- `WorkspaceContext.tsx` - To implement the tool logic
- `prompts.ts` - To tell agent to use the tool

**If you're debugging handoffs, check:**
- `prompts.ts` - Handoff instructions
- `index.ts` - Handoff wiring
- `useRealtimeSession.ts` - Handoff event handling
- `App.tsx` - onAgentHandoff callback

**If you're working on guardrails, you'll use:**
- `guardrails/*.ts` - Guardrail definitions
- `App.tsx` - Guardrail registration
- `api/responses/route.ts` - Classification proxy
- `useHandleSessionHistory.ts` - Guardrail trip handling

---

## System Overview

### What is This System?
This is a **multi-agent voice interaction system** built on OpenAI's Realtime API that enables:
- Real-time voice conversations with AI agents
- Dynamic handoffs between specialized agents
- Output guardrails for safety and quality control
- Workspace manipulation via tools
- Context-aware multi-project management

### Key Technologies
- **OpenAI Realtime API** (WebRTC): Real-time bidirectional audio streaming
- **OpenAI Responses API**: Structured outputs, tool execution, guardrail classification
- **OpenAI Agents SDK** (`@openai/agents/realtime`): High-level agent abstractions
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type safety throughout
- **localStorage**: Client-side state persistence

### Current Scenario: Workspace Builder (ADHD Support)
The system currently implements three specialized agents for neurodivergent productivity:
1. **Energy Coach**: Body awareness, emotional check-ins, energy assessment
2. **Task Strategist**: ADHD-friendly task breakdown, prioritization
3. **Body Doubling Companion**: Virtual accountability, gentle presence

---

## Core Architecture Components

### 1. Agent Definition (`RealtimeAgent`)

```typescript
import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const energyCoachAgent = new RealtimeAgent({
  name: 'energyCoach',           // Unique identifier
  voice: 'sage',                  // OpenAI voice model
  instructions: energyCoachPrompt2, // System prompt
  tools: workspaceTools,          // Available function tools
  handoffs: [],                   // Initialized empty, wired up later
});
```

**Key Properties:**
- `name`: Used for routing, handoff identification, UI display
- `voice`: OpenAI TTS voice (alloy, echo, fable, onyx, nova, shimmer, sage)
- `instructions`: The system prompt that defines agent behavior/personality
- `tools`: Array of function tools the agent can call
- `handoffs`: Array of other `RealtimeAgent` instances this agent can transfer to

### 2. Tool Definition

Tools allow agents to interact with the application state:

```typescript
export const workspaceInfoTool = tool({
  name: 'get_workspace_info',
  description: 'Get the current state of the workspace',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  },
  execute: getWorkspaceInfo, // Function that returns workspace data
});
```

**Tool Types in This System:**
1. **Direct tools**: Execute immediately (workspace CRUD operations)
2. **Server-side tools**: Call `/api/responses` for complex operations
3. **Web search tools**: Use Responses API with `web_search_preview`
4. **Code interpreter tools**: Use Responses API with `code_interpreter`

### 3. Session Management (`useRealtimeSession`)

The `useRealtimeSession` hook manages the WebRTC connection lifecycle:

```typescript
const {
  status,          // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
  connect,         // Initialize session
  disconnect,      // Close session
  sendUserText,    // Send text message
  interrupt,       // Interrupt agent speech
  mute,           // Mute/unmute
  pushToTalkStart, // PTT controls
  pushToTalkStop,
} = useRealtimeSession({
  onConnectionChange: (status) => {...},
  onAgentHandoff: (agentName) => {...}, // Triggered when agent transfers
});
```

**Connection Flow:**
```
1. User clicks "Connect"
2. App.tsx calls connect() with:
   - getEphemeralKey: Function to fetch session token
   - initialAgents: Array of agent definitions
   - audioElement: HTML audio element for playback
   - extraContext: Workspace state, breadcrumb functions
   - outputGuardrails: Array of guardrail validators
3. useRealtimeSession creates RealtimeSession with:
   - Root agent (first in initialAgents)
   - OpenAIRealtimeWebRTC transport
   - Model: 'gpt-4o-realtime-preview-2024-06-03'
   - Audio format: Based on codec selection (opus/pcmu/pcma)
4. Session connects via WebRTC
5. Status changes: CONNECTING → CONNECTED
```

### 4. Context Injection

Agents receive context through the session initialization:

```typescript
sessionRef.current = new RealtimeSession(rootAgent, {
  transport: new OpenAIRealtimeWebRTC({...}),
  model: 'gpt-4o-realtime-preview-2024-06-03',
  config: {...},
  outputGuardrails: outputGuardrails ?? [],
  context: {
    // Injected into agent tool execution context
    addTranscriptBreadcrumb: (title: string, data?: any) => void,
    history: RealtimeItem[],
    // Workspace state snapshot (read-only for agent)
    workspaceState: { tabs: [...], selectedTabId: '...', ... }
  },
});
```

**Critical Insight:** The `context` object is passed to **tool execution functions**, not directly into the agent's prompt. Tools can access context via `details?.context`.

---

## Multi-Agent Orchestration

### Agent Registration & Scenario Definition

**File:** `src/app/agentConfigs/scenarios/workspaceBuilder/index.ts`

```typescript
import { energyCoachAgent } from './workspaceManager';
import { taskStrategistAgent } from './designer';
import { bodyDoublingAgent } from './estimator';

// Wire up handoffs (mutual connections)
(energyCoachAgent.handoffs as any).push(taskStrategistAgent, bodyDoublingAgent);
(taskStrategistAgent.handoffs as any).push(bodyDoublingAgent, energyCoachAgent);
(bodyDoublingAgent.handoffs as any).push(energyCoachAgent, taskStrategistAgent);

export const workspaceBuilderScenario = [
  energyCoachAgent,
  taskStrategistAgent,
  bodyDoublingAgent,
];
```

**Handoff Graph:**
```
┌─────────────────┐
│  Energy Coach   │ ←──┐
└────────┬────────┘    │
         │             │
    ┌────▼────┐   ┌────┴────┐
    │  Task   │   │  Body   │
    │Strategist│←─→│Doubling │
    └─────────┘   └─────────┘
```

**All agents can handoff to each other**, creating a fully connected network.

### Scenario Registry

**File:** `src/app/agentConfigs/scenarios/index.ts`

```typescript
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  workspaceBuilder: workspaceBuilderScenario,
  // Could add more scenarios:
  // realEstateBroker: realEstateBrokerScenario,
  // customerService: customerServiceScenario,
};

export const defaultAgentSetKey = 'workspaceBuilder';
```

**URL-Based Scenario Selection:**
```
http://localhost:3000?agentConfig=workspaceBuilder
```

App.tsx reads the `?agentConfig=` query parameter and loads the corresponding scenario.

---

## Agent Handoff Mechanism

### How Handoffs Work

**Conceptual Flow:**
1. Agent A is currently active in the conversation
2. Agent A's instructions include prompts like:
   - "Hand off to Task Strategist when ready to plan tasks"
   - "Transfer to Body Doubling Companion when user wants to start working"
3. The Realtime API provides a built-in handoff mechanism
4. When Agent A decides to handoff, it triggers an internal function call
5. The session emits an `agent_handoff` event
6. The event includes the name of the target agent
7. The session switches to the new agent
8. The new agent sees the full conversation history

### Technical Implementation

**In `useRealtimeSession.ts`:**

```typescript
const handleAgentHandoff = (item: any) => {
  const history = item.context.history;
  const lastMessage = history[history.length - 1];
  const agentName = lastMessage.name.split("transfer_to_")[1];
  callbacks.onAgentHandoff?.(agentName); // Notify App.tsx
};

useEffect(() => {
  if (sessionRef.current) {
    sessionRef.current.on("agent_handoff", handleAgentHandoff);
    // ... other event listeners
  }
}, [sessionRef.current]);
```

**In `App.tsx`:**

```typescript
const {
  connect,
  disconnect,
  // ... other methods
} = useRealtimeSession({
  onConnectionChange: (s) => setSessionStatus(s as SessionStatus),
  onAgentHandoff: (agentName: string) => {
    handoffTriggeredRef.current = true;
    setSelectedAgentName(agentName); // Switch UI to show new agent
  },
});
```

**Agent handoff flow:**
```
1. Agent A (Energy Coach) in conversation
   ↓
2. Agent A's instructions say: "Hand off to taskStrategist when..."
   ↓
3. OpenAI Realtime API detects intent to handoff
   ↓
4. Session emits "agent_handoff" event
   ↓
5. handleAgentHandoff extracts target agent name
   ↓
6. onAgentHandoff callback updates UI state
   ↓
7. Session internally switches to Agent B (Task Strategist)
   ↓
8. Agent B receives full conversation history
   ↓
9. Agent B continues conversation (instructions say "don't greet, just continue")
```

### Handoff in Agent Prompts

**Energy Coach Prompt (from `prompts.ts`):**
```
# Instructions
...
6. **Gentle Transition**: Hand off to Task Strategist when ready, carrying forward energy context
...

# Important Principles:
...
- Before handing off, ensure the workspace reflects their current energy state
- Always hand off with context about their energy and emotional state
```

**Task Strategist Prompt:**
```
# IMPORTANT: 
- Don't greet the user, just pick up the conversation from where the Energy Coach left off
- Always consider energy levels and emotional state when suggesting tasks
- Hand off to Body Doubling Companion when user is ready to start working
```

**Body Doubling Prompt:**
```
# IMPORTANT: 
- Don't greet the user, just pick up the conversation from where the Task Strategist left off
- If the user needs energy support or task re-planning, hand off to appropriate agent
```

### Handoff Best Practices

1. **Explicit handoff instructions** in system prompts
2. **Continuation instructions** for receiving agents ("don't greet")
3. **Context preservation** through conversation history
4. **Bidirectional handoffs** for flexible conversation flow
5. **Workspace updates before handoff** to carry state forward

---

## Guardrail System

### What Are Guardrails?

**Guardrails are output validators** that intercept and evaluate agent responses BEFORE they're spoken to the user. They can:
- Block inappropriate content
- Enforce conversation flow rules
- Validate business logic
- Redirect conversations

### Guardrail Types in This System

#### 1. Moderation Guardrail (Basic Safety)

**File:** `src/app/agentConfigs/guardrails/moderation.ts`

```typescript
export function createModerationGuardrail(companyName: string) {
  return {
    name: 'moderation_guardrail',
    
    async execute({ agentOutput }: RealtimeOutputGuardrailArgs): Promise<RealtimeOutputGuardrailResult> {
      // Call /api/responses with structured output
      const res = await runGuardrailClassifier(agentOutput, companyName);
      const triggered = res.moderationCategory !== 'NONE';
      
      return {
        tripwireTriggered: triggered, // true = block output
        outputInfo: res,              // metadata for UI display
      };
    },
  } as const;
}
```

**Moderation Categories:**
- `OFFENSIVE`: Hate speech, discrimination, insults
- `OFF_BRAND`: Competitor disparagement
- `VIOLENCE`: Threats, graphic violence
- `NONE`: Safe to proceed

**Classification Logic:**
```typescript
async function runGuardrailClassifier(
  message: string,
  companyName: string = 'newTelco',
): Promise<GuardrailOutput> {
  // Send to /api/responses with zod schema
  const response = await fetch('/api/responses', {
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'user',
          content: `You are an expert at classifying text...
          
          <message>${message}</message>
          
          <output_classes>
          - OFFENSIVE: ...
          - OFF_BRAND: ...
          - VIOLENCE: ...
          - NONE: ...
          </output_classes>`
        }
      ],
      text: {
        format: zodTextFormat(GuardrailOutputZod, 'output_format'),
      },
    }),
  });
  
  const data = await response.json();
  return GuardrailOutputZod.parse(data.output_parsed);
}
```

**Zod Schema:**
```typescript
const GuardrailOutputZod = z.object({
  moderationRationale: z.string(), // Why was this classified this way?
  moderationCategory: z.enum(['OFFENSIVE', 'OFF_BRAND', 'VIOLENCE', 'NONE']),
  testText: z.string().optional(),
});
```

#### 2. Context-Aware Guardrail (Workflow Enforcement)

**File:** `src/app/agentConfigs/guardrails/contextAwareGuardrail.ts`

```typescript
export function createContextAwareGuardrail(
  conversationStage: string,
  requiredInfo: string[]
) {
  return {
    name: 'context_aware_guardrail',
    
    async execute({ agentOutput, context }: ContextGuardrailArgs): Promise<ContextGuardrailResult> {
      const currentStage = context?.stage || conversationStage;
      const res = await runContextAwareClassifier(agentOutput, currentStage, requiredInfo);
      const triggered = res.moderationCategory !== 'NONE';
      
      return {
        tripwireTriggered: triggered,
        outputInfo: res,
      };
    },
  } as const;
}
```

**Context Categories:**
- `WRONG_CONVERSATION_STAGE`: Discussing inappropriate topics for current stage
- `MISSING_REQUIRED_INFO`: Proceeding without required information
- `PREMATURE_CONCLUSION`: Trying to conclude before completing stage
- `NONE`: Appropriate for current stage

**Use Case Example:**
```typescript
// Ensure intake agent collects requirements before handing off
const intakeGuardrail = createContextAwareGuardrail(
  'requirements_gathering',
  ['user_goal', 'budget', 'timeline']
);
```

#### 3. Custom Business Guardrail (Domain-Specific Rules)

**File:** `src/app/agentConfigs/guardrails/customGuardrail.ts`

```typescript
export function createCustomBusinessGuardrail(businessContext: string = 'customer service') {
  return {
    name: 'custom_business_guardrail',
    
    async execute({ agentOutput }: CustomGuardrailArgs): Promise<CustomGuardrailResult> {
      const res = await runCustomGuardrailClassifier(agentOutput, businessContext);
      const triggered = res.moderationCategory !== 'NONE';
      
      return {
        tripwireTriggered: triggered,
        outputInfo: res,
      };
    },
  } as const;
}
```

**Custom Categories:**
- `INAPPROPRIATE_TOPIC`: Politics, religion, personal opinions
- `UNPROFESSIONAL_LANGUAGE`: Slang, informal tone
- `COMPETITOR_MENTION`: Naming competitors
- `PRICING_DISCUSSION`: Unauthorized pricing information
- `NONE`: Professionally acceptable

### Guardrail Registration

**In `App.tsx`:**

```typescript
const outputGuardrails = [
  createModerationGuardrail('WorkspaceBuilder'), // Company name for moderation
  // createContextAwareGuardrail(...), // Commented out, add as needed
  // createCustomBusinessGuardrail(...),
];

await connect({
  getEphemeralKey,
  initialAgents,
  audioElement: audioElementRef.current!,
  extraContext: { /* workspace state */ },
  outputGuardrails: outputGuardrails, // Pass to session
});
```

### Guardrail Execution Flow

```
1. Agent generates response text via Realtime API
   ↓
2. Before speaking, session runs output through guardrails
   ↓
3. For each guardrail:
   a. Call guardrail.execute({ agentOutput, agent, context })
   b. Guardrail sends request to /api/responses with classification prompt
   c. OpenAI classifies the output (structured via zod)
   d. Guardrail returns { tripwireTriggered, outputInfo }
   ↓
4. If ANY guardrail triggers (tripwireTriggered = true):
   a. Session emits "guardrail_tripped" event
   b. Agent output is BLOCKED from being spoken
   c. Session sends corrective message to agent
   d. Agent generates new response
   e. Loop back to step 2
   ↓
5. If no guardrails trigger:
   a. Agent speaks the response
   b. User hears the audio
```

### Guardrail Trip Handling

**In `useHandleSessionHistory.ts`:**

```typescript
const handleGuardrailTripped = useCallback((event: any) => {
  const { guardrail, result } = event;
  
  addTranscriptItem({
    role: 'guardrail',
    type: 'guardrail_trip',
    text: `⚠️ Guardrail triggered: ${guardrail.name}`,
    data: {
      category: result.outputInfo.moderationCategory,
      rationale: result.outputInfo.moderationRationale,
      testText: result.outputInfo.testText,
    },
  });
}, [addTranscriptItem]);
```

**UI Display:**
The transcript shows guardrail trips with a chip:

```tsx
{item.type === 'guardrail_trip' && (
  <GuardrailChip
    category={item.data.category}
    rationale={item.data.rationale}
  />
)}
```

### Guardrail Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  Realtime Session                    │
│                                                      │
│  ┌──────────────┐       ┌─────────────────────┐   │
│  │   Agent A    │──────▶│  Generate Response  │   │
│  └──────────────┘       └──────────┬──────────┘   │
│                                     │               │
│                         ┌───────────▼──────────┐   │
│                         │  Output Guardrails   │   │
│                         │                      │   │
│                         │  ┌────────────────┐ │   │
│                         │  │  Moderation    │ │   │
│                         │  └────────────────┘ │   │
│                         │  ┌────────────────┐ │   │
│                         │  │ Context-Aware  │ │   │
│                         │  └────────────────┘ │   │
│                         │  ┌────────────────┐ │   │
│                         │  │    Custom      │ │   │
│                         │  └────────────────┘ │   │
│                         └───────────┬──────────┘   │
│                                     │               │
│                         ┌───────────▼──────────┐   │
│                         │  Any Triggered?      │   │
│                         └───────────┬──────────┘   │
│                                     │               │
│                    ┌────────────────┴────────────┐ │
│                    │                             │ │
│            ┌───────▼──────┐           ┌─────────▼─┐
│            │ BLOCK & RETRY │           │   SPEAK   │
│            └───────────────┘           └───────────┘
└─────────────────────────────────────────────────────┘
```

---

## Data Flow & Communication

### Workspace State Flow

```
┌──────────────────────────────────────────────────────────┐
│                      localStorage                         │
│  'projectState': {                                       │
│    projects: [                                           │
│      { id, name, tabs, activeBriefSectionIds, ... }     │
│    ],                                                    │
│    currentProjectId: '...',                             │
│    recentProjectIds: [...]                              │
│  }                                                       │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│               ProjectContext (React Context)             │
│  - getCurrentProject()                                   │
│  - updateProjectTabs()                                   │
│  - switchProject()                                       │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│              WorkspaceContext (React Context)            │
│  - tabs: WorkspaceTab[]                                  │
│  - selectedTabId: string                                 │
│  - addTab(), renameTab(), deleteTab(), setTabContent()  │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│            WorkspaceProviderState (Ref)                  │
│  - Current snapshot for agent tool access                │
│  - Updated on every render                               │
│  - Read by getWorkspaceInfo()                            │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│           Agent Tool Execution (Server-side)             │
│  getWorkspaceInfo() → Returns current tabs               │
│  addWorkspaceTab() → Calls WorkspaceContext method       │
│  setTabContent() → Updates tab content                   │
└──────────────────────────────────────────────────────────┘
```

### Agent Tool Execution Flow

**Example: `makeWorkspaceChanges` tool (used by Task Strategist)**

```typescript
export const makeWorkspaceChanges = tool({
  name: 'makeWorkspaceChanges',
  description: 'Make changes to the workspace tabs or content.',
  parameters: {
    type: 'object',
    properties: {
      tabsToChange: { type: 'string' },
      workspaceChangesToMake: { type: 'string' },
    },
    required: ['tabsToChange', 'workspaceChangesToMake'],
  },
  
  execute: async (input, details) => {
    // 1. Extract context from tool call
    const history = (details?.context as any)?.history ?? [];
    const addBreadcrumb = (details?.context as any)?.addTranscriptBreadcrumb;
    
    // 2. Build request to /api/responses
    const body = {
      model: 'gpt-4.1',
      input: [
        {
          type: 'message',
          role: 'system',
          content: `You are a workspace builder assistant...`
        },
        {
          type: 'message',
          role: 'user',
          content: `
            ==== Conversation History ====
            ${JSON.stringify(filteredLogs, null, 2)}
            
            ==== Current Workspace State ====
            ${JSON.stringify(await getWorkspaceInfo(), null, 2)}
            
            ==== Requested Workspace Changes ====
            ${workspaceChangesToMake}
          `
        }
      ],
      tools: workspaceTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        type: 'function',
      })),
    };
    
    // 3. Call /api/responses
    const response = await fetchResponsesMessage(body);
    
    // 4. Handle tool calls iteratively
    const responseText = await handleToolCalls(body, response, addBreadcrumb);
    
    // 5. Return result to agent
    return { workspaceManagerResponse: responseText };
  },
});
```

**Tool Call Iteration:**
```
1. Agent calls makeWorkspaceChanges("Add a Goals tab")
   ↓
2. Tool execution starts
   ↓
3. Tool calls /api/responses with workspace state + request
   ↓
4. /api/responses (GPT-4.1) analyzes and decides to call add_workspace_tab
   ↓
5. Response includes function_call items
   ↓
6. handleToolCalls loop:
   a. Execute add_workspace_tab locally
   b. Append function_call + function_call_output to body.input
   c. Call /api/responses again with updated input
   d. Repeat until no more function calls
   ↓
7. Final assistant message returned
   ↓
8. Tool returns result to agent
   ↓
9. Agent continues conversation with tool result
```

### Responses API Usage Patterns

**Pattern 1: Structured Classification (Guardrails)**
```typescript
const response = await fetch('/api/responses', {
  method: 'POST',
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    input: [{ role: 'user', content: '...' }],
    text: {
      format: zodTextFormat(GuardrailOutputZod, 'output_format'),
    },
  }),
});
```

**Pattern 2: Tool-Based Iteration (Workspace Changes)**
```typescript
const response = await fetch('/api/responses', {
  method: 'POST',
  body: JSON.stringify({
    model: 'gpt-4.1',
    input: [
      { role: 'system', content: '...' },
      { role: 'user', content: '...' }
    ],
    tools: [
      { name: 'add_workspace_tab', parameters: {...}, type: 'function' },
      { name: 'set_tab_content', parameters: {...}, type: 'function' },
    ],
  }),
});
```

**Pattern 3: Web Search (Designer Agent)**
```typescript
const response = await fetch('/api/responses', {
  method: 'POST',
  body: JSON.stringify({
    model: 'gpt-4.1',
    tools: [{ type: 'web_search_preview' }],
    tool_choice: 'required',
    input: `Search the web for: ${query}`,
  }),
});
```

**Pattern 4: Code Interpreter (Estimator Agent)**
```typescript
const response = await fetch('/api/responses', {
  method: 'POST',
  body: JSON.stringify({
    model: 'gpt-4.1',
    tools: [
      {
        type: 'code_interpreter',
        container: { type: 'auto' }
      }
    ],
    instructions: 'You are a calculator...',
    input: `Calculate: ${data_to_calculate}`,
  }),
});
```

---

## How to Modify System Prompts

### Step 1: Locate the Agent Prompt File

**File Structure:**
```
src/app/agentConfigs/scenarios/workspaceBuilder/
  ├── prompts.ts              ← All agent prompts
  ├── workspaceManager.ts     ← Energy Coach agent
  ├── designer.ts             ← Task Strategist agent
  └── estimator.ts            ← Body Doubling agent
```

### Step 2: Edit the Prompt

**File:** `src/app/agentConfigs/scenarios/workspaceBuilder/prompts.ts`

```typescript
export const energyCoachPrompt2 = `
You are a compassionate Energy & Awareness Coach...

# Conversation Flow
Your session should follow this energy-first approach:

1. **Initial Energy Check-in**: Invite the user to pause and notice their body...
2. **Somatic Awareness**: Guide a brief body scan...
3. **Energy Quality Assessment**: Help identify energy type...
4. **Regulation Needs**: Check if any emotional regulation is needed...
5. **Workspace Setup**: Create daily planning tabs...
6. **Gentle Transition**: Hand off to Task Strategist when ready...

# Core Workspace Tabs to Create:
- **Daily Check-in** (markdown): Current energy, mood, body awareness...
- **Energy Journal** (markdown): Pattern tracking...
- **Task Board** (csv): Tasks organized by energy requirements...

# Important Principles:
- Energy and emotional state come before productivity planning
- No shame for low energy...
- Body wisdom is valid information...
`;
```

### Step 3: Prompt Modification Guidelines

#### For Personality/Tone Changes:
```typescript
// Add a section at the top
export const energyCoachPrompt2 = `
# Personality and Tone

## Identity
You are a [warm/professional/casual/enthusiastic] [role title]...

## Demeanor
[Patient/Direct/Playful/Analytical], [encouraging/matter-of-fact], [gentle/assertive]...

## Tone
[Supportive/Instructive/Conversational] - like talking to a [friend/coach/therapist]...

## Key Phrases
"[phrase 1]..." "[phrase 2]..." "[phrase 3]..."

# Instructions
[Rest of prompt]
`;
```

#### For Tool Usage Changes:
```typescript
# Instructions
...
- Before making function calls, use phrases like "[custom phrase]..."
- Always call get_workspace_info before [specific action]
- Update the [specific tab] after [specific event]
...
```

#### For Handoff Logic Changes:
```typescript
# Instructions
...
- Hand off to [Agent Name] when [specific condition]
- Never hand off until [prerequisite completed]
- If [situation], hand off to [specific agent] instead
...
```

#### For Workflow Changes:
```typescript
# Conversation Flow States

## 1. [Stage Name]
**Goal**: [What to accomplish in this stage]
**Approach**: 
- [Step 1]
- [Step 2]
- [Step 3]
**Examples**:
- "[Example utterance 1]"
- "[Example utterance 2]"

## 2. [Next Stage]
...
```

### Step 4: Test the Changes

```bash
# 1. Save the file
# 2. Restart dev server (if not using hot reload)
npm run dev

# 3. Open app in browser
open http://localhost:3000

# 4. Connect and test conversation
# 5. Check transcript for expected behavior
# 6. Verify handoffs still work
```

### Step 5: Prompt Engineering Best Practices

1. **Be Explicit About Handoffs:**
   ```
   ❌ "Hand off when appropriate"
   ✅ "Hand off to taskStrategist when user has completed energy check-in AND created at least 2 workspace tabs"
   ```

2. **Provide Concrete Examples:**
   ```
   ## Example Conversation:
   User: "I'm feeling scattered and tired."
   Agent: "I hear that scattered, tired feeling. Let me capture this in your daily check-in... *updates workspace* Take a slow breath with me."
   ```

3. **Structure with Markdown:**
   - Use `#` headers for major sections
   - Use `##` for subsections
   - Use `-` for lists
   - Use `**bold**` for emphasis
   - Use code blocks for tool names

4. **State Continuation Instructions:**
   ```
   # IMPORTANT: 
   - Don't greet the user, just pick up the conversation from where [Previous Agent] left off
   - Reference the workspace to see [specific context] from the previous agent
   ```

5. **Tool Usage Patterns:**
   ```
   # Tool Usage Guidelines
   1. **Always** call get_workspace_info before modifying tabs
   2. **Announce** tool calls with natural language: "Let me update your task board..."
   3. **Confirm** after changes: "I've added that to your goals tab."
   ```

6. **Avoid Ambiguity:**
   ```
   ❌ "Help the user with their tasks"
   ✅ "Break down any task that feels overwhelming into 15-minute or smaller chunks"
   ```

---

## How to Assess and Debug Handovers

### Method 1: Transcript Monitoring

**UI Component:** `src/app/components/Transcript.tsx`

The transcript displays:
- User messages
- Agent messages
- Breadcrumbs (agent switches, tool calls)
- Guardrail trips

**Watch for:**
```
[Breadcrumb] Agent: energyCoach
User: "I'm feeling low energy today"
Agent: "Let me capture that... [creates tabs]"

[Breadcrumb] Agent: taskStrategist  ← HANDOFF OCCURRED
Agent: "I see you're feeling low energy. What's on your mind for today?"
```

### Method 2: Events Panel Debugging

**UI Component:** `src/app/components/Events.tsx`

Toggle the events panel (usually on the right side) to see:
- ▲ Client events (sent to server)
- ▼ Server events (received from server)

**Key Events to Monitor:**
```json
// Agent handoff event
{
  "type": "agent_handoff",
  "from": "energyCoach",
  "to": "taskStrategist",
  "timestamp": "2024-10-11T14:32:00Z"
}

// Tool call start
{
  "type": "agent_tool_start",
  "tool": "add_workspace_tab",
  "args": { "name": "Daily Check-in", "type": "markdown" }
}

// Tool call end
{
  "type": "agent_tool_end",
  "tool": "add_workspace_tab",
  "result": { "success": true, "tabId": "abc123" }
}

// Guardrail trip
{
  "type": "guardrail_tripped",
  "guardrail": "moderation_guardrail",
  "category": "OFFENSIVE",
  "rationale": "..."
}
```

### Method 3: Console Logging

**In Agent Tool Functions:**

```typescript
export const makeWorkspaceChanges = tool({
  name: 'makeWorkspaceChanges',
  // ...
  execute: async (input, details) => {
    console.log('🔧 makeWorkspaceChanges called:', input);
    
    const history = (details?.context as any)?.history ?? [];
    console.log('📜 Conversation history length:', history.length);
    
    const workspaceInfo = await getWorkspaceInfo();
    console.log('📂 Current workspace:', workspaceInfo);
    
    // ... rest of execution
    
    console.log('✅ makeWorkspaceChanges result:', responseText);
    return { workspaceManagerResponse: responseText };
  },
});
```

**In App.tsx:**

```typescript
const {
  connect,
  disconnect,
  // ...
} = useRealtimeSession({
  onConnectionChange: (s) => {
    console.log('🔌 Connection status:', s);
    setSessionStatus(s as SessionStatus);
  },
  onAgentHandoff: (agentName: string) => {
    console.log('🔀 Agent handoff to:', agentName);
    handoffTriggeredRef.current = true;
    setSelectedAgentName(agentName);
  },
});
```

### Method 4: Breadcrumb Tracking

**In Workspace Tools:**

```typescript
const addBreadcrumb = (details?.context as any)?.addTranscriptBreadcrumb as
  | ((title: string, data?: any) => void)
  | undefined;

if (addBreadcrumb) {
  addBreadcrumb('[energyCoach] Creating daily check-in tab', {
    tabName: 'Daily Check-in',
    timestamp: new Date().toISOString(),
  });
}
```

**Breadcrumbs appear in the transcript:**
```
[Breadcrumb] [energyCoach] Creating daily check-in tab
  ↳ tabName: "Daily Check-in"
  ↳ timestamp: "2024-10-11T14:32:00Z"
```

### Method 5: Agent Integration Test

**File:** `src/app/agentConfigs/scenarios/workspaceBuilder/__tests__/workspaceManagerAgent.integration.test.ts`

```typescript
describe('Workspace Manager Agent Integration', () => {
  it('should handoff to Task Strategist after energy check-in', async () => {
    const mockSession = createMockSession();
    const mockTranscript = [];
    
    // Simulate energy check-in conversation
    await mockSession.sendUserMessage("I'm feeling scattered");
    const response1 = await mockSession.getAgentResponse();
    expect(response1.agentName).toBe('energyCoach');
    
    // Simulate completion of check-in
    await mockSession.sendUserMessage("Yes, let's plan my tasks");
    const response2 = await mockSession.getAgentResponse();
    
    // Verify handoff occurred
    expect(mockSession.currentAgent).toBe('taskStrategist');
    expect(response2.agentName).toBe('taskStrategist');
    expect(response2.text).not.toContain('Hi'); // Shouldn't greet
  });
  
  it('should preserve workspace context across handoff', async () => {
    // ... test that tabs created by Energy Coach are visible to Task Strategist
  });
});
```

### Method 6: Network Monitoring

**Use browser DevTools:**

1. Open DevTools → Network tab
2. Filter by `Fetch/XHR`
3. Connect to session
4. Watch for:

```
POST /api/session
  ← Returns ephemeral key

WebRTC connection established
  ← Audio streaming

POST /api/responses (multiple)
  ← Guardrail classifications
  ← Tool executions
  ← Web searches
```

### Common Handoff Issues & Solutions

#### Issue 1: Handoff Not Triggering

**Symptoms:**
- Agent stays in conversation too long
- Never hands off despite prompt instructions

**Debugging:**
```typescript
// Check agent instructions
console.log(energyCoachAgent.instructions);
// Look for handoff language

// Check handoffs array
console.log(energyCoachAgent.handoffs);
// Should contain taskStrategistAgent
```

**Solutions:**
1. Make handoff instructions more explicit in prompt
2. Add conditional examples: "If user says X, hand off to Y"
3. Reduce ambiguity in handoff triggers

#### Issue 2: Handoff Happens Too Early

**Symptoms:**
- Agent hands off before completing its role
- Missing prerequisite steps

**Solutions:**
1. Add explicit prerequisites in prompt:
   ```
   Before handing off, ensure:
   - [ ] Energy check-in completed
   - [ ] At least 2 workspace tabs created
   - [ ] User explicitly ready for planning
   ```
2. Consider using a context-aware guardrail to enforce stage completion

#### Issue 3: Context Lost After Handoff

**Symptoms:**
- New agent doesn't reference previous conversation
- Asks questions already answered

**Debugging:**
```typescript
// In receiving agent's tool execution
const history = (details?.context as any)?.history ?? [];
console.log('Conversation history:', history);
// Should include messages from previous agent
```

**Solutions:**
1. Update receiving agent's prompt to explicitly reference history:
   ```
   # Instructions
   - Review the conversation history to understand the user's energy state
   - Reference the workspace tabs created by the Energy Coach
   ```
2. Ensure workspace state is preserved in context injection

#### Issue 4: Infinite Handoff Loop

**Symptoms:**
- Agents keep handing off to each other
- No progress made

**Debugging:**
```typescript
// Add logging to handoff callback
onAgentHandoff: (agentName: string) => {
  console.log('Handoff count:', ++handoffCount);
  if (handoffCount > 5) {
    console.error('INFINITE LOOP DETECTED');
    disconnect();
  }
  setSelectedAgentName(agentName);
}
```

**Solutions:**
1. Make handoff conditions more specific
2. Add "only hand off if..." conditions
3. Ensure receiving agent has clear starting instructions

### Handoff Testing Checklist

- [ ] Agent A creates workspace state (tabs, content)
- [ ] Agent A hands off to Agent B with clear trigger
- [ ] Agent B sees Agent A's workspace state
- [ ] Agent B doesn't greet (continues conversation)
- [ ] Agent B references previous context in first message
- [ ] Breadcrumbs show handoff in transcript
- [ ] Events panel shows agent_handoff event
- [ ] No guardrails trip during handoff
- [ ] User can trigger return handoff if needed
- [ ] Handoff happens at appropriate conversation point

---

## Testing Strategies

### 1. Manual Testing Protocol

#### A. Basic Conversation Flow
```
1. Connect to session
2. Say: "I'm feeling overwhelmed"
3. Verify: Energy Coach responds with check-in
4. Say: "Let's plan my tasks"
5. Verify: Handoff to Task Strategist
6. Say: "I'm ready to start working"
7. Verify: Handoff to Body Doubling
8. Say: "I need to reassess"
9. Verify: Handoff back to Energy Coach
```

#### B. Tool Execution
```
1. Connect to session
2. Say: "Create a goals tab for me"
3. Verify: Tab appears in workspace sidebar
4. Say: "Add 'Exercise daily' to the goals tab"
5. Verify: Content appears in tab
6. Say: "Rename that tab to 'Health Goals'"
7. Verify: Tab name changes
```

#### C. Guardrail Testing
```
1. Connect to session
2. Modify guardrail to trigger easily (lower threshold)
3. Say: [something that should trigger guardrail]
4. Verify: Agent's response doesn't include problematic content
5. Verify: Guardrail chip appears in transcript
6. Check events panel for guardrail_tripped event
```

### 2. Automated Testing

#### Unit Tests (Tools)
```typescript
// test workspace tool functions
describe('addWorkspaceTab', () => {
  it('should add tab with correct properties', async () => {
    const result = await addWorkspaceTab({
      name: 'Test Tab',
      type: 'markdown',
      content: '# Hello',
    });
    
    expect(result.success).toBe(true);
    expect(result.tabId).toBeDefined();
  });
});
```

#### Integration Tests (Agent Scenarios)
```typescript
describe('Energy Coach → Task Strategist Handoff', () => {
  let session: MockRealtimeSession;
  
  beforeEach(() => {
    session = createMockSession(workspaceBuilderScenario);
  });
  
  it('should handoff after energy check-in', async () => {
    await session.connect();
    
    await session.sendUserMessage("I'm feeling scattered");
    const response1 = await session.getNextAgentMessage();
    expect(response1.agentName).toBe('energyCoach');
    
    await session.sendUserMessage("Let's plan tasks");
    const response2 = await session.getNextAgentMessage();
    expect(response2.agentName).toBe('taskStrategist');
    
    expect(session.transcriptContains('Agent: taskStrategist')).toBe(true);
  });
});
```

#### End-to-End Tests (Playwright)
```typescript
test('complete workflow from energy check to body doubling', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Connect
  await page.click('[data-testid="connect-button"]');
  await page.waitForSelector('[data-testid="transcript"]');
  
  // Type message
  await page.fill('[data-testid="user-input"]', "I'm ready to work");
  await page.press('[data-testid="user-input"]', 'Enter');
  
  // Wait for agent response
  await page.waitForSelector('[data-testid="agent-message"]');
  
  // Verify workspace tab was created
  await page.waitForSelector('[data-testid="workspace-tab"]');
  const tabs = await page.$$('[data-testid="workspace-tab"]');
  expect(tabs.length).toBeGreaterThan(0);
  
  // Verify handoff occurred
  const breadcrumbs = await page.$$('[data-testid="breadcrumb"]');
  const handoffBreadcrumb = breadcrumbs.find(b => 
    b.textContent().includes('Agent: taskStrategist')
  );
  expect(handoffBreadcrumb).toBeDefined();
});
```

### 3. Conversation Testing Matrix

| Scenario | Input | Expected Agent | Expected Action | Expected Handoff |
|----------|-------|----------------|-----------------|------------------|
| Initial greeting | "Hi" | Energy Coach | Asks about energy state | None |
| Energy check-in | "Feeling scattered" | Energy Coach | Creates check-in tab | None |
| Ready to plan | "Let's plan tasks" | Energy Coach → Task Strategist | Hands off | Task Strategist |
| Task breakdown | "I need to write a report" | Task Strategist | Breaks down into steps | None |
| Ready to work | "Let's start" | Task Strategist → Body Doubling | Hands off | Body Doubling |
| Work session | "I'm working on step 1" | Body Doubling | Provides encouragement | None |
| Feeling overwhelmed | "This is too much" | Body Doubling → Energy Coach | Hands off for support | Energy Coach |

### 4. Performance Testing

#### Metrics to Monitor:
- **Connection time**: < 2 seconds from click to CONNECTED
- **First response**: < 1 second after user speaks
- **Tool execution**: < 3 seconds for workspace changes
- **Guardrail evaluation**: < 500ms per guardrail
- **Handoff latency**: < 1 second between agents
- **Memory usage**: < 200MB for session

#### Load Testing:
```typescript
// Simulate multiple rapid interactions
for (let i = 0; i < 50; i++) {
  await session.sendUserMessage(`Task ${i}`);
  await session.getNextAgentMessage();
}

// Verify no memory leaks
expect(performance.memory.usedJSHeapSize).toBeLessThan(200_000_000);
```

---

## Architectural Patterns & Best Practices

### 1. Agent Design Patterns

#### Pattern: Specialist Agents
- Each agent has a **narrow, well-defined role**
- Energy Coach: Body awareness, emotional state
- Task Strategist: Task breakdown, prioritization
- Body Doubling: Accountability, gentle presence

**Benefits:**
- Clearer prompts (less ambiguity)
- Better handoff logic (explicit boundaries)
- Easier to test (isolated responsibilities)

#### Pattern: Shared Tools
- Multiple agents share common tools (e.g., `workspaceInfoTool`)
- Reduces duplication
- Ensures consistent workspace access

```typescript
// Energy Coach
export const energyCoachAgent = new RealtimeAgent({
  tools: [workspaceInfoTool, ...workspaceTools],
});

// Task Strategist
export const taskStrategistAgent = new RealtimeAgent({
  tools: [workspaceInfoTool, makeWorkspaceChanges, searchTheWeb],
});
```

#### Pattern: Conversation State Machine
Each agent represents a state in a conversation flow:
```
[Initial State] → Energy Coach (assess energy)
                      ↓
              Task Strategist (plan tasks)
                      ↓
              Body Doubling (execute tasks)
                      ↓
              [Back to Energy Coach or complete]
```

### 2. Guardrail Design Patterns

#### Pattern: Layered Guardrails
```typescript
const outputGuardrails = [
  createModerationGuardrail('Company'),      // Layer 1: Safety
  createContextAwareGuardrail(...),          // Layer 2: Workflow
  createCustomBusinessGuardrail(...),        // Layer 3: Business rules
];
```

**Execution Order:**
1. Safety first (offensive content)
2. Then workflow (conversation stage)
3. Finally business rules (domain-specific)

#### Pattern: Adaptive Guardrails
```typescript
// Guardrail that changes based on conversation stage
export function createStageAwareGuardrail(context: any) {
  return {
    async execute({ agentOutput, context }) {
      const stage = context?.currentStage || 'initial';
      
      if (stage === 'energy_checkin') {
        // Stricter rules during check-in
        return await checkForPressure(agentOutput);
      } else if (stage === 'task_planning') {
        // Different rules during planning
        return await checkForOverwhelm(agentOutput);
      }
      
      return { tripwireTriggered: false, outputInfo: {} };
    },
  };
}
```

### 3. Tool Design Patterns

#### Pattern: Tool Composition
Large tools delegate to smaller tools via Responses API:

```typescript
// High-level tool
export const makeWorkspaceChanges = tool({
  execute: async () => {
    // Calls /api/responses with workspace tools
    const body = {
      tools: workspaceTools.map(t => ({...})),
    };
    // GPT-4.1 decides which specific tools to call
  },
});

// Low-level tools (direct execution)
export const addWorkspaceTab = tool({...});
export const setTabContent = tool({...});
```

#### Pattern: Tool Result Chaining
```typescript
async function handleToolCalls(body, response) {
  while (true) {
    const functionCalls = response.output.filter(item => 
      item.type === 'function_call'
    );
    
    if (functionCalls.length === 0) {
      break; // No more tools to execute
    }
    
    // Execute all function calls
    for (const toolCall of functionCalls) {
      const result = await executeToolLocally(toolCall);
      
      // Append result to input for next iteration
      body.input.push(
        { type: 'function_call', ...toolCall },
        { type: 'function_call_output', call_id: toolCall.call_id, output: result }
      );
    }
    
    // Call again with tool results
    response = await fetchResponsesMessage(body);
  }
  
  return extractFinalMessage(response);
}
```

### 4. Context Management Patterns

#### Pattern: Snapshot Context
```typescript
// Create a snapshot for agent access (doesn't update dynamically)
const contextSnapshot = {
  workspaceState: getCurrentWorkspaceState(),
  projectInfo: getCurrentProject(),
  timestamp: Date.now(),
};

await connect({
  extraContext: contextSnapshot,
});
```

#### Pattern: Dynamic Context via Tools
```typescript
// Instead of passing stale context, agents call tools to get fresh data
export const getWorkspaceInfo = tool({
  execute: () => {
    // Returns CURRENT state every time
    return WorkspaceProviderState.current?.getState();
  },
});
```

### 5. State Persistence Patterns

#### Pattern: Project-Scoped State
```typescript
// localStorage structure
{
  projectState: {
    projects: [
      {
        id: 'proj-1',
        name: 'Marketing Campaign',
        tabs: [...],              // Project-specific tabs
        activeBriefSectionIds: [...], // Project-specific brief sections
      }
    ],
    currentProjectId: 'proj-1',
  },
  briefState: {
    sections: [
      {
        id: 'brief-1',
        isGlobal: true,          // Appears in all projects
      },
      {
        id: 'brief-2',
        isGlobal: false,         // Only in specified projects
      }
    ]
  }
}
```

#### Pattern: Auto-Disconnect on Context Change
```typescript
// Prevent agent from operating on stale context
useEffect(() => {
  if (status === 'CONNECTED' && currentProjectId !== connectedProjectIdRef.current) {
    console.log('Project switched while connected - auto-disconnecting');
    disconnect();
    addTranscriptBreadcrumb(`Switched to project: ${getCurrentProject().name}`);
  }
}, [currentProjectId, status]);
```

### 6. Error Handling Patterns

#### Pattern: Graceful Guardrail Failures
```typescript
async execute({ agentOutput }) {
  try {
    const res = await runGuardrailClassifier(agentOutput);
    return {
      tripwireTriggered: res.moderationCategory !== 'NONE',
      outputInfo: res,
    };
  } catch (error) {
    console.error('Guardrail failed:', error);
    // Don't block on guardrail failure
    return {
      tripwireTriggered: false,
      outputInfo: { error: 'guardrail_failed' },
    };
  }
}
```

#### Pattern: Tool Execution Fallbacks
```typescript
execute: async (input, details) => {
  try {
    const result = await performComplexOperation(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Tool execution failed:', error);
    
    // Return error info to agent so it can handle gracefully
    return {
      success: false,
      error: error.message,
      suggestion: 'Try breaking this into smaller steps',
    };
  }
}
```

### 7. Performance Optimization Patterns

#### Pattern: Debounced State Saves
```typescript
useEffect(() => {
  // Don't save on every keystroke
  const timeout = setTimeout(() => {
    updateProjectTabs(currentProjectId, tabs);
  }, 200); // Wait 200ms after last change
  
  return () => clearTimeout(timeout);
}, [tabs]);
```

#### Pattern: Grace Period After Loads
```typescript
const lastLoadTimeRef = useRef<number>(0);

// Load effect
useEffect(() => {
  loadTabsFromProject();
  lastLoadTimeRef.current = Date.now();
}, [currentProjectId]);

// Save effect
useEffect(() => {
  const timeSinceLoad = Date.now() - lastLoadTimeRef.current;
  if (timeSinceLoad < 300) {
    return; // Skip save immediately after load
  }
  
  saveTabsToProject();
}, [tabs]);
```

---

## Conclusion

This multi-agent voice system demonstrates sophisticated orchestration patterns:

1. **Specialized Agents**: Each with clear roles and handoff logic
2. **Tool-Based Actions**: Agents manipulate workspace state via function calls
3. **Layered Guardrails**: Safety, workflow, and business rule enforcement
4. **Context Injection**: Workspace state made available to agent tools
5. **Dynamic Handoffs**: Seamless conversation flow between agents
6. **Persistent State**: Project-scoped workspace and brief sections

### Key Takeaways for Modifications:

- **System Prompts**: Edit in `prompts.ts`, be explicit about handoffs and tool usage
- **Handoff Logic**: Wire up in `index.ts`, test conversation flow thoroughly
- **Guardrails**: Layer them (safety → workflow → business), test with edge cases
- **Tools**: Keep them simple, use Responses API for complex orchestration
- **Testing**: Manual conversation testing + automated integration tests

### Next Steps:

1. **Experiment with prompts**: Try different personalities, tones, and workflows
2. **Add custom guardrails**: Define domain-specific safety rules
3. **Create new agents**: Expand the scenario with specialist roles
4. **Test edge cases**: What happens when agents disagree? When context is missing?
5. **Monitor performance**: Track handoff latency, guardrail overhead, tool execution time

---

**Document Version:** 1.0  
**Last Updated:** 2024-10-11  
**Author:** AI Architecture Analysis  

