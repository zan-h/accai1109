# Agent-Project Context Synchronization - Implementation Guide

## Problem Statement

**Current Behavior:**
When a user switches projects using Cmd+P, the workspace tabs update correctly in the UI and localStorage, but the realtime voice agent continues to reference the previous project's context in its responses.

**Why This Happens:**
1. Agent establishes WebRTC connection with OpenAI Realtime API
2. Agent's conversation history (messages) are stored server-side in the session
3. When workspace tabs change, `getWorkspaceInfo()` would return new data if called
4. **BUT** the agent's LLM context still contains references to old tabs from previous messages
5. The agent prioritizes its conversation history over fresh tool calls

**Example Flow:**
```
1. User in "Project A" with tabs: [Research Notes, Budget]
2. User connects agent → agent learns about these tabs
3. User asks: "What tabs do I have?" → Agent: "Research Notes and Budget"
4. User switches to "Project B" with tabs: [Meeting Minutes]
5. User asks: "What tabs do I have?" 
   → Agent SHOULD say: "Meeting Minutes"
   → Agent ACTUALLY says: "You still have Research Notes and Budget"
```

---

## Architecture Deep Dive

### 1. Current Agent System Architecture

**File: `src/app/hooks/useRealtimeSession.ts`**
- Creates `RealtimeSession` with OpenAI SDK
- Manages WebRTC connection lifecycle
- Handles agent handoffs, guardrails, events
- Does NOT expose a "refresh session" or "clear context" method

**File: `src/app/App.tsx`**
- Initiates connection via `connectToRealtime()`
- Calls `connect()` with:
  - `initialAgents`: Array of agent configurations
  - `audioElement`: For audio playback
  - `outputGuardrails`: Moderation filters
  - `extraContext`: Additional context data

**File: `src/app/contexts/WorkspaceContext.tsx`**
- Manages workspace tabs in React state
- Syncs with ProjectContext
- Exposes `useWorkspaceContext.getState()` for imperative access
- Agent tools call this to get current workspace

**File: `src/app/contexts/ProjectContext.tsx`**
- Manages multiple projects
- Each project has its own tabs array
- Switching projects updates `currentProjectId`
- WorkspaceContext reacts to this change and loads new tabs

### 2. Agent Tool System

**File: `src/app/contexts/WorkspaceContext.tsx` (lines 194-280)**

Agent tools that access workspace:
```typescript
export async function getWorkspaceInfo() {
  const ws = useWorkspaceContext.getState();
  return { workspace: ws };
}

export async function setTabContent(input: any) {
  const ws = useWorkspaceContext.getState();
  // ... modifies tabs
}
```

**Key Insight:** These tools DO read the current state correctly. The problem is the agent doesn't call them when switching projects - it relies on cached knowledge from earlier in the conversation.

### 3. OpenAI Realtime API Session Model

**How Sessions Work:**
- Session established via WebRTC (ephemeral key)
- Conversation history stored server-side
- Agent has memory of all prior messages
- No built-in "reset" or "refresh context" command
- Only way to clear: disconnect and reconnect

**Session State:**
```
Session {
  conversation: [
    { role: "user", content: "What tabs do I have?" },
    { role: "assistant", content: "You have Research Notes and Budget" },
    { role: "user", content: "What tabs do I have?" }, // After project switch
    // Agent sees previous answer in history, assumes nothing changed
  ]
}
```

---

## Solution Options Analysis

### Option 1: Auto-Disconnect on Project Switch ⭐ RECOMMENDED

**Implementation:**
- When `currentProjectId` changes, disconnect agent
- Show breadcrumb: "Switched to [Project]. Connect to start new conversation."
- User manually reconnects when ready

**Pros:**
- ✅ 100% reliable - fresh session = fresh context
- ✅ Clear user mental model: "new project = new conversation"
- ✅ No context leakage between projects
- ✅ Simple to implement (already done in current uncommitted changes)
- ✅ User controls when to start conversation

**Cons:**
- ❌ Interrupts ongoing conversation (if user switches mid-chat)
- ❌ Requires manual reconnect
- ❌ Loses conversation history from previous project

**Best For:**
- Users who treat projects as separate work contexts
- Scenarios where mixing contexts would be dangerous
- When projects have different data that shouldn't mix

**Code Location:** Already implemented in `App.tsx` (uncommitted)

---

### Option 2: Send "Context Update" Message

**Implementation:**
- When project switches, send system message to agent:
  ```
  "SYSTEM: User switched to project '[name]'. 
   Previous workspace context is now invalid.
   Call get_workspace_info() to refresh."
  ```
- Trigger a `response.create` to force agent to respond

**Pros:**
- ✅ Doesn't disconnect (conversation continues)
- ✅ Agent gets explicit signal to refresh
- ✅ Could work if agent follows instructions

**Cons:**
- ❌ Not guaranteed - agent might ignore message
- ❌ Agent might reference old context anyway (it's in history)
- ❌ Complexity: need to format as proper conversation item
- ❌ Agent might get confused by system interruptions
- ❌ No way to "force" a tool call in Realtime API

**Risk Level:** Medium-High (unreliable)

---

### Option 3: Inject Tool Call Response

**Implementation:**
- When project switches, inject a fake tool response:
  ```json
  {
    type: "conversation.item.create",
    item: {
      type: "function_call_output",
      call_id: "fake_id",
      output: JSON.stringify({ workspace: newWorkspace })
    }
  }
  ```
- Hope agent processes it

**Pros:**
- ✅ Directly updates agent's knowledge
- ✅ No disconnect required

**Cons:**
- ❌ Violates API contract (no matching function call)
- ❌ Might cause errors or unexpected behavior
- ❌ Agent might ignore unsolicited function output
- ❌ Brittle - could break with API updates
- ❌ NOT RECOMMENDED by OpenAI

**Risk Level:** High (hacky, unreliable)

---

### Option 4: Auto-Disconnect + Auto-Reconnect

**Implementation:**
- When project switches:
  1. Disconnect agent
  2. Show loading state
  3. Auto-reconnect after 1 second
  4. Send initial greeting trigger

**Pros:**
- ✅ Fresh context (reliable)
- ✅ No user action required
- ✅ Seamless transition

**Cons:**
- ❌ Jarring UX - audio cuts out mid-sentence
- ❌ User loses control
- ❌ May disconnect accidentally during important conversation
- ❌ Wastes API credits (new session = new charges)

**Risk Level:** Medium (works but poor UX)

---

### Option 5: Manual "Refresh Context" Button

**Implementation:**
- Add button: "Refresh Agent Context"
- User clicks when they want agent to know about project switch
- Button sends message: "What workspace am I in?" to trigger tool call

**Pros:**
- ✅ User control
- ✅ Doesn't force disconnect
- ✅ Can be used anytime

**Cons:**
- ❌ Extra user action required
- ❌ Easy to forget
- ❌ Still relies on agent following instructions
- ❌ Clutters UI

**Risk Level:** Low (works as fallback, but not primary solution)

---

## Recommended Implementation: Option 1 Enhanced

### Why Auto-Disconnect is Best

1. **Reliability:** 100% guaranteed fresh context
2. **Security:** No risk of cross-project context leakage
3. **Simplicity:** Already implemented, just needs testing
4. **User Model:** Matches user's mental model ("new project = new session")

### Enhanced Version with UX Improvements

**Add these features:**

1. **Visual Indicators:**
   - Show project name in connect button: "Connect to [Project Name]"
   - Badge on bottom toolbar showing current project
   - Different color scheme per project (optional)

2. **Graceful Disconnect:**
   - If agent is speaking when project switches, let it finish sentence
   - Then disconnect
   - Show: "Agent paused. Switch back to [Old Project] to continue that conversation."

3. **Conversation History:**
   - Store transcript per-project in localStorage
   - When switching back to a project, show old transcript
   - Option to "Resume Previous Conversation" (reconnects with context message)

4. **Quick Reconnect:**
   - After switching, show prominent "Connect to [New Project]" button
   - Keyboard shortcut: Cmd+Shift+C to connect
   - Auto-focus on connect button

---

## Step-by-Step Implementation Guide

### Step 1: Verify Current Auto-Disconnect (Already Done)

**File: `src/app/App.tsx`**

Current implementation:
```typescript
// Track which project we connected with
const connectedProjectIdRef = useRef<string | null>(null);

// On connect:
connectedProjectIdRef.current = currentProjectId;
addTranscriptBreadcrumb(`🗂️ Connected to project: ${currentProject.name}`);

// Auto-disconnect effect:
useEffect(() => {
  if (sessionStatus === "DISCONNECTED") return;
  
  if (connectedProjectIdRef.current && 
      connectedProjectIdRef.current !== currentProjectId) {
    disconnectFromRealtime();
    addTranscriptBreadcrumb(
      `🔄 Switched to project: ${currentProject.name}. Connect to start a new conversation.`
    );
  }
}, [currentProjectId, sessionStatus]);
```

**✅ This is correct and should work.**

---

### Step 2: Test the Implementation

**Test Case 1: Basic Switch**
1. Create Project A with tabs: Tab 1, Tab 2
2. Connect to agent
3. Ask: "What tabs do I have?"
4. Verify: Agent says Tab 1, Tab 2
5. Create Project B, switch to it (Cmd+P)
6. Verify: Agent disconnects, breadcrumb appears
7. Reconnect
8. Ask: "What tabs do I have?"
9. Expected: Agent says Tab 3 (or whatever tabs Project B has)
10. **CRITICAL:** Agent should NOT mention Tab 1 or Tab 2

**Test Case 2: Switch Mid-Conversation**
1. Connect to Project A
2. Start complex conversation (multiple turns)
3. Switch to Project B mid-sentence (while agent is speaking)
4. Verify: Agent disconnects, audio stops
5. Verify: Breadcrumb shows
6. Switch back to Project A
7. Verify: Old transcript visible but agent is disconnected
8. Reconnect
9. Expected: Agent starts fresh (no memory of old conversation)

**Test Case 3: Rapid Switching**
1. Switch between 3 projects rapidly
2. Verify: No crashes, no stuck states
3. Connect to final project
4. Verify: Agent has correct context

---

### Step 3: Add UX Enhancements (Optional)

**Enhancement 1: Project Name in Connect Button**

**File: `src/app/components/BottomToolbar.tsx`**

Add `currentProjectName` prop:
```typescript
interface BottomToolbarProps {
  // ... existing props
  currentProjectName?: string;
}

function getConnectionButtonLabel() {
  if (isConnected) return "Disconnect";
  if (isConnecting) return "Connecting...";
  return currentProjectName 
    ? `Connect to ${currentProjectName}`
    : "Connect";
}
```

**File: `src/app/App.tsx`**

Pass project name:
```typescript
<BottomToolbar
  currentProjectName={getCurrentProject()?.name}
  // ... other props
/>
```

---

**Enhancement 2: Per-Project Transcript History**

**File: `src/app/contexts/TranscriptContext.tsx`**

Modify to store transcripts per project:
```typescript
interface TranscriptState {
  transcriptsByProject: Record<string, TranscriptItem[]>;
  currentProjectId: string | null;
}

// Load transcript when project changes
useEffect(() => {
  if (currentProjectId) {
    setCurrentTranscript(
      transcriptsByProject[currentProjectId] || []
    );
  }
}, [currentProjectId]);

// Save transcript when it changes
useEffect(() => {
  if (currentProjectId) {
    setTranscriptsByProject(prev => ({
      ...prev,
      [currentProjectId]: currentTranscript
    }));
  }
}, [currentTranscript, currentProjectId]);
```

This way each project maintains its own conversation history.

---

**Enhancement 3: Warning Before Disconnect**

**File: `src/app/App.tsx`**

Add check if agent is currently speaking:
```typescript
useEffect(() => {
  if (sessionStatus === "DISCONNECTED") return;
  
  if (connectedProjectIdRef.current && 
      connectedProjectIdRef.current !== currentProjectId) {
    
    // Check if agent is currently speaking
    const isAgentSpeaking = sessionStatus === "CONNECTED" && 
                           /* check if audio is playing */;
    
    if (isAgentSpeaking) {
      // Wait for agent to finish, then disconnect
      setTimeout(() => {
        disconnectFromRealtime();
        showBreadcrumb();
      }, 2000);
    } else {
      disconnectFromRealtime();
      showBreadcrumb();
    }
  }
}, [currentProjectId, sessionStatus]);
```

---

### Step 4: Edge Cases to Handle

**Edge Case 1: Project Deleted While Connected**
- Current project is deleted
- `currentProjectId` becomes null or invalid
- **Solution:** Disconnect agent, show error breadcrumb

**Edge Case 2: First Project Creation**
- User creates first project while connected
- `currentProjectId` goes from null to valid ID
- **Solution:** Don't trigger disconnect (null → ID is not a switch)

**Edge Case 3: Network Disconnect During Switch**
- User switches project
- Network disconnects agent naturally
- Auto-disconnect fires
- **Solution:** Check if already disconnected before calling disconnect()

**Edge Case 4: Multiple Tabs Open**
- User has app open in 2 browser tabs
- Switches project in one tab
- Other tab's localStorage updates
- **Solution:** Add `storage` event listener to sync state across tabs

---

## Testing Checklist

### Functional Tests

- [ ] Connect to Project A, verify breadcrumb shows project name
- [ ] Ask agent about workspace, verify correct tabs
- [ ] Switch to Project B (Cmd+P)
- [ ] Verify auto-disconnect happens
- [ ] Verify breadcrumb shows "Switched to Project B"
- [ ] Verify connect button is enabled
- [ ] Reconnect
- [ ] Verify new breadcrumb shows "Connected to Project B"
- [ ] Ask agent about workspace, verify Project B tabs (NOT Project A)
- [ ] Create new tab in Project B
- [ ] Verify agent sees new tab after asking
- [ ] Switch back to Project A
- [ ] Verify auto-disconnect happens
- [ ] Reconnect
- [ ] Verify agent sees Project A tabs again

### Edge Case Tests

- [ ] Disconnect manually, switch project → no double-disconnect
- [ ] Switch project while agent is speaking → clean disconnect
- [ ] Rapidly switch 5 projects → no crashes
- [ ] Delete current project while connected → graceful handling
- [ ] Switch project, close modal without selecting → no disconnect
- [ ] Switch to same project → no disconnect

### Performance Tests

- [ ] Switch between 10 projects → should be instant
- [ ] Connect/disconnect 20 times → no memory leaks
- [ ] Switch while voice streaming → audio stops cleanly

---

## Code Files to Modify

### ✅ Already Modified (Uncommitted)
1. `src/app/App.tsx` - Auto-disconnect logic
2. `src/app/contexts/WorkspaceContext.tsx` - Performance optimizations

### 🔄 Optional Enhancements
3. `src/app/components/BottomToolbar.tsx` - Project name in button
4. `src/app/contexts/TranscriptContext.tsx` - Per-project transcript history
5. `src/app/components/ProjectSwitcher.tsx` - Warning if agent connected

---

## Alternative: If Auto-Disconnect Doesn't Work

If testing reveals issues with auto-disconnect approach:

### Fallback Plan: Hybrid Approach

1. **Keep auto-disconnect as primary**
2. **Add manual "Refresh Agent" button as backup**
3. **Show warning in UI:** "Agent may not see project changes until reconnected"
4. **Add keyboard shortcut:** Cmd+Shift+R to reconnect

**Button UI:**
```tsx
{sessionStatus === "CONNECTED" && connectedProjectIdRef.current !== currentProjectId && (
  <button className="bg-yellow-500 text-black px-3 py-1 rounded">
    ⚠️ Agent context out of sync - Click to reconnect
  </button>
)}
```

---

## Success Criteria

Implementation is successful when:

1. ✅ Agent NEVER references tabs from previous project after switching
2. ✅ User understands what happened (clear breadcrumbs)
3. ✅ No confusion about which project agent is working with
4. ✅ No unexpected disconnects (only on project switch)
5. ✅ Performance is good (no lag when switching)
6. ✅ Works reliably across all test cases
7. ✅ No console errors or warnings

---

## Current Status

**What's Already Done:**
- ✅ Auto-disconnect on project switch implemented
- ✅ Breadcrumb notifications added
- ✅ Project ID tracking with ref
- ✅ Integration with WorkspaceContext
- ✅ Performance optimizations (debouncing, grace periods)

**What Needs Testing:**
- Agent actually sees correct context after reconnect
- No edge cases cause crashes
- UX feels natural and clear

**What's Optional:**
- Project name in connect button
- Per-project transcript history
- Enhanced visual indicators

---

## Questions for Next Session

1. **Does auto-disconnect work reliably?**
   - Test extensively across different scenarios
   - If not, investigate why

2. **Is the UX clear enough?**
   - Do breadcrumbs provide sufficient feedback?
   - Should we add more visual indicators?

3. **Should we add per-project transcript history?**
   - Would it be valuable to see old conversations?
   - Or is fresh start better?

4. **Any edge cases we missed?**
   - Test with real usage patterns
   - Get user feedback

---

## For Next Model: Quick Start

If you're implementing this fresh:

1. **Read this entire document first**
2. **Check current git status:** `git status`
3. **Review uncommitted changes in:** `App.tsx`, `WorkspaceContext.tsx`
4. **Test the auto-disconnect feature:**
   - Run: `npm run dev`
   - Create 2 projects
   - Connect agent in Project A
   - Switch to Project B
   - Verify disconnect happens
   - Reconnect
   - Ask agent about workspace
   - **CRITICAL CHECK:** Does agent mention Project A tabs? (Should be NO)
5. **If working:** Commit and push
6. **If not working:** Debug using this guide

---

## Summary

**Problem:** Agent's conversation history contains stale project context after switching.

**Root Cause:** OpenAI Realtime API stores conversation server-side, no way to "refresh" without reconnecting.

**Solution:** Auto-disconnect when project switches, user reconnects for fresh context.

**Why This Works:** New session = new conversation = no stale context.

**Current Status:** Implemented but not tested/committed.

**Next Steps:** Test thoroughly, commit if working, enhance UX if needed.

