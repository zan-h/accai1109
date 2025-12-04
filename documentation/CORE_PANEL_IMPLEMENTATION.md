# Core Panel Implementation - Complete Guide

**Status:** ✅ **PHASE 1 & 2 COMPLETE** (2025-10-10)  
**Next:** Testing & Optional Enhancements

---

## What Was Built

### Phase 1: Core Panel UI (✅ Complete)

A collapsible left-side panel renamed from "Focus Panel" to **"Core"** per user preference.

**Key Features:**
- **40px collapsed** (w-10) → **300px expanded** (w-80)
- **Cmd+B** keyboard toggle
- **4 Templates**: Goals 🎯, Values 💡, Best Times ⏰, Custom Notes 📝
- **Global sections**: Appear in ALL projects
- **Project-specific sections**: Only in assigned projects
- **Inline editing** with Save/Cancel
- **Delete with confirmation**
- **localStorage persistence** (`coreState` key)
- **Smooth 300ms transitions**
- **Spy/command-center aesthetic** maintained

**Files Created:**
```
src/app/contexts/CoreContext.tsx (260 lines)
src/app/components/CorePanel.tsx (97 lines)
src/app/components/CoreSection.tsx (111 lines)
src/app/components/AddCoreModal.tsx (72 lines)
```

**Files Modified:**
```
src/app/contexts/ProjectContext.tsx - Added activeCoreSectionIds, .getState()
src/app/page.tsx - Added CoreProvider to context hierarchy
src/app/App.tsx - Added Cmd+B keyboard shortcut
src/app/components/Workspace.tsx - Integrated CorePanel with responsive margins
```

---

### Phase 2: Agent Integration with Core (✅ Complete)

**Architecture Insight:** Separate "WHO the user is" (Core) from "WHAT they're doing" (Workspace)

**Problem Identified:**
- Original design mixed Core + Workspace in `getWorkspaceInfo()`
- Caused cognitive load - agent didn't know when to reference core vs workspace
- User insight: "Core is grounding context, workspace is work area"

**Solution Implemented: Option A - Separate Tools**

Created `get_core_info()` tool separate from `get_workspace_info()`:

```typescript
// BEFORE: Everything mixed together
get_workspace_info() → { workspace, core, project }

// NOW: Clean separation
get_core_info() → { project, core: { sections } }  // WHO the user is
get_workspace_info() → { workspace, project }      // WHAT they're doing
```

**Files Created/Modified:**
```
src/app/contexts/CoreContext.tsx - Added getCoreInfo() function
src/app/contexts/WorkspaceContext.tsx - Removed core from getWorkspaceInfo()
src/app/agentConfigs/scenarios/workspaceBuilder/workspaceManager.ts - Added coreInfoTool
src/app/agentConfigs/scenarios/workspaceBuilder/prompts.ts - Updated agent instructions
```

**Agent Prompt Update:**
- Added clear instructions to call `get_core_info()` FIRST when connecting
- Explained Core = grounding (goals, values, best times)
- Explained Workspace = current work (tabs, content)

---

## Data Structures

### CoreSection Interface

```typescript
interface CoreSection {
  id: string;                    // nanoid()
  title: string;                 // "Goals", "Values", custom
  icon: string;                  // Emoji: 🎯, 💡, ⏰, 📝
  content: string;               // Markdown text
  isGlobal: boolean;             // true = all projects, false = project-specific
  order: number;                 // For future drag-and-drop
  createdAt: number;             // Date.now()
  modifiedAt: number;            // Date.now()
}
```

### localStorage Structure

```json
{
  "coreState": {
    "sections": [
      {
        "id": "abc123",
        "title": "Goals",
        "icon": "🎯",
        "content": "# My Goals\n\n- get xyz done\n- ",
        "isGlobal": true,
        "order": 0,
        "createdAt": 1728567890000,
        "modifiedAt": 1728567890000
      }
    ],
    "isExpanded": false
  },
  "projectState": {
    "projects": [
      {
        "id": "proj1",
        "name": "Project A",
        "tabs": [...],
        "activeCoreSectionIds": ["abc123"]  // Which core sections are active
      }
    ]
  }
}
```

---

## Agent Tool API

### get_core_info()

**Purpose:** Get user's grounding context (WHO they are)

**Returns:**
```typescript
{
  project: {
    name: "Project A"
  },
  core: {
    sections: [
      {
        title: "Goals",
        icon: "🎯",
        content: "# My Goals\n\n- get xyz done",
        isGlobal: true
      }
    ]
  }
}
```

**When to Call:**
- FIRST when agent connects to project
- To understand user's goals, values, priorities
- To align assistance with what matters to them

### get_workspace_info()

**Purpose:** Get user's current work context (WHAT they're doing)

**Returns:**
```typescript
{
  workspace: {
    name: "Workspace",
    description: "",
    tabs: [...],
    selectedTabId: "tab123"
  },
  project: {
    name: "Project A"
  }
}
```

**When to Call:**
- To see what tabs exist
- To understand current work
- Before modifying workspace

---

## Testing Checklist

### Basic Functionality
- [ ] Press **Cmd+B** → Panel expands/collapses smoothly
- [ ] Click **+ Add Section** → Modal with 4 templates appears
- [ ] Create "Goals" section → Appears in panel
- [ ] Edit section content → Changes save to localStorage
- [ ] Delete section → Confirmation dialog appears
- [ ] Refresh page → All sections and panel state persist

### Global vs Project-Specific
- [ ] Check "Show in all projects" → Section appears in ALL projects
- [ ] Uncheck → Section only in current project
- [ ] Create new project → Global sections still appear
- [ ] Project-specific sections don't appear in new project
- [ ] Switch between projects → Correct sections show

### Agent Integration (CRITICAL)
- [ ] Connect agent → Watch Events panel
- [ ] Should see: `▶ function call: get_core_info`
- [ ] Agent greeting references core (e.g., "I see your goal is to get xyz done")
- [ ] Ask: "What are my goals?" → Agent calls `get_core_info()`
- [ ] Ask: "What tabs do I have?" → Agent calls `get_workspace_info()`
- [ ] Verify agent doesn't mix core + workspace contexts

### Edge Cases
- [ ] Create 10+ sections → Scrollbar works in panel
- [ ] Very long content → Textarea scrolls properly
- [ ] Delete last section → Empty state shows
- [ ] Panel expanded, switch projects → State persists
- [ ] Two browser tabs open → No localStorage conflicts

---

## Known Issues

### Dev Server Errors (Transient)
**Error:** `TypeError: Cannot read properties of undefined (reading 'call')`

**Cause:** Next.js hot-reload conflicts during development

**Fix:** 
```bash
cd 14-voice-agents/realtime-workspace-agents
rm -rf .next
npm run dev
```

**Status:** Build succeeds (`npm run build` ✅), errors only during hot-reload

---

## Next Steps (Optional Enhancements)

### Priority 1: Agent Tools to Modify Core

Add tools for agent to update core sections:

```typescript
// Tool 1: Update core section
update_core_section({
  sectionTitle: "Goals",
  content: "# My Goals\n\n- Launch product by Q1\n- Get 100 users"
})

// Tool 2: Add to core section
add_to_core_section({
  sectionTitle: "Goals",
  item: "Launch product by Q1"
})
```

**Implementation:**
1. Add to `workspaceManager.ts`
2. Import `updateSection` from CoreContext
3. Update agent prompts to teach usage

**Benefit:** Agent can help user refine goals/values through conversation

---

### Priority 2: Enhanced Agent Prompts

**Current:** Agent knows to call `get_core_info()` first

**Enhancement:** Add examples to prompt:

```markdown
## Example: Aligning with Core

User: "What should I focus on today?"

You:
1. Call get_core_info() to see their goals
2. Call get_workspace_info() to see their tabs
3. Response: "Based on your goal to launch the product by Q1, 
   I recommend working on the Research tab during your peak hours (9am-12pm)."
```

---

### Priority 3: Auto-Load Core on Connect

**Current:** Agent must explicitly call `get_core_info()`

**Enhancement:** Automatically inject core into conversation on connect

**Implementation:**
```typescript
// In App.tsx connectToRealtime()
if (sessionStatus === "CONNECTED") {
  const coreInfo = await getCoreInfo();
  const greeting = `Connected! Your core context: ${coreInfo.core.sections.map(s => s.title).join(', ')}`;
  addTranscriptBreadcrumb(greeting);
}
```

**Benefit:** Core context always available, no manual tool call needed

---

### Priority 4: Markdown Preview in Core Sections

**Current:** Raw markdown text displayed

**Enhancement:** Render markdown in read mode

**Implementation:**
- Use `react-markdown` library
- Toggle between edit (raw) and view (rendered) modes
- Add "Preview" button next to "Edit"

**Benefit:** Better readability, especially for formatted content

---

### Priority 5: Drag-and-Drop Reordering

**Current:** Sections ordered by creation time

**Enhancement:** Drag to reorder sections

**Implementation:**
- Use `@dnd-kit/core` library
- Update `order` field on drop
- Persist to localStorage

**Benefit:** User can prioritize what they see first

---

## Architecture Decisions

### Why Separate get_core_info() from get_workspace_info()?

**Decision:** Create two separate tools instead of one combined tool

**Rationale:**
1. **Clear mental model**: Core = grounding, Workspace = work
2. **No interference**: Core doesn't pollute workspace queries
3. **Better prompting**: Agent knows WHEN to check each
4. **Scalable**: Easy to add core-specific features later
5. **User insight**: "Core is so key when connected to a project"

**Alternative Considered:** Keep combined `getWorkspaceInfo()` with both

**Why Rejected:** Cognitive load - agent didn't know when to reference core vs workspace

---

## File Structure

```
14-voice-agents/realtime-workspace-agents/
├── src/app/
│   ├── contexts/
│   │   ├── CoreContext.tsx          ✅ NEW - Core state management
│   │   ├── ProjectContext.tsx       ✏️ MODIFIED - Added activeCoreSectionIds
│   │   └── WorkspaceContext.tsx     ✏️ MODIFIED - Removed core from getWorkspaceInfo()
│   ├── components/
│   │   ├── CorePanel.tsx            ✅ NEW - Main panel UI
│   │   ├── CoreSection.tsx          ✅ NEW - Individual section
│   │   ├── AddCoreModal.tsx         ✅ NEW - Template picker
│   │   └── Workspace.tsx            ✏️ MODIFIED - Integrated CorePanel
│   ├── agentConfigs/scenarios/workspaceBuilder/
│   │   ├── workspaceManager.ts      ✏️ MODIFIED - Added coreInfoTool
│   │   └── prompts.ts               ✏️ MODIFIED - Updated agent instructions
│   ├── App.tsx                      ✏️ MODIFIED - Added Cmd+B shortcut
│   └── page.tsx                     ✏️ MODIFIED - Added CoreProvider
```

---

## Success Metrics

### Must Have (✅ Complete)
- ✅ Panel collapses/expands with Cmd+B
- ✅ 4 templates available
- ✅ Global + project-specific sections work
- ✅ Inline editing functional
- ✅ Delete with confirmation
- ✅ localStorage persistence
- ✅ Agent can read core via `get_core_info()`
- ✅ Separate from workspace context
- ✅ Smooth animations
- ✅ Spy aesthetic maintained

### Should Have (⏳ Pending Testing)
- ⏳ Agent greeting references core
- ⏳ Core context influences agent suggestions
- ⏳ No mixing of core + workspace contexts
- ⏳ All edge cases handled

### Nice to Have (🔮 Future)
- 🔮 Agent can update core sections
- 🔮 Markdown preview in sections
- 🔮 Drag-and-drop reordering
- 🔮 Auto-load core on connect
- 🔮 Export core as .md file

---

## Troubleshooting

### Panel doesn't expand on Cmd+B
**Check:** 
1. App.tsx has `useCoreContext` import
2. Keyboard listener attached in useEffect
3. No conflicting keyboard shortcuts

### Sections don't persist across refresh
**Check:**
1. localStorage key is `coreState`
2. CoreContext useEffect saving/loading
3. Browser localStorage not disabled

### Agent doesn't see core sections
**Check:**
1. `coreInfoTool` added to `workspaceTools` array
2. `getCoreInfo()` exported from CoreContext
3. Agent prompt mentions `get_core_info()`
4. Watch Events panel for tool calls

### Global sections don't appear in all projects
**Check:**
1. `isGlobal` checkbox toggled on
2. Filter logic in `getSectionsForProject()`
3. ProjectContext has `activeCoreSectionIds` field

---

## User Feedback

> "Name it 'Core' instead" - User preferred simpler, more grounding name

> "Could the information from 'core' interfere with the 'workspace' area?" - Led to separate tool design

> "Call the corespace when we connect to a project at first" - Agent should read core FIRST

> "The core is so key when connected to a project" - Emphasized importance of grounding context

---

## Build Status

- **Production Build:** ✅ Successful (`npm run build`)
- **TypeScript:** ✅ No errors
- **Linter:** ✅ No errors
- **Dev Server:** ⚠️ Hot-reload errors (fix with `rm -rf .next`)

---

## Quick Start for Next Model

1. **Test the implementation:**
   ```bash
   cd 14-voice-agents/realtime-workspace-agents
   rm -rf .next && npm run dev
   ```

2. **Access:** http://localhost:3006?agentConfig=workspaceBuilder

3. **Test Core Panel:**
   - Press Cmd+B to expand
   - Create a Goals section
   - Add content, check "Show in all projects"

4. **Test Agent Integration:**
   - Connect agent
   - Watch Events panel for `get_core_info` call
   - Ask: "What are my goals?"
   - Verify agent responds with core content

5. **If tests pass:** Move to Priority 1 enhancements

6. **If tests fail:** Check Troubleshooting section above

---

## Lessons Learned

1. **User architectural insights are gold** - "Core vs Workspace" separation came from user
2. **Separate concerns early** - Mixing core + workspace caused confusion
3. **Clear tool descriptions help** - Agent needs to know WHEN to call each tool
4. **Test with voice, not just UI** - Agent integration is the real test
5. **Hot-reload can lie** - Always test production build for confirmation

---

**Last Updated:** 2025-10-10  
**Author:** AI Executor  
**Status:** Phase 1 & 2 Complete, Ready for Testing

