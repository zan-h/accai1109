# ⚠️ Undo/Recovery Implementation - Post-Mortem

**Date:** November 15, 2025  
**Status:** REVERTED - Multiple bugs, over-engineered  
**Decision:** Start fresh with simpler approach

---

## 📋 What Was Built

### Features Implemented (All Working, But Buggy)

1. **Change Tracking System**
   - `WorkspaceEdit` interface with metadata (timestamp, source, changeSize)
   - `recentEdits` array (last 20 edits)
   - `recordEdit()` function
   - Console logging: `📝 Workspace Edit: content on "Tab 1" by agent`

2. **Undo/Redo Stack**
   - `undoStack` and `redoStack` state (50 entry limit)
   - `saveToUndoStack()` before every change
   - `undo()` and `redo()` functions
   - Clears on project switch

3. **Keyboard Shortcuts**
   - `useKeyboardShortcuts.ts` hook
   - Cmd+Z (undo), Cmd+Shift+Z (redo)
   - Doesn't interfere with input fields

4. **UI Components**
   - `UndoRedoButtons.tsx` in toolbar (↶ ↷)
   - Tooltips with preview
   - Enable/disable based on stack state

5. **Confirmation Modals**
   - `ConfirmationModal.tsx` for >80% changes
   - `diffUtils.ts` for change calculation
   - Before/after preview
   - Always confirms tab deletions

6. **Toast Notifications**
   - `ToastContext.tsx` + `ToastContainer.tsx`
   - "✓ Undone: content 'Tab 1'"
   - slideIn animation

7. **Transcript Breadcrumbs**
   - Agent edits logged to conversation
   - "📝 Updated 'Tab Name'"

### Attempted Features (Removed Mid-Implementation)
- Per-tab inline undo buttons (Gmail-style) - Caused confusion and performance issues

---

## 🐛 Critical Bugs

### Bug #1: Infinite Loop Crash
**Symptom:** React error "Maximum update depth exceeded"

**Cause:**
```typescript
// Sidebar.tsx
useEffect(() => {
  const edit = getLastEditForTab(tab.id); // Function recreates on every render
  // ...
}, [tab.id, getLastEditForTab]); // ← Dependency on recreating function
```

**Impact:** App crashed repeatedly, required constant refreshes

### Bug #2: Extreme Typing Lag
**Symptom:** Chat input became impossibly slow (multi-second delays per character)

**Root Cause Chain:**
1. User types in chat input
2. Autosave triggers every keystroke
3. Tabs update → `recentEdits` array changes
4. All tab components re-render (checking for new edits)
5. Multiple `useEffect` hooks run
6. Sidebar re-renders 20+ times per keystroke

**Impact:** User couldn't type, feature unusable

### Bug #3: Undo Didn't Work
**Symptom:** 
```
⚠️ No undo history for tab ea86c53f-817c-4fc6-a1f5-0fc4e6ed1749
```

**Cause:** Agent functions (`setTabContent`, `addWorkspaceTab`, `deleteWorkspaceTab`) weren't calling `saveToUndoStack()` before making changes

**Why:** These functions are exported OUTSIDE the context provider, can't easily access internal methods

### Bug #4: Function Not Exported
**Symptom:** 
```
TypeError: ws.saveToUndoStack is not a function
```

**Cause:** After fixing Bug #3 by adding `saveToUndoStack()` calls, realized the function wasn't exported through `WorkspaceState` interface

**Fix Applied:** Added to interface, but created more complexity

### Bug #5: Circular Dependencies
**Symptom:** Functions depending on each other in dependency arrays

**Cause:**
```typescript
const setTabs = useCallback(() => {
  // ... uses recordEdit, saveToUndoStack
}, [recordEdit, saveToUndoStack]); // ← Depends on functions below

// ... 100 lines later ...

const recordEdit = useCallback(() => {
  // ...
}, []);

const saveToUndoStack = useCallback(() => {
  // ... uses tabs
}, [tabs]); // ← Depends on state from above
```

**Solution Attempted:** Moved function definitions earlier, but made code hard to follow

---

## 🔍 Root Cause Analysis

### Why This Failed

**1. Over-Engineering**
- Built 7 features at once instead of 1
- Each feature added complexity and interaction points
- Too many moving parts to debug

**2. React Hook Dependency Hell**
- Functions recreate when state changes
- State changes when functions run
- `useEffect` runs when functions recreate
- Circular update cycles

**3. Performance Not Considered**
- `recentEdits` array triggers re-renders everywhere
- Every tab component watching for changes
- No memoization, no optimization
- Added features before testing performance impact

**4. Agent Integration Issues**
- Agent helper functions exported outside context
- Use `useWorkspaceContext.getState()` to access state
- Can't easily call context methods
- Requires complex workarounds

**5. Ignored User Feedback**
- User said: "I would like just a very simple undo last action / re-do"
- We built: change tracking, per-tab undo, confirmations, toasts, breadcrumbs, tooltips...
- Should have started with bare minimum

---

## 📁 Files Modified (Need Revert)

### New Files (DELETE)
- `src/app/hooks/useKeyboardShortcuts.ts`
- `src/app/lib/diffUtils.ts`
- `src/app/components/UndoRedoButtons.tsx`
- `src/app/components/ConfirmationModal.tsx`
- `src/app/contexts/ToastContext.tsx`
- `src/app/components/ToastContainer.tsx`
- `GUARDRAILS_AND_UNDO_SUMMARY.md` (this directory)

### Modified Files (GIT REVERT)
- `src/app/types.ts` - Added 3 new interfaces
- `src/app/contexts/WorkspaceContext.tsx` - Extensive changes (~200 LOC)
- `src/app/agentConfigs/shared/tools/workspace/workspaceTools.ts` - Added `details` param
- `src/app/components/workspace/Sidebar.tsx` - Per-tab undo tracking
- `src/app/components/Workspace.tsx` - Added UndoRedoButtons
- `src/app/App.tsx` - Keyboard shortcuts, modal
- `src/app/page.tsx` - Toast provider
- `src/app/globals.css` - Animation keyframe

---

## 💡 Recommendations for Next Agent

### Option A: Minimal Viable Undo ⭐ (RECOMMENDED)

**Build THIS and ONLY THIS:**

```typescript
// In WorkspaceContext.tsx
const [undoStack, setUndoStack] = useState<WorkspaceTab[][]>([]);

const saveToUndo = useCallback(() => {
  setUndoStack(prev => [...prev, [...tabs]].slice(-10)); // Keep last 10
}, [tabs]);

const undo = useCallback(() => {
  if (undoStack.length === 0) return;
  const lastState = undoStack[undoStack.length - 1];
  setTabsInternal(lastState);
  setUndoStack(prev => prev.slice(0, -1));
}, [undoStack]);

// Call saveToUndo() BEFORE every setTabsInternal() call
```

**Add keyboard shortcut:**
```typescript
// In App.tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [undo]);
```

**That's it. No redo, no modals, no toasts.**

**Files to touch:** 2 (WorkspaceContext.tsx, App.tsx)  
**Lines of code:** ~30  
**Testing:** Simple - make change, press Cmd+Z, verify it reverts

---

### Option B: Confirmation Modals Only

**Show modal BEFORE destructive changes:**

```typescript
// In setTabContent (WorkspaceContext)
if (source === 'agent' && changeSize > 80) {
  // Show modal, wait for approval
  // On approve: apply change
  // On cancel: do nothing
}
```

**No undo needed** - prevents data loss at the source

---

### Option C: Both, But Incrementally

**Week 1:** Implement Option A (undo only)  
**Test thoroughly** with user  
**Week 2:** Add Option B (confirmations)  
**Test again**

---

## 🎯 Next Agent Instructions

### Step 1: Revert
```bash
cd "/Users/mizan/100MRR/accai adhd/14-voice-agents/realtime-workspace-agents"

# Revert all changes
git checkout HEAD -- src/app/types.ts
git checkout HEAD -- src/app/contexts/WorkspaceContext.tsx
git checkout HEAD -- src/app/agentConfigs/shared/tools/workspace/workspaceTools.ts
git checkout HEAD -- src/app/components/workspace/Sidebar.tsx
git checkout HEAD -- src/app/components/Workspace.tsx
git checkout HEAD -- src/app/App.tsx
git checkout HEAD -- src/app/page.tsx
git checkout HEAD -- src/app/globals.css

# Delete new files
rm src/app/hooks/useKeyboardShortcuts.ts
rm src/app/lib/diffUtils.ts
rm src/app/components/UndoRedoButtons.tsx
rm src/app/components/ConfirmationModal.tsx
rm src/app/contexts/ToastContext.tsx
rm src/app/components/ToastContainer.tsx
rm GUARDRAILS_AND_UNDO_SUMMARY.md
```

### Step 2: Implement Minimal Undo

**Only modify `WorkspaceContext.tsx`:**

1. Add state:
```typescript
const [undoStack, setUndoStack] = useState<WorkspaceTab[][]>([]);
```

2. Add save function:
```typescript
const saveToUndo = useCallback(() => {
  setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(tabs))].slice(-10));
}, [tabs]);
```

3. Add undo function:
```typescript
const undo = useCallback(() => {
  if (undoStack.length === 0) {
    console.log('Nothing to undo');
    return;
  }
  const lastState = undoStack[undoStack.length - 1];
  setTabsInternal(lastState);
  setUndoStack(prev => prev.slice(0, -1));
  console.log('Undone!');
}, [undoStack]);
```

4. Call `saveToUndo()` in these places:
   - `setTabs()` - before `setTabsInternal()`
   - `addTab()` - before `setTabsInternal()`
   - `renameTab()` - before `setTabsInternal()`
   - `deleteTab()` - before `setTabsInternal()`

5. Export in value object:
```typescript
const value = {
  // ... existing fields ...
  undo,
  canUndo: undoStack.length > 0,
};
```

### Step 3: Add Keyboard Shortcut

**Only modify `App.tsx`:**

```typescript
// At top level of App component
const { undo, canUndo } = useWorkspaceContext();

useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      if (canUndo) {
        e.preventDefault();
        undo();
      }
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [undo, canUndo]);
```

### Step 4: Test

1. Start app
2. Make changes (user or agent)
3. Press Cmd+Z
4. Verify content reverts
5. Check console for "Undone!" message

**If this works, STOP. Ship it. Done.**

---

## 🚨 What NOT To Do

❌ Don't build all features at once  
❌ Don't add redo until undo works perfectly  
❌ Don't add per-tab undo (confusing)  
❌ Don't add inline buttons (performance issues)  
❌ Don't track `recentEdits` separately (redundant with stack)  
❌ Don't export functions that need context methods  
❌ Don't add `useEffect` with function dependencies  
❌ Don't optimize before it works

---

## 📊 Complexity Comparison

### What We Built (FAILED)
- **7 features**
- **8 files modified**
- **6 new files**
- **~600 lines of code**
- **5 critical bugs**
- **Performance unusable**

### What We Should Build (WILL WORK)
- **1 feature** (undo)
- **2 files modified**
- **0 new files**
- **~30 lines of code**
- **0 known bugs**
- **No performance impact**

---

## 🎓 Key Lessons

1. **KISS (Keep It Simple, Stupid)**
   - Simple solutions work
   - Complex solutions create bugs
   - Each feature multiplies complexity

2. **Test Early, Test Often**
   - Don't build 7 features then test
   - Build 1 feature, test, ship
   - Then build next feature

3. **Listen to User**
   - User said "simple undo"
   - We built complex tracking system
   - Should have asked "is this enough?"

4. **React Performance Matters**
   - Every state change triggers renders
   - Every function recreation triggers effects
   - Profile before shipping

5. **Context Export Problems**
   - Functions outside provider can't access methods
   - Either put functions inside provider
   - Or pass methods through parameters

---

## ✅ Success Criteria for Next Attempt

- [ ] User can press Cmd+Z to undo last change
- [ ] Works for user edits AND agent edits
- [ ] Console shows "Undone!" message
- [ ] Typing in chat is smooth (no lag)
- [ ] No infinite loops
- [ ] No crashes
- [ ] Code is simple enough to explain in 2 minutes

**Ship when ALL checkboxes are true. Not before.**

---

**Next agent: You got this. Keep it simple. Focus on the user's need: "just a very simple undo last action."**

Good luck! 🚀

