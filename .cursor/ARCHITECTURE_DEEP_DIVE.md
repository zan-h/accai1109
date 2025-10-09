# Complete Architecture Deep Dive: Realtime Workspace Agents

## Table of Contents
1. [High-Level Overview](#high-level-overview)
2. [Application Entry Points](#application-entry-points)
3. [State Management Architecture](#state-management-architecture)
4. [The Workspace System: Complete Breakdown](#the-workspace-system-complete-breakdown)
5. [The Realtime Agent System](#the-realtime-agent-system)
6. [How Agents Read and Write to Workspace](#how-agents-read-and-write-to-workspace)
7. [Complete User Interaction Flow](#complete-user-interaction-flow)
8. [Component Architecture](#component-architecture)
9. [Audio & Codec System](#audio--codec-system)
10. [Guardrails & Safety](#guardrails--safety)
11. [Data Flow Diagrams](#data-flow-diagrams)

---

## High-Level Overview

Your app is a **voice-first, multi-agent workspace builder** that uses OpenAI's Realtime API to enable natural voice conversations with AI agents that can manipulate a shared workspace (tabs with markdown/CSV content).

### Core Concept
- **User speaks** → OpenAI Realtime API (voice to text + AI response)
- **AI agents** can hand off to each other based on task
- **Agents use tools** to read/write workspace tabs in real-time
- **UI updates immediately** as agents make changes
- **Transcript shows** the full conversation + tool calls

### Tech Stack
```
Frontend:
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- @openai/agents SDK (Realtime API)

Backend:
- Next.js API Routes (serverless)
- OpenAI Realtime API (WebRTC)
- OpenAI Responses API (structured outputs, web search, code interpreter)
```

---

## Application Entry Points

### 1. `/src/app/page.tsx` - Root Page
**Purpose**: The absolute entry point when you navigate to the app.

```tsx
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranscriptProvider>        // Manages conversation history
        <EventProvider>           // Manages debug event logs
          <WorkspaceProvider>     // Manages workspace state (tabs, content)
            <App />               // Main app component
          </WorkspaceProvider>
        </EventProvider>
      </TranscriptProvider>
    </Suspense>
  );
}
```

**What it does**:
1. Wraps the entire app in 3 context providers (more on these below)
2. Uses React Suspense for async loading states
3. Renders `App.tsx` which contains all the UI logic

---

### 2. `/src/app/App.tsx` - Main Application Logic
**Purpose**: The orchestrator - handles connections, agent selection, UI layout.

**Key Responsibilities**:
```typescript
// 1. Manages WebRTC connection to OpenAI Realtime API
const { connect, disconnect, sendUserText, sendEvent, mute, interrupt } 
  = useRealtimeSession({ ... });

// 2. Manages session status (DISCONNECTED | CONNECTING | CONNECTED)
const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");

// 3. Selects which agent scenario to load (via URL param ?agentConfig=workspaceBuilder)
const requested = searchParams.get("agentConfig");

// 4. Handles agent handoffs (when one agent transfers to another)
onAgentHandoff: (agentName: string) => {
  setSelectedAgentName(agentName);
}

// 5. Renders the UI layout
return (
  <div className="flex flex-col h-screen">
    {/* Header with scenario selector */}
    {/* Main content area with Workspace + Transcript + Events */}
    {/* Bottom toolbar with connect/PTT/settings */}
  </div>
);
```

**The connection flow**:
```typescript
// When user clicks "Connect":
connectToRealtime() {
  1. Fetch ephemeral key from /api/session
  2. Get agent scenario from URL (?agentConfig=workspaceBuilder)
  3. Reorder agents to make selected agent the "root"
  4. Create guardrails (moderation)
  5. Call connect({ 
       getEphemeralKey,
       initialAgents,
       audioElement,
       outputGuardrails,
       extraContext
     })
  6. Update status to CONNECTED
  7. Send simulated "hi" to trigger agent greeting
}
```

---

## State Management Architecture

Your app uses **React Context + localStorage** for state management. There are 3 main contexts:

### 1. TranscriptContext (`/src/app/contexts/TranscriptContext.tsx`)
**Purpose**: Manages the conversation transcript (messages, breadcrumbs, tool calls).

**State**:
```typescript
transcriptItems: TranscriptItem[] = [
  {
    itemId: "msg-123",
    type: "MESSAGE",              // or "BREADCRUMB"
    role: "user",                 // or "assistant"
    title: "I need help with...", // the text content
    timestamp: "14:23:45.123",
    status: "DONE",               // or "IN_PROGRESS"
    isHidden: false,
    guardrailResult?: {           // if guardrail was tripped
      status: "DONE",
      category: "OFFENSIVE",
      rationale: "Contains profanity"
    }
  }
]
```

**Methods**:
```typescript
addTranscriptMessage(itemId, role, text, isHidden)  // Add user/assistant message
updateTranscriptMessage(itemId, text, append)       // Update existing message
addTranscriptBreadcrumb(title, data)                // Add system event (like tool call)
toggleTranscriptItemExpand(itemId)                  // Expand/collapse breadcrumb
updateTranscriptItem(itemId, props)                 // Update any property
```

**When it's used**:
- User speaks → adds user message
- Agent responds → adds assistant message
- Agent calls tool → adds breadcrumb
- Guardrail trips → updates message with warning

---

### 2. EventContext (`/src/app/contexts/EventContext.tsx`)
**Purpose**: Manages debug event logs (all WebRTC events, server events).

**State**:
```typescript
loggedEvents: LoggedEvent[] = [
  {
    id: 1,
    direction: "client" | "server",
    timestamp: "14:23:45.123",
    eventName: "session.update",
    eventData: { ... },
    expanded: false
  }
]
```

**Methods**:
```typescript
logClientEvent(event, suffix)  // Log events sent to OpenAI
logServerEvent(event)          // Log events received from OpenAI
toggleEventExpand(id)          // Expand/collapse event details
```

**When it's used**:
- Every WebRTC event (session.update, input_audio_buffer.commit, etc.)
- Every server response (response.created, conversation.item.created, etc.)
- Tool calls and responses
- Shown in the Events panel (can be toggled on/off)

---

### 3. WorkspaceContext (`/src/app/contexts/WorkspaceContext.tsx`)
**Purpose**: Manages the workspace tabs and content. **THIS IS THE CORE OF YOUR WORKSPACE SYSTEM**.

**State**:
```typescript
interface WorkspaceState {
  name: string;              // e.g., "My Energy Tracker"
  description: string;       // e.g., "Daily energy management workspace"
  tabs: WorkspaceTab[];      // Array of tabs
  selectedTabId: string;     // Currently visible tab
  
  // Mutators
  setName(n: string)
  setDescription(d: string)
  setTabs(tabs: WorkspaceTab[])
  addTab(partial?: Partial<WorkspaceTab>)
  renameTab(id: string, newName: string)
  deleteTab(id: string)
  setSelectedTabId(id: string)
}

interface WorkspaceTab {
  id: string;           // nanoid()
  name: string;         // "Morning Routine"
  type: "markdown" | "csv";
  content: string;      // The actual content
}
```

**Persistence**:
```typescript
// On mount: Load from localStorage
useEffect(() => {
  const saved = localStorage.getItem('workspaceState');
  if (saved) {
    const parsed = JSON.parse(saved);
    setName(parsed.name);
    setTabs(parsed.tabs);
    // ...
  }
}, []);

// On every change: Save to localStorage
useEffect(() => {
  const state = { name, description, tabs, selectedTabId };
  localStorage.setItem('workspaceState', JSON.stringify(state));
}, [name, description, tabs, selectedTabId]);
```

**Special feature: Imperative access**:
```typescript
// For agents to access state outside React components:
useWorkspaceContext.getState = (): WorkspaceState => {
  return WorkspaceProviderState.current;
};

// Usage in agent tools:
const ws = useWorkspaceContext.getState();
ws.addTab({ name: "New Tab", type: "markdown" });
```

**Helper functions** (used by agents):
```typescript
// These are EXPORTED and called by agent tools
export async function setWorkspaceInfo(input: any)
export async function addWorkspaceTab(input: any)
export async function renameWorkspaceTab(input: any)
export async function deleteWorkspaceTab(input: any)
export async function setTabContent(input: any)
export async function getWorkspaceInfo()
```

---

## The Workspace System: Complete Breakdown

### Component Hierarchy
```
App.tsx
└── Workspace.tsx (only shown when agentConfig=workspaceBuilder)
    ├── Sidebar.tsx (tab list on left)
    │   ├── TabItem (each tab)
    │   ├── Add Tab button
    │   └── Reset Workspace button
    └── TabContent.tsx (right side content area)
        ├── MarkdownView (if tab.type === "markdown")
        └── CsvView (if tab.type === "csv")
```

### How it works step-by-step:

#### 1. **App.tsx conditionally renders Workspace**
```tsx
{typeof window !== 'undefined' && 
 (new URL(window.location.href).searchParams.get('agentConfig') === 'workspaceBuilder') && (
  <Workspace />
)}
```
Only shown when URL is `?agentConfig=workspaceBuilder`.

#### 2. **Workspace.tsx** (Container)
```tsx
function Workspace() {
  // Get data from context
  const tabs = useWorkspaceContext(s => s.tabs);
  const selectedTabId = useWorkspaceContext(s => s.selectedTabId);
  
  // Get mutators
  const addTab = useWorkspaceContext(s => s.addTab);
  const renameTab = useWorkspaceContext(s => s.renameTab);
  const deleteTab = useWorkspaceContext(s => s.deleteTab);
  const setSelectedTabId = useWorkspaceContext(s => s.setSelectedTabId);
  
  // Ensure at least one tab exists
  useEffect(() => {
    if (tabs.length === 0) {
      addTab(); // Creates "Tab 1"
    }
  }, [tabs]);
  
  return (
    <div className="flex">
      <Sidebar 
        tabs={tabs}
        selectedTabId={selectedTabId}
        onSelect={setSelectedTabId}
        onRename={renameTab}
        onDelete={deleteTab}
        onAdd={addTab}
      />
      <TabContent tab={selectedTab} />
    </div>
  );
}
```

#### 3. **Sidebar.tsx** (Tab List)
```tsx
function Sidebar({ tabs, selectedTabId, onSelect, onRename, onDelete, onAdd }) {
  return (
    <div>
      <ul>
        {tabs.map(tab => (
          <TabItem 
            key={tab.id}
            tab={tab}
            isActive={tab.id === selectedTabId}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </ul>
      
      <button onClick={onAdd}>Add tab</button>
      
      <button onClick={() => {
        localStorage.removeItem('workspaceState');
        window.location.reload();
      }}>
        Reset Workspace
      </button>
    </div>
  );
}
```

**Tab editing**:
```tsx
function TabItem({ tab, isActive, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(tab.name);
  
  const saveName = () => {
    if (draftName.trim() !== tab.name) {
      onRename(tab.id, draftName.trim());
    }
    setEditing(false);
  };
  
  return (
    <li onClick={() => onSelect(tab.id)}>
      {editing ? (
        <input 
          value={draftName}
          onChange={e => setDraftName(e.target.value)}
          onBlur={saveName}
          onKeyDown={e => e.key === 'Enter' && saveName()}
        />
      ) : (
        <>
          <span>{tab.name}</span>
          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={() => onDelete(tab.id)}>Delete</button>
        </>
      )}
    </li>
  );
}
```

#### 4. **TabContent.tsx** (Content Viewer/Editor)
```tsx
function TabContent({ tab }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tab?.content ?? "");
  
  const tabs = useWorkspaceContext(ws => ws.tabs);
  const setTabs = useWorkspaceContext(ws => ws.setTabs);
  
  const handleSave = () => {
    setTabs(tabs.map(t => 
      t.id === tab.id ? { ...t, content: draft } : t
    ));
    setEditing(false);
  };
  
  if (editing) {
    return (
      <div>
        <textarea 
          value={draft}
          onChange={e => setDraft(e.target.value)}
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={() => setEditing(false)}>Cancel</button>
      </div>
    );
  }
  
  // View mode
  return (
    <div>
      <button onClick={() => setEditing(true)}>Edit</button>
      {tab.type === "markdown" ? (
        <MarkdownView markdown={draft} />
      ) : (
        <CsvView csv={draft} />
      )}
    </div>
  );
}
```

**Markdown rendering**:
```tsx
function MarkdownView({ markdown }) {
  return (
    <ReactMarkdown>{markdown}</ReactMarkdown>
  );
}
```

**CSV rendering** (pipe-delimited):
```tsx
function CsvView({ csv }) {
  const rows = parseCsv(csv); // Split by \n, then by |
  const header = rows[0];
  const dataRows = rows.slice(1);
  
  return (
    <table>
      <thead>
        <tr>{header.map(h => <th>{h}</th>)}</tr>
      </thead>
      <tbody>
        {dataRows.map(row => (
          <tr>{row.map(cell => <td>{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

function parseCsv(src) {
  return src
    .trim()
    .split(/\n|\r\n/)
    .map(line => line.split("|").map(s => s.trim()));
}
```

---

## The Realtime Agent System

### Agent Architecture

Your app uses the `@openai/agents` SDK which provides:
1. **RealtimeAgent** - An agent with a name, voice, instructions, tools, and handoffs
2. **RealtimeSession** - Manages the WebRTC connection and agent orchestration
3. **tool()** - Helper to define tools with schemas and execute functions

### Agent Scenario Structure

Location: `/src/app/agentConfigs/scenarios/workspaceBuilder/`

```
workspaceBuilder/
├── index.ts              # Exports the scenario (3 agents with handoffs)
├── workspaceManager.ts   # Energy Coach agent (main workspace controller)
├── designer.ts           # Task Strategist agent (web search)
├── estimator.ts          # Body Doubling agent (calculations)
├── prompts.ts            # System prompts for each agent
├── utils.ts              # Shared utilities (API calls)
└── guardrails.ts         # Scenario-specific guardrails
```

### The 3 Agents in workspaceBuilder Scenario

#### 1. **Energy Coach** (workspaceManager.ts)
```typescript
export const energyCoachAgent = new RealtimeAgent({
  name: 'energyCoach',
  voice: 'sage',
  instructions: energyCoachPrompt2, // System prompt
  tools: [
    workspaceInfoTool,         // get_workspace_info
    addWorkspaceTabTool,       // add_workspace_tab
    setSelectedTabIdTool,      // set_selected_tab_id
    renameWorkspaceTabTool,    // rename_workspace_tab
    deleteWorkspaceTabTool,    // delete_workspace_tab
    setTabContentTool,         // set_tab_content
  ],
  handoffs: [taskStrategistAgent, bodyDoublingAgent],
});
```

**What it can do**:
- Read workspace state (`get_workspace_info`)
- Add/rename/delete tabs
- Set content in tabs
- Hand off to Task Strategist (for research) or Body Doubling (for motivation)

**Tool Example**:
```typescript
export const workspaceTools = [
  tool({
    name: 'add_workspace_tab',
    description: 'Add a new tab to the workspace',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string' }, // 'markdown' or 'csv'
        content: { type: 'string' }
      },
      required: ['name', 'type']
    },
    execute: addWorkspaceTab, // Function from WorkspaceContext
  }),
  // ... more tools
];
```

#### 2. **Task Strategist** (designer.ts)
```typescript
export const taskStrategistAgent = new RealtimeAgent({
  name: 'taskStrategist',
  voice: 'sage',
  instructions: taskStrategistPrompt2,
  tools: [
    searchTheWeb,           // Search the web and return markdown
    workspaceInfoTool,      // Read workspace state
    makeWorkspaceChanges,   // Make workspace changes via supervisor pattern
  ],
  handoffs: [bodyDoublingAgent, energyCoachAgent],
});
```

**What it can do**:
- Search the web using OpenAI's `web_search_preview` tool
- Read workspace state
- Make workspace changes via the `makeWorkspaceChanges` tool (supervisor pattern)

**searchTheWeb tool**:
```typescript
const searchTheWeb = tool({
  name: 'searchTheWeb',
  description: 'Search the web for helpful information',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string' }
    },
    required: ['query']
  },
  execute: async (input, details) => {
    const { query } = input;
    
    // Call OpenAI Responses API with web_search_preview tool
    const body = {
      model: "gpt-4.1",
      tools: [{ type: "web_search_preview" }],
      tool_choice: "required",
      input: `Search the web and respond with relevant info.
              Search Query: ${query}`
    };
    
    const response = await fetchResponsesMessage(body);
    return { webResponse: response.output_text };
  }
});
```

#### 3. **Body Doubling** (estimator.ts)
```typescript
export const bodyDoublingAgent = new RealtimeAgent({
  name: 'bodyDoubling',
  voice: 'sage',
  instructions: bodyDoublingPrompt2,
  tools: [
    calculate,              // Code interpreter for calculations
    workspaceInfoTool,      // Read workspace
    makeWorkspaceChanges,   // Update workspace
  ],
  handoffs: [energyCoachAgent, taskStrategistAgent],
});
```

**calculate tool** (uses code_interpreter):
```typescript
const calculate = tool({
  name: 'calculate',
  description: 'Calculate construction costs or timeline',
  parameters: {
    type: 'object',
    properties: {
      data_to_calculate: { type: 'string' }
    },
    required: ['data_to_calculate']
  },
  execute: async (input, details) => {
    const body = {
      model: "gpt-4.1",
      tools: [{
        type: "code_interpreter",
        container: { type: "auto" }
      }],
      instructions: "You are a calculator assistant...",
      input: `Calculation: ${input.data_to_calculate}`
    };
    
    const response = await fetchResponsesMessage(body);
    return { calculatorResponse: response.output_text };
  }
});
```

### Handoff System

In `index.ts`, the agents are wired together:
```typescript
// Energy Coach can hand off to either Task Strategist or Body Doubling
(energyCoachAgent.handoffs as any).push(taskStrategistAgent, bodyDoublingAgent);

// Task Strategist can hand off to Body Doubling or back to Energy Coach
(taskStrategistAgent.handoffs as any).push(bodyDoublingAgent, energyCoachAgent);

// Body Doubling can hand off back to Energy Coach or Task Strategist
(bodyDoublingAgent.handoffs as any).push(energyCoachAgent, taskStrategistAgent);

export const workspaceBuilderScenario = [
  energyCoachAgent,
  taskStrategistAgent,
  bodyDoublingAgent,
];
```

**How handoffs work**:
1. When an agent decides to hand off, it calls `transfer_to_{agentName}`
2. The SDK emits an `agent_handoff` event
3. `useRealtimeSession` catches this and calls `onAgentHandoff(agentName)`
4. App.tsx updates `selectedAgentName` state
5. A breadcrumb is added to the transcript: "Agent: taskStrategist"

---

## How Agents Read and Write to Workspace

This is the **CRITICAL PART** you asked about. Here's the complete flow:

### Reading from Workspace

#### Method 1: Direct tool call (Energy Coach only)
```typescript
// Agent calls: get_workspace_info()
// Tool definition:
export const workspaceInfoTool = tool({
  name: 'get_workspace_info',
  description: 'Get the current state of the workspace',
  parameters: { type: 'object', properties: {}, required: [] },
  execute: getWorkspaceInfo,
});

// Implementation (in WorkspaceContext.tsx):
export async function getWorkspaceInfo() {
  const ws = useWorkspaceContext.getState(); // Imperative access!
  return { workspace: ws };
  // Returns: { workspace: { name, description, tabs: [...], selectedTabId } }
}
```

**Flow**:
```
Agent decides to check workspace
  → Calls get_workspace_info tool
    → execute() runs getWorkspaceInfo()
      → useWorkspaceContext.getState() reads from React context
        → Returns full workspace state
          → Agent receives { workspace: { tabs: [...] } }
            → Agent now knows all tabs and content
```

#### Method 2: Via makeWorkspaceChanges (Task Strategist & Body Doubling)
```typescript
// These agents can't directly access workspace tools
// Instead, they call makeWorkspaceChanges which internally calls getWorkspaceInfo

const makeWorkspaceChanges = tool({
  name: 'makeWorkspaceChanges',
  description: 'Make changes to the workspace',
  parameters: {
    type: 'object',
    properties: {
      tabsToChange: { type: 'string' },
      workspaceChangesToMake: { type: 'string' }
    }
  },
  execute: async (input, details) => {
    // 1. Get conversation history
    const history = details?.context?.history ?? [];
    
    // 2. Get current workspace state
    const currentWorkspace = await getWorkspaceInfo();
    
    // 3. Call OpenAI Responses API with workspace tools
    const body = {
      model: 'gpt-4.1',
      input: [
        { role: 'system', content: 'You are a workspace builder...' },
        { role: 'user', content: `
          Conversation History: ${JSON.stringify(history)}
          Current Workspace: ${JSON.stringify(currentWorkspace)}
          Requested Changes: ${input.workspaceChangesToMake}
        `}
      ],
      tools: workspaceTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        type: 'function'
      }))
    };
    
    // 4. Send to OpenAI and handle tool calls
    const response = await fetchResponsesMessage(body);
    const finalText = await handleToolCalls(body, response);
    
    return { workspaceManagerResponse: finalText };
  }
});
```

This is a **supervisor pattern**: The agent delegates workspace changes to a GPT-4.1 model that has access to all workspace tools.

### Writing to Workspace

#### Method 1: Direct tool calls (Energy Coach)
```typescript
// Agent calls: add_workspace_tab({ name: "Morning Routine", type: "markdown", content: "..." })

export const addWorkspaceTabTool = tool({
  name: 'add_workspace_tab',
  description: 'Add a new tab',
  parameters: { /* ... */ },
  execute: addWorkspaceTab,
});

// Implementation (in WorkspaceContext.tsx):
export async function addWorkspaceTab(input: any) {
  const { name, type, content } = input;
  const ws = useWorkspaceContext.getState(); // Imperative access!
  
  const newTab: WorkspaceTab = {
    id: nanoid(),
    name: name || `Tab ${ws.tabs.length + 1}`,
    type: type === 'csv' ? 'csv' : 'markdown',
    content: content || '',
  };
  
  // THIS IS WHERE THE MAGIC HAPPENS!
  ws.setTabs([...ws.tabs, newTab]); // Updates React state
  ws.setSelectedTabId(newTab.id);   // Selects the new tab
  
  return { message: `Tab '${newTab.name}' added.` };
}
```

**Flow**:
```
Agent: "I'll create a morning routine tab for you"
  → Agent calls add_workspace_tab({ name: "Morning Routine", type: "markdown", content: "# Morning..." })
    → execute() runs addWorkspaceTab()
      → useWorkspaceContext.getState() gets workspace
        → ws.setTabs([...ws.tabs, newTab]) updates React state
          → WorkspaceContext re-renders
            → Sidebar.tsx re-renders with new tab
              → TabContent.tsx shows new tab content
                → User sees new tab immediately!
```

**The key mechanism**: `useWorkspaceContext.getState()` provides **imperative access** to React state from outside components.

```typescript
// In WorkspaceContext.tsx:
const WorkspaceProviderState = { current: null as unknown as WorkspaceState };

export const WorkspaceProvider: FC<PropsWithChildren> = ({ children }) => {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([]);
  // ... other state
  
  const value: WorkspaceState = {
    tabs,
    setTabs,
    // ... other methods
  };
  
  // UPDATE THE REF ON EVERY RENDER!
  WorkspaceProviderState.current = value;
  
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

// Expose getState for imperative access
useWorkspaceContext.getState = (): WorkspaceState => {
  return WorkspaceProviderState.current;
};
```

This pattern allows agent tools (which run as async functions, not React components) to access and mutate React state!

#### Other write operations:
```typescript
// Set content of existing tab
setTabContent({ name: "Morning Routine", content: "# Updated content..." })
  → Finds tab by name
    → ws.setTabs(ws.tabs.map(t => t.id === targetId ? { ...t, content } : t))
      → React re-renders TabContent with new content

// Rename tab
renameWorkspaceTab({ current_name: "Tab 1", new_name: "Evening Routine" })
  → ws.renameTab(targetId, new_name)
    → React re-renders Sidebar with new name

// Delete tab
deleteWorkspaceTab({ name: "Old Tab" })
  → ws.deleteTab(targetId)
    → React removes tab from Sidebar
```

### The Complete Agent → Workspace Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ User speaks: "Create a morning routine tab for me"              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ OpenAI Realtime API receives audio                              │
│  → Transcribes to text                                          │
│  → GPT-4o (energyCoach agent) processes request                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Agent decides to call tool: add_workspace_tab                   │
│  → Generates function call in response                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ SDK emits "agent_tool_start" event                              │
│  → useHandleSessionHistory catches it                           │
│    → addTranscriptBreadcrumb("function call: add_workspace_tab")│
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Tool.execute() runs: addWorkspaceTab({ name: "Morning..." })    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Inside addWorkspaceTab():                                       │
│  1. const ws = useWorkspaceContext.getState()                   │
│  2. const newTab = { id: nanoid(), name, type, content }        │
│  3. ws.setTabs([...ws.tabs, newTab])  ← REACT STATE UPDATE!    │
│  4. ws.setSelectedTabId(newTab.id)                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ WorkspaceContext state updates                                  │
│  → tabs array now includes new tab                              │
│  → selectedTabId points to new tab                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ React re-renders components subscribed to WorkspaceContext      │
│  → Workspace.tsx                                                │
│    → Sidebar.tsx (shows new tab in list)                        │
│    → TabContent.tsx (shows new tab content)                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ SDK emits "agent_tool_end" event                                │
│  → addTranscriptBreadcrumb("function call result: add_...")     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Agent receives tool result: { message: "Tab 'Morning...' added" }│
│  → Generates voice response: "I've created a morning routine tab"│
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ User hears response AND sees new tab in UI simultaneously!      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Complete User Interaction Flow

Let's trace a full conversation from start to finish:

### Scenario: User wants to create a workout plan

```
1. User loads app at /?agentConfig=workspaceBuilder

2. App.tsx initializes:
   - Loads workspaceBuilder scenario (3 agents)
   - Sets energyCoach as root agent
   - Status: DISCONNECTED

3. User clicks "Connect"
   
4. connectToRealtime():
   - Fetches ephemeral key from /api/session
   - Creates RealtimeSession with:
     * rootAgent: energyCoach
     * transport: OpenAIRealtimeWebRTC
     * audioElement: <audio> tag
     * guardrails: [moderationGuardrail]
   - Connects via WebRTC
   - Status: CONNECTED
   - Sends simulated "hi" message

5. Agent responds: "Hello! I'm your Energy Coach. How can I help you today?"
   - Server sends response.audio_transcript.delta events
   - useHandleSessionHistory catches them
   - Updates transcript with agent message
   - Audio plays through <audio> element

6. User speaks: "I want to create a workout plan"
   - Browser captures audio via WebRTC
   - Sent to OpenAI Realtime API
   - Server transcribes: "I want to create a workout plan"
   - Server sends conversation.item.input_audio_transcription.completed
   - useHandleSessionHistory adds user message to transcript

7. Agent (energyCoach) processes request:
   - Decides to check current workspace first
   - Calls tool: get_workspace_info()
   
8. get_workspace_info executes:
   - useWorkspaceContext.getState() returns current state
   - Returns { workspace: { tabs: [{ name: "Tab 1", content: "" }] } }
   
9. Agent decides to create new tab:
   - Calls tool: add_workspace_tab({
       name: "Workout Plan",
       type: "markdown",
       content: "# My Workout Plan\n\n..."
     })

10. add_workspace_tab executes:
    - Creates newTab with nanoid()
    - ws.setTabs([...ws.tabs, newTab])
    - ws.setSelectedTabId(newTab.id)
    - Returns { message: "Tab 'Workout Plan' added." }

11. React re-renders:
    - Sidebar now shows "Workout Plan" tab (selected with cyan glow)
    - TabContent shows the markdown content
    - User sees the tab instantly!

12. Agent speaks: "I've created a Workout Plan tab for you with some starter content. Would you like me to help you customize it?"

13. User: "Yes, add a section for Monday workouts"

14. Agent calls: set_tab_content({
      name: "Workout Plan",
      content: "# My Workout Plan\n\n## Monday\n- Push-ups\n- Squats\n..."
    })

15. set_tab_content executes:
    - Finds tab by name
    - ws.setTabs(tabs.map(t => t.name === "Workout Plan" ? { ...t, content } : t))
    - TabContent re-renders with updated content

16. User sees content update in real-time!

17. User: "Can you search for beginner workout tips?"

18. Agent decides to hand off to Task Strategist:
    - Calls transfer_to_taskStrategist
    - SDK emits agent_handoff event
    - App.tsx updates selectedAgentName to "taskStrategist"
    - Transcript shows breadcrumb: "Agent: taskStrategist"

19. Task Strategist takes over:
    - "Hi! I can help with research. Let me search for beginner workout tips."
    - Calls tool: searchTheWeb({ query: "beginner workout tips" })

20. searchTheWeb executes:
    - Calls /api/responses with web_search_preview tool
    - OpenAI searches web and returns markdown with links
    - Returns { webResponse: "Here are some tips:\n- Start slow\n..." }

21. Task Strategist: "I found some great tips! Would you like me to add them to your Workout Plan tab?"

22. User: "Yes please"

23. Task Strategist calls: makeWorkspaceChanges({
      tabsToChange: "Workout Plan",
      workspaceChangesToMake: "Add the web search results to the tab"
    })

24. makeWorkspaceChanges executes:
    - Gets current workspace state
    - Calls OpenAI Responses API with supervisor prompt
    - Supervisor calls set_tab_content with updated content
    - Workspace updates!

25. User sees the tips added to their tab instantly!

26. User: "Thanks! I'm done for now."

27. Task Strategist: "Great! Would you like to go back to the Energy Coach?"
    - Calls transfer_to_energyCoach
    - Hands back to Energy Coach

28. Energy Coach: "Welcome back! Your Workout Plan is looking great. Let me know if you need anything else!"

29. User clicks "Disconnect"
    - disconnect() closes WebRTC connection
    - Status: DISCONNECTED
    - Workspace state persists in localStorage
```

---

## Component Architecture

### UI Layout Structure

```
App.tsx (flex flex-col h-screen)
├── Header (p-5)
│   ├── Logo + Title
│   └── Scenario Selector (dropdown)
│
├── Main Content Area (flex flex-1)
│   ├── Workspace (conditional, only if agentConfig=workspaceBuilder)
│   │   ├── Header (Workspace title)
│   │   ├── Sidebar (w-48)
│   │   │   ├── Tab list
│   │   │   ├── Add tab button
│   │   │   └── Reset button
│   │   └── TabContent (flex-1)
│   │       ├── Edit button
│   │       └── Content viewer (Markdown/CSV)
│   │
│   ├── Transcript (flex-1)
│   │   ├── Header (Transcript title + buttons)
│   │   ├── Messages list
│   │   │   ├── User messages (gray bg)
│   │   │   ├── Assistant messages (cyan border)
│   │   │   └── Breadcrumbs (system events)
│   │   ├── Text input
│   │   └── Send button
│   │
│   └── Events (conditional, if expanded)
│       ├── Header (Events title)
│       └── Event logs list
│           ├── Client events
│           └── Server events
│
└── Bottom Toolbar (sticky bottom)
    ├── Connect/Disconnect button
    ├── PTT toggle
    ├── Talk button (hold to speak)
    ├── Show Events toggle
    ├── Audio Playback toggle
    └── Codec selector
```

### Key Components Deep Dive

#### Transcript.tsx
```tsx
function Transcript({ userText, setUserText, onSendMessage, canSend }) {
  const { transcriptItems } = useTranscript();
  
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="header">
        <span>Transcript</span>
        <button onClick={downloadTranscript}>Copy</button>
        <button onClick={downloadRecording}>Download Audio</button>
      </div>
      
      {/* Messages */}
      <div className="messages overflow-auto">
        {transcriptItems.map(item => {
          if (item.type === "MESSAGE") {
            return (
              <div className={item.role === "user" ? "user-message" : "assistant-message"}>
                <span className="timestamp">{item.timestamp}</span>
                <div className="content">{item.title}</div>
                {item.guardrailResult && (
                  <GuardrailChip result={item.guardrailResult} />
                )}
              </div>
            );
          } else if (item.type === "BREADCRUMB") {
            return (
              <div className="breadcrumb" onClick={() => toggleExpand(item.itemId)}>
                <span>{item.title}</span>
                {item.expanded && (
                  <pre>{JSON.stringify(item.data, null, 2)}</pre>
                )}
              </div>
            );
          }
        })}
      </div>
      
      {/* Input */}
      <div className="input-area">
        <textarea 
          value={userText}
          onChange={e => setUserText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
        />
        <button onClick={onSendMessage} disabled={!canSend}>
          Send
        </button>
      </div>
    </div>
  );
}
```

#### BottomToolbar.tsx
```tsx
function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isPTTActive,
  setIsPTTActive,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
  // ... other props
}) {
  return (
    <div className="toolbar">
      {/* Connect/Disconnect */}
      {sessionStatus === "CONNECTED" ? (
        <button onClick={onToggleConnection} className="disconnect-btn">
          Disconnect
        </button>
      ) : (
        <button onClick={onToggleConnection} className="connect-btn">
          Connect
        </button>
      )}
      
      {/* PTT Toggle */}
      <label>
        <input 
          type="checkbox"
          checked={isPTTActive}
          onChange={e => setIsPTTActive(e.target.checked)}
        />
        Push to Talk
      </label>
      
      {/* Talk Button (only shown if PTT active) */}
      {isPTTActive && (
        <button
          onMouseDown={handleTalkButtonDown}
          onMouseUp={handleTalkButtonUp}
          onTouchStart={handleTalkButtonDown}
          onTouchEnd={handleTalkButtonUp}
          className={isPTTUserSpeaking ? "active" : ""}
        >
          {isPTTUserSpeaking ? "Release to send" : "Hold to talk"}
        </button>
      )}
      
      {/* Other controls */}
      <label>
        <input 
          type="checkbox"
          checked={isEventsPaneExpanded}
          onChange={e => setIsEventsPaneExpanded(e.target.checked)}
        />
        Show Events
      </label>
      
      <label>
        <input 
          type="checkbox"
          checked={isAudioPlaybackEnabled}
          onChange={e => setIsAudioPlaybackEnabled(e.target.checked)}
        />
        Audio Playback
      </label>
      
      <select value={codec} onChange={e => onCodecChange(e.target.value)}>
        <option value="opus">Opus (48kHz)</option>
        <option value="pcmu">PCMU (8kHz)</option>
        <option value="pcma">PCMA (8kHz)</option>
      </select>
    </div>
  );
}
```

#### Events.tsx
```tsx
function Events({ isExpanded }) {
  const { loggedEvents, toggleEventExpand } = useEvent();
  
  if (!isExpanded) return null;
  
  return (
    <div className="events-panel">
      <div className="header">Events</div>
      <div className="event-list">
        {loggedEvents.map(event => (
          <div 
            key={event.id}
            className={`event ${event.direction}`}
            onClick={() => toggleEventExpand(event.id)}
          >
            <span className="timestamp">{event.timestamp}</span>
            <span className="direction">{event.direction}</span>
            <span className="name">{event.eventName}</span>
            {event.expanded && (
              <pre>{JSON.stringify(event.eventData, null, 2)}</pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Audio & Codec System

### Audio Architecture

```
User's Microphone
  ↓
WebRTC getUserMedia()
  ↓
OpenAI Realtime API (WebRTC peer connection)
  ↓
Speech-to-Text (Whisper)
  ↓
GPT-4o processes text
  ↓
Text-to-Speech (OpenAI TTS)
  ↓
WebRTC Audio Stream
  ↓
<audio> element in browser
  ↓
User's Speakers
```

### Codec Selection

Location: `/src/app/lib/codecUtils.ts`

```typescript
export function audioFormatForCodec(codec: string): string {
  switch (codec.toLowerCase()) {
    case "opus":
      return "pcm16"; // 48kHz wide-band
    case "pcmu":
    case "pcma":
      return "g711_ulaw"; // 8kHz narrow-band
    default:
      return "pcm16";
  }
}

export function applyCodecPreferences(
  pc: RTCPeerConnection,
  preferredCodec: string
): RTCPeerConnection {
  const transceivers = pc.getTransceivers();
  
  transceivers.forEach(transceiver => {
    if (transceiver.sender.track?.kind === "audio") {
      const capabilities = RTCRtpSender.getCapabilities("audio");
      const codecs = capabilities?.codecs || [];
      
      // Reorder codecs to prefer selected one
      const preferred = codecs.filter(c => 
        c.mimeType.toLowerCase().includes(preferredCodec.toLowerCase())
      );
      const others = codecs.filter(c => 
        !c.mimeType.toLowerCase().includes(preferredCodec.toLowerCase())
      );
      
      transceiver.setCodecPreferences([...preferred, ...others]);
    }
  });
  
  return pc;
}
```

**How it's used in useRealtimeSession**:
```typescript
sessionRef.current = new RealtimeSession(rootAgent, {
  transport: new OpenAIRealtimeWebRTC({
    audioElement,
    changePeerConnection: async (pc: RTCPeerConnection) => {
      applyCodecPreferences(pc, codecParam); // Apply codec before offer
      return pc;
    },
  }),
  config: {
    inputAudioFormat: audioFormatForCodec(codecParam),  // "pcm16" or "g711_ulaw"
    outputAudioFormat: audioFormatForCodec(codecParam),
    inputAudioTranscription: { model: 'whisper-1' },
  },
});
```

### Push-to-Talk (PTT) Implementation

**Server VAD** (Voice Activity Detection):
```typescript
// When PTT is OFF (default), server automatically detects speech
const turnDetection = {
  type: 'server_vad',
  threshold: 0.9,              // How confident server must be that user is speaking
  prefix_padding_ms: 300,       // Include 300ms before speech starts
  silence_duration_ms: 500,     // Wait 500ms of silence before considering speech ended
  create_response: true,        // Automatically trigger response when user stops speaking
};

sendEvent({ type: 'session.update', session: { turn_detection: turnDetection } });
```

**PTT Mode**:
```typescript
// When PTT is ON, disable server VAD
const turnDetection = null;
sendEvent({ type: 'session.update', session: { turn_detection: null } });

// User presses "Talk" button
handleTalkButtonDown() {
  interrupt(); // Stop agent if speaking
  setIsPTTUserSpeaking(true);
  sendEvent({ type: 'input_audio_buffer.clear' }); // Clear any buffered audio
}

// User releases "Talk" button
handleTalkButtonUp() {
  setIsPTTUserSpeaking(false);
  sendEvent({ type: 'input_audio_buffer.commit' }); // Commit audio to server
  sendEvent({ type: 'response.create' });           // Trigger agent response
}
```

---

## Guardrails & Safety

Location: `/src/app/agentConfigs/guardrails/moderation.ts`

### How Guardrails Work

```typescript
export function createModerationGuardrail(companyName: string) {
  return async (
    details: GuardrailDetails,
    session: RealtimeSession,
    output: any
  ): Promise<GuardrailResult> => {
    // Extract agent's message
    const lastMessage = details.context.history
      .reverse()
      .find(item => item.type === 'message' && item.role === 'assistant');
    
    if (!lastMessage?.content) {
      return { result: 'PASS' };
    }
    
    const testText = extractMessageText(lastMessage.content);
    
    // Call OpenAI Responses API for moderation
    const moderationResult = await moderateText(testText, companyName);
    
    if (moderationResult.moderationCategory !== "NONE") {
      // TRIPWIRE! Return failure to SDK
      return {
        result: 'FAIL',
        output: {
          outputInfo: {
            moderationCategory: moderationResult.moderationCategory,
            moderationRationale: moderationResult.moderationRationale,
            testText,
          },
        },
      };
    }
    
    return { result: 'PASS' };
  };
}

async function moderateText(text: string, companyName: string) {
  const response = await fetch('/api/responses', {
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-4.1',
      input: `Company: ${companyName}\nAgent said: "${text}"`,
      output: GuardrailOutputZod, // Structured output with category + rationale
    }),
  });
  
  return await response.json();
}
```

### Guardrail Categories
```typescript
export const MODERATION_CATEGORIES = [
  "OFFENSIVE",   // Profanity, hate speech
  "OFF_BRAND",   // Mentions competitors, off-brand language
  "VIOLENCE",    // Violent content
  "NONE",        // No issues
] as const;
```

### How Guardrails Integrate

```typescript
// In App.tsx, when connecting:
const guardrails = [createModerationGuardrail("accai")];

await connect({
  getEphemeralKey: async () => EPHEMERAL_KEY,
  initialAgents: reorderedAgents,
  audioElement: sdkAudioElement,
  outputGuardrails: guardrails, // ← Applied to all agent outputs
  extraContext: { addTranscriptBreadcrumb },
});
```

**When guardrail trips**:
```
Agent generates response with problematic content
  ↓
Guardrail function runs before response is sent
  ↓
moderateText() calls /api/responses with structured output
  ↓
GPT-4.1 analyzes: { moderationCategory: "OFFENSIVE", moderationRationale: "..." }
  ↓
Guardrail returns { result: 'FAIL', output: { ... } }
  ↓
SDK emits "guardrail_tripped" event
  ↓
useHandleSessionHistory catches event
  ↓
updateTranscriptItem(itemId, { guardrailResult: { status: 'DONE', category, rationale } })
  ↓
Transcript shows GuardrailChip component with warning
  ↓
Agent receives correction message and regenerates response
```

### GuardrailChip Component
```tsx
function GuardrailChip({ result }) {
  const { category, rationale, testText } = result;
  
  const colorMap = {
    OFFENSIVE: 'status-error',
    OFF_BRAND: 'status-warning',
    VIOLENCE: 'status-error',
    NONE: 'status-success',
  };
  
  return (
    <div className={`guardrail-chip ${colorMap[category]}`}>
      <div className="dot" /> {/* Pulsing colored dot */}
      <span className="category">{category}</span>
      <span className="rationale">{rationale}</span>
      {testText && <span className="excerpt">{testText.slice(0, 50)}...</span>}
    </div>
  );
}
```

---

## Data Flow Diagrams

### Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser (Client)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    React Component Tree                      │  │
│  │                                                              │  │
│  │  page.tsx                                                    │  │
│  │    ├── TranscriptProvider ─────┐                            │  │
│  │    ├── EventProvider ──────────┼──┐                         │  │
│  │    └── WorkspaceProvider ──────┼──┼──┐                      │  │
│  │          └── App.tsx            │  │  │                      │  │
│  │                ├── Workspace ◄──┼──┼──┘                      │  │
│  │                │    ├── Sidebar │  │                         │  │
│  │                │    └── TabContent                           │  │
│  │                ├── Transcript ◄─┘  │                         │  │
│  │                ├── Events ◄────────┘                         │  │
│  │                └── BottomToolbar                             │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   Custom Hooks Layer                         │  │
│  │                                                              │  │
│  │  useRealtimeSession ◄─── Manages WebRTC connection          │  │
│  │  useHandleSessionHistory ◄── Processes events               │  │
│  │  useAudioDownload ◄───── Records audio                      │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              @openai/agents SDK                              │  │
│  │                                                              │  │
│  │  RealtimeSession ◄─── Orchestrates agents + tools           │  │
│  │  OpenAIRealtimeWebRTC ◄── Handles WebRTC transport          │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ WebRTC (audio + events)
                       │
┌──────────────────────▼──────────────────────────────────────────────┐
│                     OpenAI Realtime API                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Audio Input → Whisper (STT) → GPT-4o → TTS → Audio Output        │
│                                    │                                │
│                          Agent Tools Execution                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS API calls
                       │
┌──────────────────────▼──────────────────────────────────────────────┐
│                  Next.js API Routes (Backend)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /api/session ──────► Create ephemeral session token               │
│  /api/responses ────► Proxy to OpenAI Responses API                │
│                       (web search, code interpreter, moderation)    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Agent Tool Call Flow (Detailed)

```
┌────────────────────────────────────────────────────────────────────┐
│  User speaks: "Add a morning routine tab"                         │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  1. Audio Capture                                                  │
│     - Browser: navigator.mediaDevices.getUserMedia()               │
│     - WebRTC: sends audio packets to OpenAI                        │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  2. OpenAI Realtime API Processing                                 │
│     - Whisper transcribes: "Add a morning routine tab"             │
│     - Event: conversation.item.input_audio_transcription.completed │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  3. Client Event Handler (useHandleSessionHistory)                 │
│     - Catches transcription event                                  │
│     - addTranscriptMessage(itemId, "user", "Add a morning...")     │
│     - Transcript updates with user message                         │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  4. GPT-4o Agent Decision (energyCoach)                            │
│     - Reads instructions + conversation history                    │
│     - Decides to call: add_workspace_tab                           │
│     - Generates function call arguments:                           │
│       {                                                            │
│         "name": "Morning Routine",                                 │
│         "type": "markdown",                                        │
│         "content": "# My Morning Routine\n\n..."                   │
│       }                                                            │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  5. SDK Emits agent_tool_start Event                               │
│     - useHandleSessionHistory.handleAgentToolStart()               │
│     - addTranscriptBreadcrumb("function call: add_workspace_tab")  │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  6. Tool Execution (Browser-side)                                  │
│                                                                    │
│     tool.execute() → addWorkspaceTab(args)                        │
│       │                                                            │
│       ├─► const ws = useWorkspaceContext.getState()               │
│       │   // Imperative access to React context!                  │
│       │                                                            │
│       ├─► const newTab = {                                        │
│       │     id: nanoid(),                                         │
│       │     name: "Morning Routine",                              │
│       │     type: "markdown",                                     │
│       │     content: "# My Morning Routine\n\n..."                │
│       │   }                                                        │
│       │                                                            │
│       └─► ws.setTabs([...ws.tabs, newTab])                        │
│           // ★ React state update triggers re-render! ★           │
│                                                                    │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  7. React Re-renders (Immediate UI Update)                         │
│                                                                    │
│     WorkspaceContext.tabs updated                                  │
│       │                                                            │
│       ├─► Workspace.tsx re-renders                                │
│       │     │                                                      │
│       │     ├─► Sidebar.tsx re-renders                            │
│       │     │     - Shows "Morning Routine" tab in list           │
│       │     │     - Tab is selected (cyan glow)                   │
│       │     │                                                      │
│       │     └─► TabContent.tsx re-renders                         │
│       │           - Displays markdown: "# My Morning Routine..."  │
│       │                                                            │
│       └─► localStorage.setItem('workspaceState', ...)             │
│             // Auto-persisted!                                     │
│                                                                    │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  8. Tool Result Returned to Agent                                  │
│     - Return value: { message: "Tab 'Morning Routine' added." }   │
│     - SDK emits agent_tool_end event                               │
│     - addTranscriptBreadcrumb("function call result: ...")         │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  9. Agent Generates Voice Response                                 │
│     - GPT-4o: "I've created a Morning Routine tab for you."       │
│     - OpenAI TTS generates audio                                   │
│     - Event: response.audio_transcript.delta (streaming)           │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  10. Audio Playback + Transcript Update                            │
│      - WebRTC stream → <audio> element                             │
│      - User hears: "I've created a Morning Routine tab..."         │
│      - addTranscriptMessage(itemId, "assistant", text)             │
│      - Transcript shows agent response                             │
└────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  ✅ COMPLETE                                                       │
│  - User sees new tab in UI                                         │
│  - User hears agent confirmation                                   │
│  - Transcript shows full conversation + tool calls                 │
│  - Workspace state persisted to localStorage                       │
└────────────────────────────────────────────────────────────────────┘
```

### Workspace State Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                   WorkspaceContext (React)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  State:                                                          │
│    name: string                                                  │
│    description: string                                           │
│    tabs: WorkspaceTab[]                                          │
│    selectedTabId: string                                         │
│                                                                  │
│  Persisted in localStorage:                                      │
│    useEffect(() => {                                             │
│      const saved = localStorage.getItem('workspaceState');       │
│      if (saved) {                                                │
│        const { name, tabs, ... } = JSON.parse(saved);            │
│        setName(name);                                            │
│        setTabs(tabs);                                            │
│      }                                                            │
│    }, []);                                                       │
│                                                                  │
│    useEffect(() => {                                             │
│      localStorage.setItem('workspaceState',                      │
│        JSON.stringify({ name, tabs, ... })                       │
│      );                                                          │
│    }, [name, tabs, ...]);                                        │
│                                                                  │
│  Imperative Access:                                              │
│    WorkspaceProviderState.current = value; // Updated each render│
│    useWorkspaceContext.getState() → returns current state        │
│                                                                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐
│  React Components   │    │   Agent Tools       │
│  (declarative)      │    │   (imperative)      │
├─────────────────────┤    ├─────────────────────┤
│                     │    │                     │
│  Workspace.tsx      │    │  addWorkspaceTab()  │
│    ├── Sidebar      │    │  setTabContent()    │
│    └── TabContent   │    │  renameTab()        │
│                     │    │  deleteTab()        │
│  Uses:              │    │  getWorkspaceInfo() │
│    const tabs =     │    │                     │
│      useWorkspace(  │    │  Uses:              │
│        s => s.tabs  │    │    const ws =       │
│      );             │    │      useWorkspace   │
│                     │    │        .getState(); │
│                     │    │    ws.setTabs(...); │
│                     │    │                     │
└─────────────────────┘    └─────────────────────┘
```

### Supervisor Pattern (makeWorkspaceChanges)

```
┌───────────────────────────────────────────────────────────────────┐
│  Task Strategist Agent: "I'll add research to your workspace"    │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────────────────┐
│  Calls makeWorkspaceChanges tool                                  │
│    {                                                              │
│      tabsToChange: "Research Notes",                             │
│      workspaceChangesToMake: "Add web search results about..."   │
│    }                                                              │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────────────────┐
│  makeWorkspaceChanges.execute()                                   │
│    1. Get conversation history from details.context.history       │
│    2. Get current workspace: await getWorkspaceInfo()             │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────────────────┐
│  Build Supervisor Request                                         │
│    POST /api/responses                                            │
│    {                                                              │
│      model: "gpt-4.1",                                           │
│      input: [                                                     │
│        {                                                          │
│          role: "system",                                          │
│          content: "You are a workspace builder. Use tools..."    │
│        },                                                         │
│        {                                                          │
│          role: "user",                                            │
│          content: `                                               │
│            Conversation History: ${history}                       │
│            Current Workspace: ${workspace}                        │
│            Requested Changes: ${workspaceChangesToMake}           │
│          `                                                        │
│        }                                                          │
│      ],                                                           │
│      tools: [                                                     │
│        { name: "add_workspace_tab", ... },                        │
│        { name: "set_tab_content", ... },                          │
│        ...                                                        │
│      ]                                                            │
│    }                                                              │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────────────────┐
│  OpenAI Responses API (GPT-4.1 Supervisor)                        │
│    - Reads conversation history                                   │
│    - Sees current workspace state                                 │
│    - Decides which tools to call                                  │
│    - Returns:                                                     │
│      {                                                            │
│        output: [                                                  │
│          {                                                        │
│            type: "function_call",                                 │
│            name: "set_tab_content",                               │
│            arguments: {                                           │
│              name: "Research Notes",                              │
│              content: "# Research\n\n[search results]..."         │
│            }                                                      │
│          }                                                        │
│        ]                                                          │
│      }                                                            │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────────────────┐
│  handleToolCalls() - Iterative Loop                               │
│    while (has function calls) {                                   │
│      for each function call:                                      │
│        1. Execute tool locally: setTabContent(args)               │
│        2. Add function call + result to request body              │
│      3. Make follow-up request to Responses API                   │
│    }                                                              │
│    return final assistant message                                │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────────────────┐
│  Tool Execution (same as direct tools)                            │
│    setTabContent() → useWorkspaceContext.getState()               │
│                   → ws.setTabs(...)                               │
│                   → React re-renders                              │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────────────────┐
│  Return to Task Strategist                                        │
│    {                                                              │
│      workspaceManagerResponse:                                    │
│        "I've updated the Research Notes tab with the findings."  │
│    }                                                              │
└───────────────────────────────────────────────────────────────────┘
```

### WebRTC Event Flow

```
┌──────────────── OpenAI Realtime API (Server) ────────────────┐
│                                                               │
│  Events emitted:                                              │
│    - session.created                                          │
│    - conversation.item.created                                │
│    - response.audio_transcript.delta                          │
│    - response.audio_transcript.done                           │
│    - conversation.item.input_audio_transcription.completed    │
│    - error                                                    │
│    - ...and many more                                         │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ WebRTC Data Channel
                            │
┌───────────────────────────▼───────────────────────────────────┐
│              OpenAIRealtimeWebRTC (Transport)                 │
│                                                               │
│  - Manages RTCPeerConnection                                  │
│  - Sends/receives WebRTC events                               │
│  - Handles audio streams                                      │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ SDK Events
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                  RealtimeSession (SDK)                        │
│                                                               │
│  Event handlers registered:                                   │
│    - session.on("error", ...)                                 │
│    - session.on("agent_handoff", ...)                         │
│    - session.on("agent_tool_start", ...)                      │
│    - session.on("agent_tool_end", ...)                        │
│    - session.on("history_updated", ...)                       │
│    - session.on("history_added", ...)                         │
│    - session.on("guardrail_tripped", ...)                     │
│    - session.on("transport_event", ...)                       │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ Calls registered handlers
                            │
┌───────────────────────────▼───────────────────────────────────┐
│           useHandleSessionHistory (Custom Hook)               │
│                                                               │
│  Handlers:                                                    │
│    handleTranscriptionCompleted → updateTranscriptMessage()   │
│    handleTranscriptionDelta → updateTranscriptMessage()       │
│    handleAgentToolStart → addTranscriptBreadcrumb()           │
│    handleAgentToolEnd → addTranscriptBreadcrumb()             │
│    handleHistoryAdded → addTranscriptMessage()                │
│    handleHistoryUpdated → updateTranscriptMessage()           │
│    handleGuardrailTripped → updateTranscriptItem()            │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ Updates context
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                 TranscriptContext (State)                     │
│                                                               │
│  transcriptItems updated                                      │
│    → Triggers re-render of Transcript.tsx                     │
│    → User sees updated messages/breadcrumbs                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Key Insights & Design Patterns

### 1. **Imperative Bridge to React State**
The most crucial pattern in your app is how agent tools (async functions) can mutate React state:

```typescript
// In WorkspaceContext:
const WorkspaceProviderState = { current: null as WorkspaceState };

export const WorkspaceProvider = ({ children }) => {
  const [tabs, setTabs] = useState([]);
  const value = { tabs, setTabs, /* ... */ };
  
  // ★ Key: Update ref on every render
  WorkspaceProviderState.current = value;
  
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

// Expose imperative getter
useWorkspaceContext.getState = () => WorkspaceProviderState.current;

// Agent tools can now do:
const ws = useWorkspaceContext.getState();
ws.setTabs([...ws.tabs, newTab]); // ← Mutates React state from outside React!
```

### 2. **Supervisor Pattern for Complex Tools**
Instead of giving every agent direct workspace tools, you use a "supervisor" pattern:

```
Agent wants to modify workspace
  → Calls makeWorkspaceChanges({ description: "..." })
    → Sends conversation history + workspace state to GPT-4.1
      → GPT-4.1 has access to all workspace tools
        → GPT-4.1 decides which tools to call and how
          → Tools execute locally in browser
            → Results fed back to GPT-4.1
              → Iterates until complete
                → Returns final message to agent
```

This centralizes workspace logic and prevents agents from making conflicting changes.

### 3. **Event-Driven Architecture**
Everything flows through events:
- WebRTC events from server
- SDK events (agent_tool_start, guardrail_tripped, etc.)
- React state updates trigger re-renders
- LocalStorage persistence on every state change

### 4. **Dual Rendering System**
Workspace tabs support two content types:
- **Markdown**: Rendered with `react-markdown` for rich formatting
- **CSV**: Parsed as pipe-delimited (`|`) and rendered as HTML table

### 5. **Separation of Concerns**
- **Context**: State management (what data exists)
- **Hooks**: Business logic (how to interact with external systems)
- **Components**: Presentation (how to display data)
- **Agents**: AI behavior (what actions to take)
- **Tools**: Side effects (how to modify the world)

---

## File Structure Summary

```
/src/app/
├── page.tsx                          # Entry point (context providers)
├── App.tsx                           # Main app (connection, layout)
├── layout.tsx                        # Next.js root layout
├── types.ts                          # TypeScript type definitions
├── globals.css                       # Global styles (Tailwind + custom)
│
├── contexts/                         # State management
│   ├── TranscriptContext.tsx         # Conversation history
│   ├── EventContext.tsx              # Debug event logs
│   └── WorkspaceContext.tsx          # Workspace tabs/content
│
├── hooks/                            # Custom React hooks
│   ├── useRealtimeSession.ts         # WebRTC connection management
│   ├── useHandleSessionHistory.ts    # Event processing
│   └── useAudioDownload.ts           # Audio recording
│
├── components/                       # UI components
│   ├── Transcript.tsx                # Message list + input
│   ├── Events.tsx                    # Debug panel
│   ├── BottomToolbar.tsx             # Controls (connect, PTT, etc.)
│   ├── GuardrailChip.tsx             # Moderation warnings
│   ├── CornerBrackets.tsx            # UI frame decoration
│   ├── Workspace.tsx                 # Workspace container
│   └── workspace/
│       ├── Sidebar.tsx               # Tab list
│       └── TabContent.tsx            # Content viewer/editor
│
├── agentConfigs/                     # Agent definitions
│   ├── index.ts                      # Scenario registry
│   ├── types.ts                      # Agent type definitions
│   ├── guardrails/                   # Safety system
│   │   ├── moderation.ts             # Content moderation
│   │   └── index.ts                  # Exports
│   └── scenarios/
│       └── workspaceBuilder/
│           ├── index.ts              # Scenario definition (3 agents)
│           ├── workspaceManager.ts   # Energy Coach (main agent)
│           ├── designer.ts           # Task Strategist (web search)
│           ├── estimator.ts          # Body Doubling (calculations)
│           ├── prompts.ts            # System prompts for agents
│           ├── utils.ts              # Shared utilities
│           └── guardrails.ts         # Scenario-specific guardrails
│
├── lib/                              # Utility libraries
│   ├── audioUtils.ts                 # WAV conversion
│   ├── codecUtils.ts                 # Audio codec handling
│   └── envSetup.ts                   # Environment configuration
│
└── api/                              # Backend API routes
    ├── session/route.ts              # Create ephemeral tokens
    └── responses/route.ts            # Proxy to OpenAI Responses API
```

---

## Summary: How Everything Connects

1. **User loads app** → `page.tsx` wraps in 3 contexts → renders `App.tsx`

2. **User clicks "Connect"** → `App.tsx` calls `useRealtimeSession.connect()` → establishes WebRTC connection to OpenAI

3. **User speaks** → audio sent to OpenAI → transcribed → shown in Transcript

4. **Agent processes** → GPT-4o decides to use tool → calls `add_workspace_tab`

5. **Tool executes** → `useWorkspaceContext.getState()` → mutates React state → UI updates instantly

6. **Agent speaks response** → TTS audio plays → transcript updates

7. **User closes app** → workspace state saved to localStorage → persists for next session

8. **Next time** → workspace loads from localStorage → user continues where they left off

The magic is in the **seamless integration** between:
- Voice AI (OpenAI Realtime API)
- Realtime tools (agent can modify UI while speaking)
- Persistent state (survives page reloads)
- Multi-agent orchestration (handoffs between specialized agents)

---

## End of Deep Dive

This document covers every major system in your application. You now understand:
- ✅ How the workspace system works
- ✅ How agents read from and write to the workspace
- ✅ How React state is mutated from outside React components
- ✅ How the realtime audio/WebRTC system operates
- ✅ How events flow through the system
- ✅ How agent handoffs work
- ✅ How guardrails protect against bad outputs
- ✅ How the supervisor pattern enables complex tool orchestration

The architecture is sophisticated but follows clear patterns. The key innovation is the **imperative bridge** (`useWorkspaceContext.getState()`) that allows async agent tools to trigger React re-renders.
