# Implementation Prompt: Multi-Project Workspace System

## Context

You are implementing a multi-project workspace system for a Next.js voice agent application. This is a **fresh implementation** - the features do NOT currently exist in the codebase.

**Current State:**
- Single workspace with tabs (managed by `WorkspaceContext`)
- Voice agent system working (OpenAI Realtime API)
- Spy/command-center dark theme with cyan accents
- All foundation styling complete

**Goal:**
Implement two major features as specified in `WORKSPACE_FEATURE_PROMPT.md` with special attention to agent context synchronization.

---

## CRITICAL: Read These Files First

### 1. Feature Specification (MUST READ)
**File:** `14-voice-agents/realtime-workspace-agents/WORKSPACE_FEATURE_PROMPT.md`

This 596-line document contains:
- Complete UI specifications
- Data structures
- Code examples
- Testing checklist
- Implementation phases

### 2. Agent Sync Architecture (MUST READ)
**File:** `14-voice-agents/realtime-workspace-agents/AGENT_PROJECT_SYNC_IMPLEMENTATION.md`

This 400-line guide contains:
- Deep architectural analysis
- Why agent context gets stale when switching projects
- 5 solution approaches analyzed (with recommended approach)
- Implementation strategy
- Edge cases and testing checklist

**KEY INSIGHT FROM THIS GUIDE:**
The voice agent's conversation history is stored server-side by OpenAI. When you switch projects, the workspace tabs update in the UI, but the agent's LLM context still contains references to the old project's tabs. The only reliable solution is to **auto-disconnect the agent** when switching projects, then user reconnects for a fresh conversation.

---

## Implementation Order

### Phase 1: Multi-Project System (Priority: HIGH)

**What to Build:**
1. `ProjectContext.tsx` - Manages multiple projects with CRUD operations
2. `projectUtils.ts` - Helper functions (fuzzy search, ID generation, timestamps)
3. `ProjectSwitcher.tsx` - Command palette modal (Cmd+P)
4. Integrate with existing `WorkspaceContext` to make tabs project-specific
5. Migration logic from old `workspaceState` to project system

**Key Features:**
- Press **Cmd+P** to open project switcher
- Fuzzy search across project names
- Show recent projects (last 3)
- Create new projects inline
- Each project has its own set of tabs
- Automatic migration of existing workspace data

**Files to Create:**
```
src/app/lib/projectUtils.ts
src/app/contexts/ProjectContext.tsx
src/app/components/ProjectSwitcher.tsx
```

**Files to Modify:**
```
src/app/page.tsx (add ProjectProvider)
src/app/App.tsx (add keyboard shortcut, ProjectSwitcher component)
src/app/contexts/WorkspaceContext.tsx (integrate with ProjectContext)
src/app/components/Workspace.tsx (show project name in header)
```

**Reference:** See `WORKSPACE_FEATURE_PROMPT.md` lines 32-163 for detailed specifications.

---

### Phase 2: Mission Brief Side Rail (Priority: HIGH)

**What to Build:**
1. `BriefContext.tsx` - Manages brief sections with templates
2. `MissionBriefRail.tsx` - Collapsible panel (40px → 300px)
3. `BriefSection.tsx` - Individual section display/edit component
4. `AddBriefModal.tsx` - Template selection modal

**Key Features:**
- Press **Cmd+B** to toggle panel
- Collapsed state: 40px with icon buttons
- Expanded state: 300px with full content
- 4 templates: Goals 🎯, Values 💡, Schedule ⏰, Custom 📝
- Global sections (appear in all projects)
- Project-specific sections
- Inline editing with markdown support

**Files to Create:**
```
src/app/contexts/BriefContext.tsx
src/app/components/MissionBriefRail.tsx
src/app/components/BriefSection.tsx
src/app/components/AddBriefModal.tsx
```

**Files to Modify:**
```
src/app/page.tsx (add BriefProvider)
src/app/App.tsx (add Cmd+B keyboard shortcut)
src/app/components/Workspace.tsx (add MissionBriefRail, update header)
```

**Reference:** See `WORKSPACE_FEATURE_PROMPT.md` lines 126-274 for detailed specifications.

---

### Phase 3: Agent-Project Synchronization (Priority: CRITICAL)

**Problem:**
When user switches projects, the voice agent continues to reference the old project's tabs in its responses because the conversation history is stored server-side.

**Solution:**
Auto-disconnect the agent when the user switches projects. User then reconnects for a fresh conversation with the new project context.

**What to Implement:**

1. **Track Connected Project**
   ```typescript
   // In App.tsx
   const connectedProjectIdRef = useRef<string | null>(null);
   
   // On connect:
   connectedProjectIdRef.current = currentProjectId;
   ```

2. **Auto-Disconnect Effect**
   ```typescript
   useEffect(() => {
     if (sessionStatus === "DISCONNECTED") return;
     
     // If connected to different project, disconnect
     if (connectedProjectIdRef.current && 
         connectedProjectIdRef.current !== currentProjectId) {
       disconnectFromRealtime();
       
       // Show clear notification
       const currentProject = getCurrentProject();
       if (currentProject) {
         addTranscriptBreadcrumb(
           `🔄 Switched to project: ${currentProject.name}. Connect to start a new conversation.`
         );
       }
     }
   }, [currentProjectId, sessionStatus]);
   ```

3. **Add Project Context Breadcrumb**
   ```typescript
   // In connectToRealtime(), after successful connection:
   connectedProjectIdRef.current = currentProjectId;
   
   const currentProject = getCurrentProject();
   if (currentProject) {
     addTranscriptBreadcrumb(`🗂️ Connected to project: ${currentProject.name}`);
   }
   ```

4. **Clear Ref on Disconnect**
   ```typescript
   const disconnectFromRealtime = () => {
     disconnect();
     setSessionStatus("DISCONNECTED");
     setIsPTTUserSpeaking(false);
     connectedProjectIdRef.current = null; // Add this
   };
   ```

**Files to Modify:**
```
src/app/App.tsx (add tracking, auto-disconnect effect, breadcrumbs)
```

**Why This Works:**
- New WebRTC session = new conversation = no stale context
- User has clear feedback about what happened
- No risk of agent mixing contexts from different projects

**Reference:** See `AGENT_PROJECT_SYNC_IMPLEMENTATION.md` for complete analysis and edge cases.

---

### Phase 4: Performance Optimizations (Priority: MEDIUM)

**Problem:**
Without these optimizations, switching projects causes excessive re-renders and slowness.

**What to Implement:**

1. **Debounced Saves** (WorkspaceContext)
   ```typescript
   // Save tabs with 200ms debounce
   useEffect(() => {
     if (!currentProjectId) return;
     
     const timeout = setTimeout(() => {
       updateProjectTabs(currentProjectId, tabs);
     }, 200);
     
     return () => clearTimeout(timeout);
   }, [tabs, currentProjectId, updateProjectTabs]);
   ```

2. **Grace Period After Load** (WorkspaceContext)
   ```typescript
   const lastLoadTimeRef = useRef<number>(0);
   
   // On project load:
   lastLoadTimeRef.current = Date.now();
   
   // In save effect:
   const timeSinceLoad = Date.now() - lastLoadTimeRef.current;
   if (timeSinceLoad < 300) return; // Skip save for 300ms
   ```

3. **Stable Dependencies**
   ```typescript
   // Only depend on currentProjectId, not getter functions
   useEffect(() => {
     if (!currentProjectId) return;
     const currentProject = getCurrentProject();
     // ... load tabs
   }, [currentProjectId]); // NOT [currentProjectId, getCurrentProject]
   ```

**Files to Modify:**
```
src/app/contexts/WorkspaceContext.tsx
```

**Reference:** See scratchpad.md "Performance Optimization" section for detailed analysis.

---

## Testing Requirements

### Critical Test: Agent Context Synchronization

**This is THE most important test:**

1. Create Project A with tabs: "Research Notes", "Budget"
2. Connect to voice agent
3. Ask: "What tabs do I have?"
4. Verify: Agent says "Research Notes" and "Budget"
5. Press Cmd+P, create Project B with tab: "Meeting Minutes"
6. Verify: Agent auto-disconnects, breadcrumb appears
7. Click Connect again
8. Ask: "What tabs do I have?"
9. **CRITICAL:** Agent should say ONLY "Meeting Minutes"
10. **CRITICAL:** Agent should NOT mention "Research Notes" or "Budget"

If step 10 fails, the implementation is broken.

### Other Tests (From WORKSPACE_FEATURE_PROMPT.md)

- [ ] Create first project from existing workspace (migration)
- [ ] Create 3+ new projects with different names
- [ ] Switch between projects via Cmd+P
- [ ] Verify tabs are project-specific
- [ ] Add brief section with each template type
- [ ] Edit brief section content inline
- [ ] Mark section as global, verify it appears in all projects
- [ ] Mark section as project-specific, verify isolation
- [ ] Delete section with confirmation
- [ ] Test keyboard navigation (Cmd+P, Cmd+B, arrows, Enter, Esc)
- [ ] Refresh page, verify all state persists
- [ ] Test rapid project switching (no crashes)
- [ ] Test with long project names

---

## Design System Compliance

**Must Follow:**
- Colors: Use existing Tailwind classes (bg-bg-primary, text-accent-primary, etc.)
- Typography: `font-mono` throughout, `uppercase tracking-widest` for headers
- Borders: `border-border-primary`, no drop shadows (only glows)
- Hover: Cyan glow effects (`hover:shadow-glow-cyan`, `hover:border-accent-primary`)
- Animations: `transition-all duration-200`
- Terminal aesthetic: Maintain spy/command-center vibe

**Reference:** Check existing components (ProjectSwitcher should match Transcript modal style)

---

## Edge Cases to Handle

### Project System
1. **First-time user:** No projects exist → auto-create "Default Project" from old workspace
2. **Delete current project while connected:** Disconnect agent, switch to another project
3. **Rapid switching:** Don't trigger multiple disconnects, debounce properly
4. **Empty project name:** Use "Untitled Project" as fallback
5. **Duplicate project names:** Allow (they have unique IDs)

### Agent Sync
1. **Agent speaking when switch happens:** Disconnect cleanly (audio stops)
2. **Network disconnect during switch:** Don't call disconnect() if already disconnected
3. **Switch from null to first project:** Don't trigger disconnect (not a "switch")
4. **Switch back to same project:** Load tabs correctly, don't disconnect

### Brief System
1. **Global section marked in project:** Remove from project's activeBriefSectionIds
2. **Delete section while editing:** Close edit mode gracefully
3. **Empty section content:** Allow (user's choice)
4. **Too many sections:** No limit, but UI should scroll

---

## Migration Strategy

**On first load:**
```typescript
const oldWorkspaceState = localStorage.getItem('workspaceState');
const projectState = localStorage.getItem('projectState');

if (oldWorkspaceState && !projectState) {
  // Migrate old workspace to first project
  const oldWorkspace = JSON.parse(oldWorkspaceState);
  const defaultProject: Project = {
    id: generateProjectId(),
    name: 'Default Project',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    tabs: oldWorkspace.tabs || [],
    activeBriefSectionIds: []
  };
  
  localStorage.setItem('projectState', JSON.stringify({
    projects: [defaultProject],
    currentProjectId: defaultProject.id,
    recentProjectIds: [defaultProject.id]
  }));
  
  console.log('✅ Migrated to project system');
}
```

---

## Success Criteria

### Functional
- ✅ Cmd+P opens project switcher with fuzzy search
- ✅ Can create projects and switch between them
- ✅ Each project has its own tabs (verified in UI and localStorage)
- ✅ Cmd+B toggles mission brief panel
- ✅ Can create/edit/delete brief sections
- ✅ Global sections appear in all projects
- ✅ Project-specific sections only in selected projects
- ✅ **CRITICAL:** Agent context syncs when switching projects
- ✅ All state persists across page refreshes

### Performance
- ✅ Project switching is instant (<100ms)
- ✅ No slowness or lag when modifying tabs
- ✅ No excessive re-renders (check React DevTools)

### UX
- ✅ Clear visual feedback (breadcrumbs, hover states)
- ✅ Keyboard navigation works throughout
- ✅ Empty states are helpful
- ✅ No confusing states or error messages

---

## Implementation Tips

### 1. Start with ProjectContext
This is the foundation. Get this working first before building UI.

### 2. Test Migration Early
Create a fake old workspace in localStorage and verify migration works.

### 3. Use Existing Patterns
Look at how `WorkspaceContext` is structured and follow the same pattern for `ProjectContext` and `BriefContext`.

### 4. Console.log Liberally
Add debug logs for:
- Project switching
- Tab loading/saving
- Agent connect/disconnect
- Brief section visibility

### 5. Build Incrementally
Don't try to build everything at once. Build Phase 1, test thoroughly, then Phase 2, etc.

### 6. The Agent Test is Critical
If the agent context synchronization doesn't work, everything else is pointless. Test this extensively.

---

## Common Pitfalls to Avoid

1. **❌ Don't use `getCurrentProject()` in useEffect dependencies**
   - It's a function that gets recreated every render
   - Causes infinite loops
   - Use `currentProjectId` instead

2. **❌ Don't save tabs immediately after loading them**
   - Causes circular updates
   - Use grace period or loading flag

3. **❌ Don't forget to add providers to page.tsx**
   - ProjectProvider wraps everything (outermost)
   - BriefProvider goes inside ProjectProvider

4. **❌ Don't assume agent will "just know" about project switch**
   - Agent conversation history is server-side
   - Only solution is disconnect/reconnect

5. **❌ Don't skip the migration logic**
   - Existing users have data in `workspaceState`
   - Must migrate or they lose their work

---

## Files Reference

### New Files to Create (11 files)
```
src/app/lib/projectUtils.ts
src/app/contexts/ProjectContext.tsx
src/app/contexts/BriefContext.tsx
src/app/components/ProjectSwitcher.tsx
src/app/components/MissionBriefRail.tsx
src/app/components/BriefSection.tsx
src/app/components/AddBriefModal.tsx
```

### Files to Modify (5 files)
```
src/app/page.tsx
src/app/App.tsx
src/app/contexts/WorkspaceContext.tsx
src/app/components/Workspace.tsx
```

### Reference Files (Read but don't modify)
```
14-voice-agents/realtime-workspace-agents/WORKSPACE_FEATURE_PROMPT.md
14-voice-agents/realtime-workspace-agents/AGENT_PROJECT_SYNC_IMPLEMENTATION.md
.cursor/scratchpad.md
```

---

## When You're Done

1. **Run tests** (see Testing Requirements above)
2. **Build production:** `npm run build` (must succeed)
3. **Test the critical agent sync** (most important!)
4. **Commit with clear message** describing what was implemented
5. **Update scratchpad.md** with results and any issues encountered

---

## Questions to Ask If Stuck

1. **"Why is the agent still referencing old tabs?"**
   → Check if auto-disconnect is actually firing. Add console.log to the effect.

2. **"Why is switching projects so slow?"**
   → Check if you implemented debouncing and grace periods in WorkspaceContext.

3. **"Why are tabs not persisting?"**
   → Check if ProjectContext is saving to localStorage. Check browser DevTools > Application > Local Storage.

4. **"Why does the UI keep re-rendering?"**
   → Check useEffect dependencies. Remove function references like `getCurrentProject()`.

5. **"Why did migration not work?"**
   → Check if old `workspaceState` exists. Check console for migration log.

---

## Final Notes

- This is a complex feature spanning multiple contexts and components
- The agent synchronization is the trickiest part - read the architecture guide carefully
- Take your time, build incrementally, test frequently
- The architecture guide has analyzed 5 different approaches - stick with the recommended one
- All the detailed specs are in `WORKSPACE_FEATURE_PROMPT.md`

**Good luck! This is an exciting feature that will significantly enhance the user experience.** 🎯

