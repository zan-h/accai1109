# Commands to Revert and Restart Clean

## Current State
- HEAD: 48d3890 (with implementation guides)
- Uncommitted changes: App.tsx, WorkspaceContext.tsx (performance optimizations)
- Want to: Go back to 2567912 code state, keep the guides

## Recommended: Option 1 (Clean Revert)

```bash
cd /Users/mizan/100MRR/bh-refactor

# 1. Discard uncommitted changes
git restore 14-voice-agents/realtime-workspace-agents/src/app/App.tsx
git restore 14-voice-agents/realtime-workspace-agents/src/app/contexts/WorkspaceContext.tsx

# 2. Verify clean state
git status

# 3. Revert the 3 implementation commits (Phase 1, fix, Phase 2)
git revert --no-commit 830b924 ee064f0 d4c6274

# 4. Commit the revert
git commit -m "Revert Phases 1 & 2 for clean re-implementation

Keeping:
- Implementation guides (AGENT_PROJECT_SYNC_IMPLEMENTATION.md)
- Implementation prompt (IMPLEMENTATION_PROMPT_MULTI_PROJECT_WORKSPACE.md)

Reverting:
- Phase 1: Multi-Project System
- Phase 2: Mission Brief Side Rail  
- Circular dependency fix

Ready for clean re-implementation following the guides."

# 5. Push to remote
git push origin main
```

## Alternative: Option 2 (Hard Reset)

⚠️ **More aggressive - only use if Option 1 fails**

```bash
cd /Users/mizan/100MRR/bh-refactor

# 1. Hard reset to 2567912
git reset --hard 2567912

# 2. Cherry-pick guide commits back
git cherry-pick a33850b
git cherry-pick 48d3890

# 3. Force push (⚠️ DESTRUCTIVE)
git push --force origin main
```

## After Reverting

Your prompt for the next model/session:

```
I want you to implement the Multi-Project Workspace System as specified in IMPLEMENTATION_PROMPT_MULTI_PROJECT_WORKSPACE.md.

This is a fresh implementation - none of the features currently exist. Please read:
1. IMPLEMENTATION_PROMPT_MULTI_PROJECT_WORKSPACE.md (main guide)
2. WORKSPACE_FEATURE_PROMPT.md (detailed specs)
3. AGENT_PROJECT_SYNC_IMPLEMENTATION.md (architecture deep-dive)

Implement in this order:
- Phase 1: Multi-Project System (ProjectContext, ProjectSwitcher, Cmd+P)
- Phase 2: Mission Brief Side Rail (BriefContext, MissionBriefRail, Cmd+B)
- Phase 3: Agent-Project Synchronization (auto-disconnect on project switch)
- Phase 4: Performance Optimizations (debouncing, grace periods)

CRITICAL TEST: After Phase 3, verify that when you switch projects, the voice agent does NOT reference tabs from the previous project.

Follow the spy/command-center aesthetic. Test thoroughly. Commit when working.
```

## Files That Will Be Removed

After revert, these files will be gone (will need to be re-created):
- `src/app/lib/projectUtils.ts`
- `src/app/contexts/ProjectContext.tsx`
- `src/app/contexts/BriefContext.tsx`
- `src/app/components/ProjectSwitcher.tsx`
- `src/app/components/MissionBriefRail.tsx`
- `src/app/components/BriefSection.tsx`
- `src/app/components/AddBriefModal.tsx`

Modified files will return to 2567912 state:
- `src/app/page.tsx`
- `src/app/App.tsx`
- `src/app/contexts/WorkspaceContext.tsx`
- `src/app/components/Workspace.tsx`

## Files That Will Remain

These guides will stay (they're in later commits):
- ✅ `IMPLEMENTATION_PROMPT_MULTI_PROJECT_WORKSPACE.md`
- ✅ `14-voice-agents/realtime-workspace-agents/AGENT_PROJECT_SYNC_IMPLEMENTATION.md`
- ✅ `.cursor/scratchpad.md` (updated with notes)

## Verify After Revert

```bash
# Check git log
git log --oneline -5

# Should see:
# <new_commit> Revert Phases 1 & 2 for clean re-implementation
# 48d3890 Add comprehensive implementation prompt for next model
# a33850b Add comprehensive agent-project sync implementation guide  
# 830b924 Implement Phase 2: Mission Brief Side Rail
# ee064f0 Fix: Prevent circular dependency glitch when switching projects

# Check file existence
ls -la IMPLEMENTATION_PROMPT_MULTI_PROJECT_WORKSPACE.md
ls -la 14-voice-agents/realtime-workspace-agents/AGENT_PROJECT_SYNC_IMPLEMENTATION.md
ls -la 14-voice-agents/realtime-workspace-agents/src/app/components/ProjectSwitcher.tsx
# Should exist: first two
# Should NOT exist: third one (will be removed by revert)
```

