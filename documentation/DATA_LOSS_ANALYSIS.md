# Data Loss Analysis - WebRTC Disconnection & Page Refresh Issue

**Date**: October 22, 2025
**Issue**: User reported losing notes after WebRTC disconnection and page refresh
**Severity**: 🔴 CRITICAL - Affects user data integrity

---

## Summary

Your application has **5 critical vulnerabilities** that can cause data loss when users disconnect WebRTC or refresh the page. The most dangerous issue is that **pending saves (within 200ms) are lost completely** when the page closes.

---

## Data Flow Architecture

```
User Edits Tab Content (TabContent.tsx)
    ↓
    calls setTabs() → Updates React state
    ↓
    triggers useEffect in WorkspaceContext (line 81-99)
    ↓
    ⏰ Waits 200ms (debounce timeout)
    ↓
    calls updateProjectTabs() → API call to /api/projects/[id]/tabs
    ↓
    🌐 Network request to Supabase
    ↓
    ✅ Data persisted (if everything succeeds)
```

---

## Critical Vulnerabilities

### 🔴 **VULNERABILITY #1: No `beforeunload` Handler**

**Location**: `WorkspaceContext.tsx`, lines 80-99

**Issue**: The 200ms debounce timeout is cleared when the page refreshes/closes, losing any pending saves.

**Code**:
```tsx
// Save tabs back to project (debounced)
useEffect(() => {
  // ...
  const timeout = setTimeout(() => {
    updateProjectTabs(currentProjectId, tabs);  // 200ms delay
    console.log('💾 Saved tabs to project:', tabs.length, 'tabs');
  }, 200);
  
  return () => clearTimeout(timeout);  // ⚠️ Timeout cancelled on unmount!
}, [tabs, currentProjectId, updateProjectTabs, getCurrentProject]);
```

**What Happens**:
1. User types in a tab
2. Component schedules save for 200ms later
3. User immediately refreshes page (within 200ms)
4. `clearTimeout()` runs, cancelling the save
5. **Data is lost forever**

**User Impact**: Any edits made within 200ms of closing/refreshing are lost.

**Solution**: Add `beforeunload` handler to force synchronous save.

---

### 🔴 **VULNERABILITY #2: Async Fire-and-Forget Pattern**

**Location**: `WorkspaceContext.tsx`, line 94

**Issue**: `updateProjectTabs()` is async but never awaited. If the API call is in-flight when the page closes, it's aborted mid-request.

**Code**:
```tsx
const timeout = setTimeout(() => {
  updateProjectTabs(currentProjectId, tabs);  // ⚠️ Not awaited!
  console.log('💾 Saved tabs to project:', tabs.length, 'tabs');
}, 200);
```

**What Happens**:
1. User edits content → triggers save after 200ms
2. Save starts → makes fetch() call to `/api/projects/[id]/tabs`
3. User refreshes page **while fetch is in progress**
4. Browser aborts the fetch request (standard behavior)
5. **Partial or no data saved**

**User Impact**: Even after the 200ms window, data can still be lost if refresh happens during the network request (typically 50-500ms).

**Solution**: 
- Use `navigator.sendBeacon()` in `beforeunload` for guaranteed delivery
- Or use `keepalive: true` in fetch options (but less reliable)

---

### 🔴 **VULNERABILITY #3: Delete-Then-Insert Database Pattern**

**Location**: `/api/projects/[id]/tabs/route.ts`, lines 56-71

**Issue**: The API deletes ALL tabs first, then inserts new ones. If the insert fails, all user data is gone.

**Code**:
```tsx
// Delete existing tabs
await supabase.from('workspace_tabs').delete().eq('project_id', id);

// Insert new tabs
if (validated.tabs.length > 0) {
  const tabsData = validated.tabs.map((tab, index) => ({...}));
  const { error } = await supabase.from('workspace_tabs').insert(tabsData);
  if (error) throw error;  // ⚠️ Data already deleted!
}
```

**What Happens**:
1. API receives request to update tabs
2. Deletes all existing tabs from database ✅
3. Tries to insert new tabs
4. **If insert fails** (network error, validation error, etc.)
5. Old data = deleted, New data = not saved
6. **Total data loss**

**User Impact**: Catastrophic - all tabs in a project could be permanently deleted if an error occurs.

**Solution**: 
- Use database transaction (BEGIN/COMMIT/ROLLBACK)
- Or use UPSERT pattern instead of delete-then-insert
- Or soft-delete with a flag, then purge only after successful insert

---

### 🟡 **VULNERABILITY #4: No Error Handling in Frontend**

**Location**: `WorkspaceContext.tsx`, line 94 & `ProjectContext.tsx`, line 217

**Issue**: If `updateProjectTabs()` fails (network error, 401, 500), the error is never caught or shown to the user.

**Code (WorkspaceContext)**:
```tsx
setTimeout(() => {
  updateProjectTabs(currentProjectId, tabs);  // ⚠️ No .catch()
}, 200);
```

**Code (ProjectContext)**:
```tsx
const updateProjectTabs = useCallback(async (id: string, tabs: WorkspaceTab[]): Promise<void> => {
  const response = await fetch(`/api/projects/${id}/tabs`, {...});
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update tabs');  // ⚠️ Thrown error is never caught!
  }
  // ...
}, []);
```

**What Happens**:
1. User edits content → triggers save
2. Save fails (network issue, auth expired, etc.)
3. Error is thrown but **never displayed**
4. User continues working, believing data is saved
5. User refreshes → **all recent work is gone**

**User Impact**: Silent data loss. Users have no idea their work isn't being saved.

**Solution**: 
- Add error boundary or toast notifications
- Show "Saving..." / "Saved" / "Error saving" indicator in UI
- Retry failed saves

---

### 🟡 **VULNERABILITY #5: Race Condition in Grace Period Logic**

**Location**: `WorkspaceContext.tsx`, lines 85-89

**Issue**: The 300ms grace period can interact poorly with the 200ms debounce, potentially skipping saves.

**Code**:
```tsx
// Grace period: don't save immediately after loading to prevent circular updates
const timeSinceLoad = Date.now() - lastLoadTimeRef.current;
if (timeSinceLoad < 300) {
  console.log('⏸️  Skipping save (within grace period)');
  return;  // ⚠️ Early return = no save scheduled
}
```

**What Happens**:
1. User loads project (sets `lastLoadTimeRef`)
2. Within 300ms, user makes a quick edit
3. Grace period check returns early → no timeout scheduled
4. User waits > 300ms but < 500ms, makes another edit
5. Now timeout IS scheduled (grace period passed)
6. **First edit never saved**

**User Impact**: Edits made immediately after loading a project can be silently dropped.

**Solution**: 
- Instead of returning early, schedule the save for (300ms - timeSinceLoad)
- Or track a "pendingChanges" flag to ensure they're saved after grace period

---

## Additional Concerns

### ⚠️ **No Optimistic Updates**
The UI updates immediately (React state), but if the API call fails, the UI doesn't revert. This creates a false sense of data being saved.

### ⚠️ **No Save Status Indicator**
Users have no way to know:
- Whether their changes are being saved
- Whether a save is in progress
- Whether a save failed

### ⚠️ **No Offline Support**
If the user loses internet connection, all edits are lost. Consider using:
- Service Workers
- IndexedDB for local persistence
- Sync queue for offline edits

---

## Recommended Fixes (Priority Order)

### 1. 🔴 **IMMEDIATE: Add `beforeunload` Handler**

```tsx
// In WorkspaceContext.tsx or App.tsx
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    const state = useWorkspaceContext.getState();
    const currentProject = getCurrentProject();
    
    if (!currentProject) return;
    
    // Synchronous save using sendBeacon
    const data = JSON.stringify({
      tabs: state.tabs,
    });
    
    navigator.sendBeacon(
      `/api/projects/${currentProject.id}/tabs`,
      new Blob([data], { type: 'application/json' })
    );
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);
```

**Note**: `sendBeacon` has limitations (can't set headers easily, no response handling), so you may need a dedicated endpoint that accepts anonymous POSTs with an auth token in the body.

---

### 2. 🔴 **IMMEDIATE: Fix Delete-Insert Pattern**

```tsx
// Option A: Use transaction
const { error } = await supabase.rpc('update_project_tabs_atomic', {
  p_project_id: id,
  p_tabs: validated.tabs
});

// Option B: Upsert pattern (requires unique constraint on tab.id)
const { error } = await supabase
  .from('workspace_tabs')
  .upsert(tabsData, { onConflict: 'id' });

// Then delete orphaned tabs
await supabase
  .from('workspace_tabs')
  .delete()
  .eq('project_id', id)
  .not('id', 'in', `(${validated.tabs.map(t => t.id).join(',')})`);
```

---

### 3. 🟡 **HIGH: Add Error Handling & UI Feedback**

```tsx
const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

const timeout = setTimeout(async () => {
  setSaveStatus('saving');
  try {
    await updateProjectTabs(currentProjectId, tabs);
    setSaveStatus('saved');
  } catch (err) {
    setSaveStatus('error');
    console.error('Failed to save tabs:', err);
    // Show toast notification
  }
}, 200);
```

---

### 4. 🟡 **HIGH: Reduce Debounce Delay**

200ms + 300ms grace period = 500ms window where data is vulnerable. Consider:
- Reducing debounce to 100ms
- Eliminating grace period (use a different approach to prevent circular updates)
- Implementing immediate save for critical operations (e.g., when user clicks away from tab)

---

### 5. 🟢 **MEDIUM: Add `visibilitychange` Handler**

Save when user switches tabs (browser tab, not workspace tab):

```tsx
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // Trigger immediate save
      flushPendingSaves();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

---

### 6. 🟢 **MEDIUM: Add Autosave Indicator**

```tsx
// In UI header
{saveStatus === 'saving' && <span>💾 Saving...</span>}
{saveStatus === 'saved' && <span>✅ All changes saved</span>}
{saveStatus === 'error' && <span>⚠️ Save failed - retry?</span>}
```

---

## Testing Strategy

### Manual Tests

1. **Fast refresh test**: Edit content, immediately refresh (< 200ms), verify data is saved
2. **Slow network test**: Throttle network to 3G, edit, refresh mid-request, verify data is saved
3. **Offline test**: Go offline, edit content, verify graceful handling
4. **Error test**: Break API (return 500), edit content, verify user is notified

### Automated Tests

```typescript
describe('Data persistence', () => {
  it('should save data before page unload', async () => {
    // 1. Edit tab content
    // 2. Trigger beforeunload event
    // 3. Verify sendBeacon was called with correct data
  });
  
  it('should handle API errors gracefully', async () => {
    // 1. Mock API to return error
    // 2. Edit content
    // 3. Verify error message is shown
  });
});
```

---

## Metrics to Monitor

After fixes are deployed, monitor:

1. **Save success rate**: % of save attempts that succeed
2. **Save latency**: P50, P95, P99 of save duration
3. **Failed save events**: Track and alert on failures
4. **Data reconciliation**: Compare client state vs DB state on load
5. **User complaints**: Monitor support tickets about lost data

---

## Conclusion

The current implementation has **multiple critical data loss vulnerabilities**. The most severe are:

1. ❌ No protection against page close/refresh during pending saves
2. ❌ API deletes all data before inserting new data (no atomicity)
3. ❌ Silent failures - users don't know when saves fail

**Recommended Action**: Implement fixes #1 and #2 immediately before users lose more data.

**Estimated Effort**:
- Fix #1 (beforeunload): 2-4 hours
- Fix #2 (atomic updates): 3-6 hours
- Fixes #3-6 (error handling, UI): 4-8 hours
- **Total**: ~2 days for complete solution

---

## References

- [MDN: beforeunload event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)
- [MDN: sendBeacon](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)
- [Supabase Transactions](https://supabase.com/docs/guides/database/postgres/transactions)

