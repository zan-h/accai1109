# Workspace Template Notes: Product Design & UX Analysis

**Date:** October 19, 2025  
**Status:** Planning Phase  
**Prepared by:** Planner (AI)

---

## Executive Summary

This document analyzes the current workspace template initialization system and proposes elegant solutions to a core UX challenge: **how to provide valuable scaffold templates for new users without polluting their workspace once they have real data**.

**Current Grade:** C+ (functional but inconsistent and confusing)  
**Target Grade:** A (elegant, intuitive, delightful)

---

## Table of Contents

1. [Current System Analysis](#1-current-system-analysis)
2. [User Journey Mapping](#2-user-journey-mapping)
3. [Core UX Problems](#3-core-ux-problems)
4. [Product Design Principles](#4-product-design-principles)
5. [Solution Options (Evaluated)](#5-solution-options-evaluated)
6. [Recommended Solution: Hybrid Intelligence](#6-recommended-solution-hybrid-intelligence)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Edge Cases & Failure Modes](#8-edge-cases--failure-modes)
9. [Success Metrics](#9-success-metrics)
10. [Alternative Approaches](#10-alternative-approaches)

---

## 1. Current System Analysis

### 1.1 How It Works Today

**Component:** `initializeWorkspaceWithTemplates()` in `workspaceInitializer.ts`

```typescript
// Called when user selects a suite
export async function initializeWorkspaceWithTemplates(
  templates: WorkspaceTemplate[]
): Promise<void> {
  const { addTab } = useWorkspaceContext.getState();
  
  // Add each template as a tab
  for (const template of templates) {
    await addTab({
      name: template.name,
      type: template.type,
      content: template.content, // ← Sample data included
    });
  }
}
```

**Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│ User Opens App (First Time)                                     │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ SuiteSelector Modal Appears                                     │
│ User picks "Baby Care Companion" 👶                             │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ handleSelectSuite() fires:                                      │
│   1. Save suite ID to localStorage                              │
│   2. Set root agent                                             │
│   3. Call initializeWorkspaceWithTemplates()  ← KEY MOMENT      │
│   4. Add 6 tabs with sample data                                │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ WorkspaceContext auto-saves tabs to current project            │
│ (via debounced effect after 200ms)                             │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ Tabs now persisted in database with template content           │
└─────────────────────────────────────────────────────────────────┘
```

**What Happens Next:**

1. **User switches to existing project (Cmd+P):**
   - ✅ Tabs load from database
   - ❌ Templates NOT re-added (good)
   - Result: User sees their real data

2. **User creates new project (Cmd+P → "Create New"):**
   - ✅ New project created with current suite ID
   - ❌ Templates NOT added to new project
   - ❌ User starts with empty workspace
   - Result: **Inconsistent experience** - why did first project get templates but not this one?

3. **User switches suites (clicks suite indicator):**
   - ✅ Disconnect warning shown
   - ❌ Templates ARE re-added on top of existing tabs
   - Result: **Potential data pollution** - old tabs + new templates = mess

4. **User manually populates tabs over time:**
   - ✅ Real data replaces sample data
   - ❌ No way to distinguish "scaffold" from "user content"
   - ❌ No "cleanup" or "I'm done with templates" action
   - Result: Templates become clutter if user doesn't manually delete

### 1.2 Data Model

**Projects Table:**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  suite_id TEXT NOT NULL,  -- Links to agent suite
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_accessed_at TIMESTAMP
);
```

**Workspace Tabs Table:**
```sql
CREATE TABLE workspace_tabs (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'markdown' or 'csv'
  content TEXT,
  position INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Missing Field:** No `is_template` or `template_source` field to track tab origin.

### 1.3 Current Problems Summary

| Problem | Severity | Impact |
|---------|----------|--------|
| Templates only added on suite selection, not project creation | HIGH | Inconsistent onboarding |
| No distinction between scaffold and user content | HIGH | Can't auto-cleanup |
| Suite switching re-adds templates on top of existing tabs | HIGH | Data pollution |
| No "dismiss templates" action | MEDIUM | Clutter accumulation |
| Sample data persists indefinitely | MEDIUM | Database bloat |
| No education about templates being scaffolds | MEDIUM | User confusion |

---

## 2. User Journey Mapping

### 2.1 Persona: First-Time Babysitter (Emma)

**Context:** Emma is watching her nephew for the first time. She's nervous and downloaded the app for guidance.

**Journey:**

1. **Opens app** → Sees suite selector
2. **Selects "Baby Care Companion"** → 6 tabs appear
3. **Sees sample feeding times** → "Oh, these are examples! Got it."
4. **Starts using voice agent** → "Log a feeding at 2pm, 4oz bottle"
5. **Agent updates Feeding Log tab** → Sample data still there, plus her real entry
6. **Confusion:** "Should I delete the sample rows? Are these from the previous babysitter?"
7. **Uses app for 2 weeks** → Has 30 feeding entries, still sees sample rows at top
8. **Mild annoyance** → Wishes there was a "clear samples" button

**Pain Points:**
- ⚠️ Sample data not obviously samples
- ⚠️ No guidance on when to delete samples
- ⚠️ Manual cleanup required per tab

### 2.2 Persona: Power User (David)

**Context:** David manages multiple clients (he's a professional caregiver). Uses multiple projects.

**Journey:**

1. **Creates first project** "Baby Alice" → Gets templates ✅
2. **Populates with real data over 2 months** → 200+ entries
3. **Gets new client** → Cmd+P → "Create New Project" → "Baby Ben"
4. **New project is empty** → "Wait, where are the templates?"
5. **Confusion:** "Do I copy tabs from Alice? Start from scratch?"
6. **Creates tabs manually** → Wastes 10 minutes
7. **Frustration:** "Why did my first project get templates but not this one?"

**Pain Points:**
- ❌ Inconsistent template initialization
- ❌ No "copy structure from project" option
- ❌ Workflow friction for multi-project users

### 2.3 Persona: Suite Switcher (Sarah)

**Context:** Sarah tries different suites to see which fits best.

**Journey:**

1. **Selects "Baby Care" suite** → 6 tabs appear
2. **Uses for a week** → Has real data
3. **Curious about IFS Therapy suite** → Clicks suite indicator
4. **Switches to "IFS Therapy"** → 12 new tabs appear
5. **Now has 18 tabs** (6 baby care + 12 IFS)
6. **Overwhelmed:** "This is a mess. I wanted to switch, not add."
7. **Manually deletes old tabs** → Takes 5 minutes

**Pain Points:**
- ❌ Suite switching adds tabs instead of replacing
- ❌ No "start fresh" option
- ❌ Tab pollution

---

## 3. Core UX Problems

### Problem 1: Template Initialization Timing
**Issue:** Templates are added at suite selection, not project creation.

**Why it's wrong:**
- Projects are the persistent unit (stored in DB)
- Suites are the agent team (transient selection)
- Templates should initialize with projects, not suites

**User expectation:**
> "Each new project should start with a fresh scaffold"

**Current behavior:**
> "Only the first suite selection gets templates, then never again"

**Fix Priority:** 🔴 CRITICAL

---

### Problem 2: Scaffold vs. User Content Ambiguity
**Issue:** No way to distinguish template tabs from user-created tabs.

**Why it matters:**
- Can't auto-cleanup sample data
- Can't show "dismiss templates" button
- Can't detect if user has edited templates
- Can't provide smart defaults

**User expectation:**
> "I should be able to clear sample data with one click"

**Current behavior:**
> "Manual deletion required, no way to know what's a sample"

**Fix Priority:** 🔴 CRITICAL

---

### Problem 3: Suite Switching Adds Instead of Replaces
**Issue:** Switching suites appends new templates to existing tabs.

**Why it's wrong:**
- User intent is "use different agent team", not "add more tabs"
- Creates clutter (18 tabs from 2 suites)
- No clear way to "start over"

**User expectation:**
> "Switching suites should replace the workspace"

**Current behavior:**
> "New tabs added on top, creating pollution"

**Fix Priority:** 🟡 HIGH

---

### Problem 4: No Template Lifecycle Management
**Issue:** Templates live forever, no concept of "done with scaffold".

**Why it matters:**
- User has no agency over cleanup
- Database stores sample data indefinitely
- No celebration of "graduation" from templates

**User expectation:**
> "Once I understand the system, let me dismiss the training wheels"

**Current behavior:**
> "Templates stay forever unless manually deleted"

**Fix Priority:** 🟡 MEDIUM

---

### Problem 5: Educational Gap
**Issue:** No indication that templates are scaffolds.

**Visual comparison:**

```
❌ Current:
┌─────────────────────────────────────┐
│ Feeding Log                      [x]│
│────────────────────────────────────│
│ Time | Type | Amount | Notes       │
│ 06:30 AM | Bottle | 4oz | Finished│
│ 09:45 AM | Bottle | 3oz | Left 1oz│
└─────────────────────────────────────┘
^ No indication these are examples

✅ Better:
┌─────────────────────────────────────┐
│ Feeding Log (Example) 💡        [x]│
│────────────────────────────────────│
│ 🎓 SAMPLE DATA - Replace with real │
│────────────────────────────────────│
│ Time | Type | Amount | Notes       │
│ 06:30 AM | Bottle | 4oz | Finished│
└─────────────────────────────────────┘
```

**Fix Priority:** 🟢 MEDIUM

---

## 4. Product Design Principles

### Principle 1: Templates Are Scaffolding, Not Defaults
**What it means:**
- Templates exist to teach, not to be used as-is
- They should feel temporary and dismissible
- User should feel empowered to "graduate" from them

**Design implications:**
- Visual distinction (icon, color, label)
- Easy cleanup mechanism
- Celebration when templates are removed

---

### Principle 2: Projects Should Be Self-Contained
**What it means:**
- Each project is a fresh start
- New projects should get templates automatically
- Projects remember their template state

**Design implications:**
- Templates initialize on project creation, not suite selection
- Project stores `has_accepted_templates` flag
- Switching projects doesn't re-trigger templates

---

### Principle 3: Suite Switching Is Suite Replacement
**What it means:**
- User switches suites to use different agents
- Old suite's templates should be cleared
- New suite's templates should be added

**Design implications:**
- Confirm before switching: "This will replace your workspace"
- Archive old tabs or create new project
- Clear suite context

---

### Principle 4: Progressive Disclosure
**What it means:**
- Don't overwhelm new users with options
- Show cleanup options when user is ready
- Let power users go faster

**Design implications:**
- Auto-show templates for new projects
- Add "Dismiss templates" button after 1 week or 10 edits
- Power user setting: "Skip templates" checkbox

---

### Principle 5: Undo Everything
**What it means:**
- User should never lose data
- Cleanup should be reversible
- Archive, don't delete

**Design implications:**
- "Restore templates" option if dismissed
- Archive templates instead of deleting
- Show what will be removed before confirming

---

## 5. Solution Options (Evaluated)

### Option A: Add Templates on Project Creation
**Approach:** Initialize templates when creating a new project, not when selecting suite.

**Implementation:**
```typescript
// In ProjectSwitcher.tsx handleCreateProject()
const handleCreateProject = async () => {
  const name = newProjectName.trim();
  if (name) {
    const suiteId = localStorage.getItem('selectedSuiteId') || 'energy-focus';
    
    // Get suite templates
    const suite = findSuiteById(suiteId);
    const templates = suite?.workspaceTemplates || [];
    
    // Convert templates to tabs
    const tabs = templates.map(t => ({
      id: nanoid(),
      name: t.name,
      type: t.type,
      content: t.content,
    }));
    
    // Create project with templates
    await createProject(name, suiteId, tabs);
    onClose();
  }
};
```

**Pros:**
- ✅ Consistent experience (all new projects get templates)
- ✅ Simple to implement
- ✅ No API changes needed

**Cons:**
- ❌ Doesn't solve "template vs. user content" problem
- ❌ Doesn't solve suite switching pollution
- ❌ Doesn't provide cleanup mechanism

**Grade:** C+ (solves 1 of 5 problems)

---

### Option B: Track Template Origin with Metadata
**Approach:** Add `is_template` flag and `template_id` to tabs.

**Data Model:**
```sql
ALTER TABLE workspace_tabs 
ADD COLUMN is_template BOOLEAN DEFAULT false,
ADD COLUMN template_id TEXT,  -- e.g., 'baby-care:feeding-log'
ADD COLUMN is_dismissed BOOLEAN DEFAULT false;
```

**UI Changes:**
```typescript
// Tab with template indicator
<div className="tab">
  {tab.is_template && !tab.is_dismissed && (
    <span className="template-badge">📋 Example</span>
  )}
  <span>{tab.name}</span>
  {tab.is_template && canDismiss && (
    <button onClick={() => dismissTemplate(tab.id)}>
      Dismiss
    </button>
  )}
</div>
```

**Pros:**
- ✅ Can distinguish templates from user content
- ✅ Enables smart cleanup
- ✅ Can show "Clear all samples" button
- ✅ Can detect if template was edited
- ✅ Reversible (archive, don't delete)

**Cons:**
- ❌ Requires database migration
- ❌ More complex implementation
- ❌ Need to handle existing tabs (backfill)

**Grade:** B+ (solves 3 of 5 problems)

---

### Option C: Template Lifecycle State Machine
**Approach:** Track template state per project (untouched → edited → dismissed → restored).

**State Machine:**
```
┌──────────┐
│ UNTOUCHED│ ← Templates just added
└──────────┘
     │ User edits content
     ↓
┌──────────┐
│  EDITED  │ ← User has customized
└──────────┘
     │ User clicks "Clear samples"
     ↓
┌──────────┐
│ DISMISSED│ ← Templates hidden
└──────────┘
     │ User clicks "Restore"
     ↓
┌──────────┐
│ RESTORED │ ← Templates back
└──────────┘
```

**Implementation:**
```typescript
interface TabMetadata {
  is_template: boolean;
  template_id: string;
  template_state: 'untouched' | 'edited' | 'dismissed' | 'restored';
  original_content: string; // For diff view
  edited_at?: string;
  dismissed_at?: string;
}
```

**Pros:**
- ✅ Full template lifecycle control
- ✅ Can show diff (original vs. edited)
- ✅ Can provide smart suggestions
- ✅ Reversible and auditable
- ✅ Enables "graduation" celebration

**Cons:**
- ❌ High complexity
- ❌ Needs careful UX design
- ❌ More database fields
- ❌ Migration for existing data

**Grade:** A- (solves 4 of 5 problems, but complex)

---

### Option D: Smart Template Detection (AI-Powered)
**Approach:** Use heuristics to detect if templates are still scaffolds or have become real data.

**Detection Logic:**
```typescript
function isStillTemplate(tab: WorkspaceTab): boolean {
  const { content, created_at, updated_at } = tab;
  
  // If never edited, it's still a template
  if (created_at === updated_at) return true;
  
  // If contains "SAMPLE DATA" marker
  if (content.includes('SAMPLE DATA')) return true;
  
  // If has original template content (>80% match)
  const similarity = calculateSimilarity(content, originalTemplate);
  if (similarity > 0.8) return true;
  
  // If edited but still has sample dates/times
  if (containsSampleData(content)) return true;
  
  return false;
}
```

**Pros:**
- ✅ No explicit user action needed
- ✅ Works with existing tabs (no migration)
- ✅ Feels magical to power users
- ✅ Can auto-suggest cleanup

**Cons:**
- ❌ Heuristics can be wrong
- ❌ False positives (delete real data)
- ❌ Unpredictable behavior
- ❌ Hard to test edge cases

**Grade:** B- (clever but risky)

---

### Option E: Onboarding Wizard with Template Opt-Out
**Approach:** Show wizard on first project, let user choose if they want templates.

**Wizard Flow:**
```
┌─────────────────────────────────────────────────────┐
│ Welcome to Baby Care Companion! 👶                  │
│                                                     │
│ Would you like starter templates to help you learn?│
│                                                     │
│ ┌─────────────────────┐  ┌─────────────────────┐  │
│ │ Yes, show examples  │  │ No, start blank     │  │
│ └─────────────────────┘  └─────────────────────┘  │
│                                                     │
│ [✓] Don't ask again for new projects              │
└─────────────────────────────────────────────────────┘
```

**Pros:**
- ✅ User has agency
- ✅ Respects power user preferences
- ✅ Clear intent capture
- ✅ Reduces clutter for experienced users

**Cons:**
- ❌ Adds friction to onboarding
- ❌ Most users will choose "Yes" anyway
- ❌ Doesn't solve lifecycle problem
- ❌ Extra modal to maintain

**Grade:** C (solves wrong problem)

---

## 6. Recommended Solution: Hybrid Intelligence

**Approach:** Combine the best parts of Options B, C, and D.

### 6.1 Architecture Overview

**Core Components:**

1. **Template Metadata Tracking** (from Option B)
   - Add `is_template`, `template_id`, `original_content` to tabs
   - Track creation and edit timestamps
   - Store template state

2. **Smart State Detection** (from Option D)
   - Auto-detect when templates have been meaningfully edited
   - Offer cleanup when appropriate
   - Suggest dismissal after threshold

3. **Explicit Lifecycle Controls** (from Option C)
   - "Dismiss all templates" button
   - "Restore templates" option
   - Per-tab dismiss action

### 6.2 User Experience Flow

**Scenario 1: First-Time User Creates Project**

```
Step 1: User creates project "Baby Emma"
  ↓
Step 2: System initializes with templates
  - Adds 6 tabs with is_template=true
  - Shows badge: "📋 Example data - edit or clear anytime"
  ↓
Step 3: User sees templates
  - Banner at top: "These are sample templates to help you learn.
    Replace them with your own data or dismiss them when ready."
  - [Dismiss All Templates] button visible
  ↓
Step 4: User edits first tab (Feeding Log)
  - Adds real feeding entry
  - System detects edit, sets template_state='edited'
  - Badge changes: "📋 Example (edited)"
  ↓
Step 5: After 1 week or 20 edits across tabs
  - System detects significant usage
  - Shows prompt: "Looks like you're getting the hang of it! 
    Want to clear sample data from templates?"
  - [Keep Samples] [Clear Samples] buttons
  ↓
Step 6: User clicks "Clear Samples"
  - System removes original template content from all untouched tabs
  - Keeps user-edited content
  - Shows toast: "✨ Sample data cleared! Your workspace is now yours."
  - Celebration micro-animation
```

**Scenario 2: Power User Creates Second Project**

```
Step 1: User (has 1 existing project) creates "Baby Ben"
  ↓
Step 2: System detects returning user
  - Checks: user has edited templates in previous project
  - Assumes user knows the system
  ↓
Step 3: Quick template prompt
  - "Start with templates?" [Yes] [No] [Don't ask again]
  - Default: Yes (one click to proceed)
  ↓
Step 4: If user checks "Don't ask again"
  - Saves preference: user.preferences.skip_templates = true
  - Future projects start blank (can manually add via "Add Template Tabs")
```

**Scenario 3: Suite Switching**

```
Step 1: User clicks suite indicator
  ↓
Step 2: Shows suite selector
  ↓
Step 3: User picks different suite
  ↓
Step 4: Confirmation modal
  ┌──────────────────────────────────────────────┐
  │ Switch to "IFS Therapy Suite"?               │
  │                                              │
  │ Your current workspace has 6 tabs.          │
  │                                              │
  │ What would you like to do?                  │
  │                                              │
  │ ○ Replace workspace (archive current tabs)  │
  │ ○ Keep current tabs + add new templates     │
  │ ○ Start completely blank                    │
  │                                              │
  │ [Cancel] [Continue]                         │
  └──────────────────────────────────────────────┘
  ↓
Step 5: Based on choice
  - Replace: Archive old tabs, add new templates
  - Keep: Add new templates (tag as separate suite)
  - Blank: Archive old tabs, start empty
```

### 6.3 Database Schema Changes

```sql
-- Add template tracking columns
ALTER TABLE workspace_tabs
ADD COLUMN is_template BOOLEAN DEFAULT false,
ADD COLUMN template_id TEXT,  -- e.g., 'baby-care:feeding-log'
ADD COLUMN template_state TEXT DEFAULT 'untouched',  -- 'untouched' | 'edited' | 'dismissed' | 'restored'
ADD COLUMN original_content TEXT,  -- Store original for diff
ADD COLUMN dismissed_at TIMESTAMP,
ADD COLUMN restored_at TIMESTAMP;

-- Add user preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  skip_templates BOOLEAN DEFAULT false,
  template_prompt_count INTEGER DEFAULT 0,
  last_template_cleanup_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add template usage analytics
CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  suite_id TEXT NOT NULL,
  action TEXT NOT NULL,  -- 'created' | 'edited' | 'dismissed' | 'restored'
  template_ids TEXT[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6.4 UI Components

**Component 1: Template Badge**

```tsx
// components/TemplateBadge.tsx
interface TemplateBadgeProps {
  state: 'untouched' | 'edited' | 'dismissed';
  onDismiss?: () => void;
}

export function TemplateBadge({ state, onDismiss }: TemplateBadgeProps) {
  if (state === 'dismissed') return null;
  
  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-accent-primary/10 border border-accent-primary/30 text-xs">
      <span>📋</span>
      <span>
        {state === 'untouched' ? 'Example' : 'Example (edited)'}
      </span>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="hover:text-status-error"
          title="Dismiss this template"
        >
          ×
        </button>
      )}
    </div>
  );
}
```

**Component 2: Template Banner**

```tsx
// components/TemplateBanner.tsx
export function TemplateBanner({ onDismissAll }: { onDismissAll: () => void }) {
  const [isDismissed, setIsDismissed] = useState(false);
  
  if (isDismissed) return null;
  
  return (
    <div className="bg-bg-tertiary border-l-4 border-accent-primary p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div className="flex-1">
          <h4 className="font-mono text-text-primary mb-1">
            These are sample templates
          </h4>
          <p className="text-sm text-text-secondary font-mono">
            Replace them with your own data, or clear them once you're comfortable.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDismissAll}
            className="px-3 py-1 border border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-bg-primary text-xs uppercase font-mono"
          >
            Clear All Samples
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-text-tertiary hover:text-text-primary"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Component 3: Template Cleanup Prompt**

```tsx
// components/TemplateCleanupPrompt.tsx
export function TemplateCleanupPrompt({ 
  onClear, 
  onKeep, 
  templateCount 
}: Props) {
  return (
    <div className="fixed bottom-20 right-4 w-96 bg-bg-secondary border-2 border-accent-primary shadow-glow-cyan p-4 z-40">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">🎓</span>
        <div>
          <h4 className="font-mono text-text-primary mb-1">
            Ready to clear sample data?
          </h4>
          <p className="text-sm text-text-secondary font-mono">
            You've been using the app for a while. Want to remove example 
            data from {templateCount} template{templateCount > 1 ? 's' : ''}?
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onClear}
          className="flex-1 px-3 py-2 bg-accent-primary text-bg-primary hover:shadow-glow-cyan text-xs uppercase font-mono"
        >
          Clear Samples
        </button>
        <button
          onClick={onKeep}
          className="px-3 py-2 border border-border-primary text-text-secondary hover:border-text-secondary text-xs uppercase font-mono"
        >
          Keep
        </button>
      </div>
    </div>
  );
}
```

### 6.5 Smart Detection Logic

```typescript
// lib/templateDetection.ts

interface TemplateAnalysis {
  isStillScaffold: boolean;
  confidence: number;  // 0-1
  reasons: string[];
  recommendations: 'keep' | 'prompt_dismiss' | 'auto_suggest_clear';
}

export function analyzeTemplateUsage(
  tab: WorkspaceTab,
  projectAge: number,  // days
  totalEdits: number
): TemplateAnalysis {
  const reasons: string[] = [];
  let scaffoldScore = 0;  // 0 = user content, 1 = still scaffold
  
  // Factor 1: Never edited (strong signal)
  if (tab.created_at === tab.updated_at) {
    scaffoldScore += 0.4;
    reasons.push('Never edited');
  }
  
  // Factor 2: Contains sample markers
  if (tab.content.includes('SAMPLE DATA') || 
      tab.content.includes('🎓') ||
      tab.content.includes('Example:')) {
    scaffoldScore += 0.3;
    reasons.push('Contains sample markers');
  }
  
  // Factor 3: High similarity to original
  if (tab.original_content) {
    const similarity = calculateLevenshteinSimilarity(
      tab.content, 
      tab.original_content
    );
    scaffoldScore += similarity * 0.3;
    if (similarity > 0.8) {
      reasons.push(`${Math.round(similarity * 100)}% identical to template`);
    }
  }
  
  // Factor 4: Project age (time-based)
  if (projectAge > 7 && scaffoldScore > 0.5) {
    reasons.push('Project is >1 week old');
  }
  
  // Factor 5: Total edits across project
  if (totalEdits > 20 && scaffoldScore > 0.5) {
    reasons.push('User has made many edits to other tabs');
  }
  
  // Determine recommendation
  let recommendation: 'keep' | 'prompt_dismiss' | 'auto_suggest_clear';
  
  if (scaffoldScore > 0.7 && (projectAge > 7 || totalEdits > 20)) {
    recommendation = 'auto_suggest_clear';
  } else if (scaffoldScore > 0.5 && projectAge > 14) {
    recommendation = 'prompt_dismiss';
  } else {
    recommendation = 'keep';
  }
  
  return {
    isStillScaffold: scaffoldScore > 0.5,
    confidence: scaffoldScore,
    reasons,
    recommendations: recommendation,
  };
}

// Trigger logic in WorkspaceContext
export function shouldShowCleanupPrompt(
  project: Project,
  tabs: WorkspaceTab[]
): boolean {
  const projectAge = daysSince(project.created_at);
  const totalEdits = tabs.filter(t => t.created_at !== t.updated_at).length;
  const templateTabs = tabs.filter(t => t.is_template);
  
  // Don't prompt if no templates
  if (templateTabs.length === 0) return false;
  
  // Don't prompt too early
  if (projectAge < 3 && totalEdits < 10) return false;
  
  // Analyze templates
  const analyses = templateTabs.map(t => 
    analyzeTemplateUsage(t, projectAge, totalEdits)
  );
  
  // Show if >50% of templates are still scaffolds and user is active
  const scaffoldCount = analyses.filter(a => a.isStillScaffold).length;
  const shouldPrompt = scaffoldCount > templateTabs.length * 0.5;
  
  // Check if already prompted recently
  const lastPrompt = localStorage.getItem('lastTemplatePrompt');
  if (lastPrompt && daysSince(lastPrompt) < 7) return false;
  
  return shouldPrompt;
}
```

### 6.6 Implementation Priority

**Phase 1: Foundation (Week 1) - CRITICAL**
- [ ] Add database columns (`is_template`, `template_id`, `original_content`)
- [ ] Migration script for existing tabs
- [ ] Update `initializeWorkspaceWithTemplates()` to set metadata
- [ ] Update project creation to initialize templates
- [ ] Add template badge to tab headers

**Phase 2: Cleanup UI (Week 2) - HIGH**
- [ ] Add TemplateBanner component
- [ ] Add "Dismiss All Templates" button
- [ ] Add per-tab dismiss action
- [ ] Add confirmation modal
- [ ] Add undo mechanism (restore dismissed templates)

**Phase 3: Smart Detection (Week 3) - MEDIUM**
- [ ] Implement template analysis logic
- [ ] Add cleanup prompt component
- [ ] Add trigger logic (after 1 week or 20 edits)
- [ ] Add analytics tracking
- [ ] Add user preference storage

**Phase 4: Suite Switching (Week 4) - MEDIUM**
- [ ] Add suite switch confirmation modal
- [ ] Add "Replace vs. Keep" options
- [ ] Implement tab archival
- [ ] Add "Restore archived tabs" feature
- [ ] Test edge cases

---

## 7. Implementation Roadmap

### Week 1: Database & Core Logic

**Day 1-2: Schema Changes**
```sql
-- Run migration
-- File: supabase/migrations/003_template_tracking.sql

BEGIN;

-- Add template columns to workspace_tabs
ALTER TABLE workspace_tabs
ADD COLUMN is_template BOOLEAN DEFAULT false,
ADD COLUMN template_id TEXT,
ADD COLUMN template_state TEXT DEFAULT 'untouched',
ADD COLUMN original_content TEXT,
ADD COLUMN dismissed_at TIMESTAMP,
ADD COLUMN restored_at TIMESTAMP;

-- Create indexes
CREATE INDEX idx_workspace_tabs_template ON workspace_tabs(is_template);
CREATE INDEX idx_workspace_tabs_template_state ON workspace_tabs(template_state);

-- Backfill existing tabs (mark as non-templates)
UPDATE workspace_tabs SET is_template = false WHERE is_template IS NULL;

-- Create user preferences table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  skip_templates BOOLEAN DEFAULT false,
  template_prompt_count INTEGER DEFAULT 0,
  last_template_cleanup_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create template usage analytics
CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  suite_id TEXT NOT NULL,
  action TEXT NOT NULL,
  template_ids TEXT[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

COMMIT;
```

**Day 3-4: Update Data Models**

```typescript
// types.ts - Add template metadata
export interface WorkspaceTab {
  id: string;
  name: string;
  type: "markdown" | "csv";
  content: string;
  
  // NEW: Template tracking
  is_template: boolean;
  template_id?: string;  // e.g., 'baby-care:feeding-log'
  template_state?: 'untouched' | 'edited' | 'dismissed' | 'restored';
  original_content?: string;
  dismissed_at?: string;
  restored_at?: string;
}

// Update API types
interface CreateTabRequest {
  name: string;
  type: 'markdown' | 'csv';
  content: string;
  is_template?: boolean;
  template_id?: string;
  original_content?: string;
}
```

**Day 5: Update Template Initialization**

```typescript
// lib/workspaceInitializer.ts - Enhanced version

export async function initializeWorkspaceWithTemplates(
  templates: WorkspaceTemplate[],
  suiteId: string
): Promise<void> {
  console.log(`📝 Initializing workspace with ${templates.length} templates`);
  
  const { addTab } = useWorkspaceContext.getState();
  
  for (const template of templates) {
    const templateId = `${suiteId}:${slugify(template.name)}`;
    
    await addTab({
      name: template.name,
      type: template.type,
      content: template.content,
      // NEW: Mark as template
      is_template: true,
      template_id: templateId,
      original_content: template.content,  // Store for comparison
    });
    
    console.log(`  ✓ Created template tab: ${template.name}`);
  }
  
  // Track analytics
  await trackTemplateUsage('created', suiteId, templates.map(t => t.name));
  
  console.log('✅ Workspace initialized with templates');
}
```

---

### Week 2: UI Components & Cleanup

**Day 1-2: Template Badges**

```typescript
// components/TemplateBadge.tsx
interface TemplateBadgeProps {
  tab: WorkspaceTab;
  onDismiss?: () => void;
  compact?: boolean;
}

export function TemplateBadge({ tab, onDismiss, compact }: TemplateBadgeProps) {
  if (!tab.is_template || tab.template_state === 'dismissed') return null;
  
  const isEdited = tab.template_state === 'edited';
  const isRestored = tab.template_state === 'restored';
  
  return (
    <div className={`
      flex items-center gap-1 px-2 py-0.5 rounded
      bg-accent-primary/10 border border-accent-primary/30
      text-xs font-mono
      ${compact ? 'text-xs' : 'text-sm'}
    `}>
      <span>📋</span>
      {!compact && (
        <span className="text-text-secondary">
          {isRestored ? 'Restored' : isEdited ? 'Example (edited)' : 'Example'}
        </span>
      )}
      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="ml-1 hover:text-status-error transition-colors"
          title="Dismiss this template"
        >
          ×
        </button>
      )}
    </div>
  );
}
```

**Day 3: Template Banner**

```typescript
// components/workspace/TemplateBanner.tsx
interface TemplateBannerProps {
  templateCount: number;
  onDismissAll: () => void;
}

export function TemplateBanner({ templateCount, onDismissAll }: TemplateBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  
  // Check if user has dismissed banner before
  useEffect(() => {
    const dismissed = localStorage.getItem('templateBannerDismissed');
    if (dismissed === 'true') setIsVisible(false);
  }, []);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('templateBannerDismissed', 'true');
    }, 300);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className={`
      bg-bg-tertiary border-l-4 border-accent-primary p-4 mb-4
      transition-all duration-300
      ${isClosing ? 'opacity-0 transform translate-y-2' : 'opacity-100'}
    `}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div className="flex-1">
          <h4 className="font-mono text-text-primary font-semibold mb-1">
            {templateCount} sample {templateCount === 1 ? 'template' : 'templates'} loaded
          </h4>
          <p className="text-sm text-text-secondary font-mono leading-relaxed">
            These are example templates to help you learn the system. 
            Edit them with your real data, or clear them once you're comfortable.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDismissAll}
            className="
              px-3 py-1 
              border border-accent-primary 
              text-accent-primary 
              hover:bg-accent-primary hover:text-bg-primary 
              text-xs uppercase font-mono
              transition-all
            "
          >
            Clear All Samples
          </button>
          <button
            onClick={handleClose}
            className="text-text-tertiary hover:text-text-primary text-xl"
            title="Hide this message"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Day 4-5: Dismiss Functionality**

```typescript
// lib/templateManager.ts

interface DismissOptions {
  clearContent: boolean;  // Remove content or just hide badge
  archiveTabs: boolean;   // Move to archive or soft-delete
}

export async function dismissAllTemplates(
  projectId: string,
  options: DismissOptions = { clearContent: true, archiveTabs: false }
): Promise<void> {
  const { tabs, setTabs } = useWorkspaceContext.getState();
  const { updateProjectTabs } = useProjectContext();
  
  const templateTabs = tabs.filter(t => t.is_template && t.template_state !== 'dismissed');
  
  if (templateTabs.length === 0) {
    console.log('No templates to dismiss');
    return;
  }
  
  // Confirm action
  const confirmed = window.confirm(
    `This will dismiss ${templateTabs.length} template ${templateTabs.length === 1 ? 'tab' : 'tabs'}. ` +
    (options.clearContent ? 'Sample content will be cleared. ' : '') +
    `You can restore them later if needed. Continue?`
  );
  
  if (!confirmed) return;
  
  // Update tabs
  const updatedTabs = tabs.map(tab => {
    if (!tab.is_template || tab.template_state === 'dismissed') return tab;
    
    return {
      ...tab,
      template_state: 'dismissed',
      dismissed_at: new Date().toISOString(),
      // Optionally clear content
      content: options.clearContent ? '' : tab.content,
    };
  });
  
  // Save to state and database
  setTabs(updatedTabs);
  await updateProjectTabs(projectId, updatedTabs);
  
  // Track analytics
  await trackTemplateUsage('dismissed', projectId, templateTabs.map(t => t.template_id));
  
  // Show success toast
  showToast('✨ Sample data cleared! Your workspace is now yours.', 'success');
  
  console.log(`✅ Dismissed ${templateTabs.length} templates`);
}

export async function dismissSingleTemplate(
  projectId: string,
  tabId: string,
  options: DismissOptions
): Promise<void> {
  const { tabs, setTabs } = useWorkspaceContext.getState();
  
  const updatedTabs = tabs.map(tab => {
    if (tab.id !== tabId) return tab;
    
    return {
      ...tab,
      template_state: 'dismissed',
      dismissed_at: new Date().toISOString(),
      content: options.clearContent ? '' : tab.content,
    };
  });
  
  setTabs(updatedTabs);
  await updateProjectTabs(projectId, updatedTabs);
  
  showToast('Template dismissed', 'success');
}

export async function restoreTemplates(
  projectId: string,
  suiteId: string
): Promise<void> {
  const suite = findSuiteById(suiteId);
  if (!suite || !suite.workspaceTemplates) {
    console.error('Suite or templates not found');
    return;
  }
  
  const confirmed = window.confirm(
    `This will restore ${suite.workspaceTemplates.length} template tabs. Continue?`
  );
  
  if (!confirmed) return;
  
  // Re-initialize templates
  await initializeWorkspaceWithTemplates(suite.workspaceTemplates, suiteId);
  
  showToast('✅ Templates restored', 'success');
}
```

---

### Week 3: Smart Detection & Prompts

**Day 1-2: Detection Logic**

(Implementation already detailed in Section 6.5)

**Day 3-4: Cleanup Prompt Component**

```typescript
// components/TemplateCleanupPrompt.tsx

interface TemplateCleanupPromptProps {
  projectId: string;
  templateTabs: WorkspaceTab[];
  onDismiss: () => void;
}

export function TemplateCleanupPrompt({ 
  projectId, 
  templateTabs,
  onDismiss 
}: TemplateCleanupPromptProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleClear = async () => {
    setIsProcessing(true);
    
    try {
      await dismissAllTemplates(projectId, { 
        clearContent: true, 
        archiveTabs: false 
      });
      
      // Track that user accepted prompt
      localStorage.setItem('templateCleanupAccepted', 'true');
      localStorage.setItem('lastTemplateCleanup', new Date().toISOString());
      
      setIsVisible(false);
      onDismiss();
      
      // Celebrate! 🎉
      triggerConfetti();
      showToast('🎓 Workspace cleaned! You've graduated from templates.', 'success');
      
    } catch (error) {
      console.error('Failed to clear templates:', error);
      showToast('Failed to clear templates. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleKeep = () => {
    // Remember user chose to keep templates
    localStorage.setItem('templateCleanupDeclined', 'true');
    localStorage.setItem('lastTemplatePrompt', new Date().toISOString());
    setIsVisible(false);
    onDismiss();
  };
  
  const handleDismiss = () => {
    // Just close, ask again later
    localStorage.setItem('lastTemplatePrompt', new Date().toISOString());
    setIsVisible(false);
    onDismiss();
  };
  
  if (!isVisible) return null;
  
  const untouchedCount = templateTabs.filter(t => 
    t.template_state === 'untouched'
  ).length;
  
  return (
    <div className="
      fixed bottom-24 right-4 w-96 
      bg-bg-secondary border-2 border-accent-primary shadow-glow-cyan 
      p-4 z-40
      animate-slide-in-bottom
    ">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">🎓</span>
        <div className="flex-1">
          <h4 className="font-mono text-text-primary font-semibold mb-2">
            Ready to clear sample data?
          </h4>
          <p className="text-sm text-text-secondary font-mono leading-relaxed mb-2">
            You've been using the app for a while! 
            {untouchedCount > 0 && ` ${untouchedCount} template${untouchedCount > 1 ? 's' : ''} still have example data.`}
          </p>
          <p className="text-xs text-text-tertiary font-mono">
            This will remove sample content but keep your edits.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-text-tertiary hover:text-text-primary"
        >
          ×
        </button>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleClear}
          disabled={isProcessing}
          className="
            flex-1 px-3 py-2 
            bg-accent-primary text-bg-primary 
            hover:shadow-glow-cyan 
            disabled:opacity-50 disabled:cursor-not-allowed
            text-xs uppercase font-mono
            transition-all
          "
        >
          {isProcessing ? 'Clearing...' : 'Clear Samples'}
        </button>
        <button
          onClick={handleKeep}
          disabled={isProcessing}
          className="
            px-3 py-2 
            border border-border-primary 
            text-text-secondary 
            hover:border-text-secondary
            text-xs uppercase font-mono
          "
        >
          Keep
        </button>
      </div>
    </div>
  );
}
```

**Day 5: Trigger Logic Integration**

```typescript
// Integrate into WorkspaceContext or App.tsx

export function useTemplateCleanupPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { currentProjectId, getCurrentProject } = useProjectContext();
  const { tabs } = useWorkspaceContext();
  
  useEffect(() => {
    if (!currentProjectId) return;
    
    const project = getCurrentProject();
    if (!project) return;
    
    const templateTabs = tabs.filter(t => t.is_template);
    
    // Check if should show prompt
    const should = shouldShowCleanupPrompt(project, tabs);
    
    if (should) {
      // Delay showing prompt (don't show immediately on load)
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);  // Wait 5 seconds after page load
      
      return () => clearTimeout(timer);
    }
  }, [currentProjectId, tabs]);
  
  return {
    showPrompt,
    templateTabs: tabs.filter(t => t.is_template && t.template_state !== 'dismissed'),
    dismissPrompt: () => setShowPrompt(false),
  };
}

// Usage in App.tsx
function App() {
  // ... existing code ...
  
  const { showPrompt, templateTabs, dismissPrompt } = useTemplateCleanupPrompt();
  
  return (
    <div>
      {/* ... existing UI ... */}
      
      {showPrompt && templateTabs.length > 0 && (
        <TemplateCleanupPrompt
          projectId={currentProjectId!}
          templateTabs={templateTabs}
          onDismiss={dismissPrompt}
        />
      )}
    </div>
  );
}
```

---

### Week 4: Suite Switching & Polish

**Day 1-2: Suite Switch Modal**

```typescript
// components/SuiteSwitchConfirmation.tsx

interface SuiteSwitchConfirmationProps {
  currentSuite: AgentSuite;
  newSuite: AgentSuite;
  currentTabCount: number;
  onConfirm: (action: 'replace' | 'keep' | 'blank') => void;
  onCancel: () => void;
}

export function SuiteSwitchConfirmation({
  currentSuite,
  newSuite,
  currentTabCount,
  onConfirm,
  onCancel,
}: SuiteSwitchConfirmationProps) {
  const [selectedAction, setSelectedAction] = useState<'replace' | 'keep' | 'blank'>('replace');
  
  return (
    <div className="fixed inset-0 bg-bg-overlay z-50 flex items-center justify-center">
      <div className="w-full max-w-md bg-bg-secondary border-2 border-accent-primary shadow-glow-cyan p-6">
        <h2 className="text-text-primary font-mono text-lg uppercase tracking-widest mb-4">
          Switch to {newSuite.icon} {newSuite.name}?
        </h2>
        
        <div className="mb-4 p-3 bg-bg-tertiary border-l-4 border-accent-primary">
          <p className="text-sm text-text-secondary font-mono">
            Your current workspace has {currentTabCount} tab{currentTabCount !== 1 ? 's' : ''} 
            from {currentSuite.name}.
          </p>
        </div>
        
        <div className="space-y-2 mb-6">
          <label className={`
            flex items-start gap-3 p-3 border cursor-pointer
            ${selectedAction === 'replace' 
              ? 'border-accent-primary bg-accent-primary/10' 
              : 'border-border-primary hover:border-accent-primary/50'
            }
          `}>
            <input
              type="radio"
              name="switch-action"
              value="replace"
              checked={selectedAction === 'replace'}
              onChange={() => setSelectedAction('replace')}
              className="mt-1"
            />
            <div>
              <div className="text-text-primary font-mono text-sm font-semibold mb-1">
                Replace workspace
              </div>
              <div className="text-xs text-text-secondary font-mono">
                Archive current tabs and load {newSuite.name} templates. 
                You can restore archived tabs later.
              </div>
            </div>
          </label>
          
          <label className={`
            flex items-start gap-3 p-3 border cursor-pointer
            ${selectedAction === 'keep' 
              ? 'border-accent-primary bg-accent-primary/10' 
              : 'border-border-primary hover:border-accent-primary/50'
            }
          `}>
            <input
              type="radio"
              name="switch-action"
              value="keep"
              checked={selectedAction === 'keep'}
              onChange={() => setSelectedAction('keep')}
              className="mt-1"
            />
            <div>
              <div className="text-text-primary font-mono text-sm font-semibold mb-1">
                Keep current tabs + add new
              </div>
              <div className="text-xs text-text-secondary font-mono">
                Add {newSuite.workspaceTemplates?.length || 0} new templates 
                alongside your existing tabs.
              </div>
            </div>
          </label>
          
          <label className={`
            flex items-start gap-3 p-3 border cursor-pointer
            ${selectedAction === 'blank' 
              ? 'border-accent-primary bg-accent-primary/10' 
              : 'border-border-primary hover:border-accent-primary/50'
            }
          `}>
            <input
              type="radio"
              name="switch-action"
              value="blank"
              checked={selectedAction === 'blank'}
              onChange={() => setSelectedAction('blank')}
              className="mt-1"
            />
            <div>
              <div className="text-text-primary font-mono text-sm font-semibold mb-1">
                Start completely blank
              </div>
              <div className="text-xs text-text-secondary font-mono">
                Archive all current tabs and start with an empty workspace.
              </div>
            </div>
          </label>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(selectedAction)}
            className="
              flex-1 px-4 py-2 
              bg-accent-primary text-bg-primary 
              hover:shadow-glow-cyan 
              uppercase text-sm font-mono
            "
          >
            Continue
          </button>
          <button
            onClick={onCancel}
            className="
              px-4 py-2 
              border border-border-primary 
              text-text-secondary 
              hover:border-text-secondary
              uppercase text-sm font-mono
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Day 3: Tab Archival System**

```typescript
// lib/tabArchival.ts

interface ArchivedTab extends WorkspaceTab {
  archived_at: string;
  archived_from_suite: string;
  archive_reason: string;
}

export async function archiveCurrentTabs(
  projectId: string,
  reason: string = 'suite_switch'
): Promise<void> {
  const { tabs, setTabs } = useWorkspaceContext.getState();
  const { updateProject, getCurrentProject } = useProjectContext();
  
  if (tabs.length === 0) return;
  
  const project = getCurrentProject();
  if (!project) return;
  
  // Store archived tabs in project metadata
  const archivedTabs: ArchivedTab[] = tabs.map(tab => ({
    ...tab,
    archived_at: new Date().toISOString(),
    archived_from_suite: project.suiteId,
    archive_reason: reason,
  }));
  
  // Save to database (in project metadata or separate table)
  await updateProject(projectId, {
    archived_tabs: [
      ...(project.archived_tabs || []),
      ...archivedTabs,
    ],
  });
  
  // Clear current tabs
  setTabs([]);
  
  console.log(`📦 Archived ${tabs.length} tabs from project`);
}

export async function restoreArchivedTabs(
  projectId: string,
  archiveTimestamp: string
): Promise<void> {
  const { setTabs } = useWorkspaceContext.getState();
  const { getCurrentProject } = useProjectContext();
  
  const project = getCurrentProject();
  if (!project || !project.archived_tabs) return;
  
  // Find tabs from specific archive
  const tabsToRestore = project.archived_tabs.filter(
    t => t.archived_at === archiveTimestamp
  );
  
  if (tabsToRestore.length === 0) {
    showToast('No tabs found to restore', 'error');
    return;
  }
  
  // Remove archive metadata and restore
  const restoredTabs: WorkspaceTab[] = tabsToRestore.map(tab => {
    const { archived_at, archived_from_suite, archive_reason, ...originalTab } = tab;
    return originalTab;
  });
  
  setTabs(restoredTabs);
  
  showToast(`✅ Restored ${restoredTabs.length} tabs`, 'success');
}
```

**Day 4-5: Testing & Polish**

- Test all suite switching scenarios
- Test template dismissal and restoration
- Test project creation with/without templates
- Test smart detection triggers
- Add loading states
- Add error handling
- Add analytics tracking
- Performance testing

---

## 8. Edge Cases & Failure Modes

### 8.1 Edge Case: User Edits One Tab, Leaves Others

**Scenario:**
- User creates project with 6 template tabs
- Edits "Feeding Log" extensively
- Never touches other 5 tabs
- Smart detection suggests cleanup

**Expected Behavior:**
- Prompt shows: "Clear sample data from 5 untouched templates?"
- If user accepts:
  - Keep "Feeding Log" (edited)
  - Clear content from other 5 tabs
  - OR offer to delete untouched tabs entirely

**Implementation:**
```typescript
async function dismissAllTemplates(projectId: string, options) {
  const tabs = useWorkspaceContext.getState().tabs;
  const editedTabs = tabs.filter(t => t.is_template && t.template_state === 'edited');
  const untouchedTabs = tabs.filter(t => t.is_template && t.template_state === 'untouched');
  
  if (editedTabs.length > 0) {
    const message = `
      ${untouchedTabs.length} template${untouchedTabs.length > 1 ? 's' : ''} will be cleared.
      ${editedTabs.length} edited template${editedTabs.length > 1 ? 's' : ''} will be kept.
      Continue?
    `;
    if (!window.confirm(message)) return;
  }
  
  // Only clear untouched tabs
  const updatedTabs = tabs.map(tab => {
    if (tab.template_state !== 'untouched') return tab;
    return { ...tab, template_state: 'dismissed', content: '' };
  });
  
  setTabs(updatedTabs);
}
```

---

### 8.2 Edge Case: Rapid Suite Switching

**Scenario:**
- User switches suites 3 times in 5 minutes
- Each time selecting "Replace workspace"
- Creates 3 sets of archived tabs

**Expected Behavior:**
- Show warning: "You've switched suites multiple times. Archive is growing."
- Offer: "Clear old archives?" or "Create new project instead?"
- Limit archives to last 3 switches

**Implementation:**
```typescript
async function archiveCurrentTabs(projectId, reason) {
  const project = getCurrentProject();
  const archiveCount = project.archived_tabs?.length || 0;
  
  if (archiveCount > 20) {
    const confirmed = window.confirm(
      'You have many archived tabs. Continue archiving, or create a new project instead?'
    );
    if (!confirmed) return;
  }
  
  // Limit to 30 archives per project
  if (archiveCount > 30) {
    // Remove oldest archives
    project.archived_tabs = project.archived_tabs.slice(-30);
  }
  
  // Proceed with archive...
}
```

---

### 8.3 Edge Case: User Dismisses, Then Wants Templates Back

**Scenario:**
- User clicks "Clear All Samples"
- 5 minutes later: "Wait, I wanted to reference those examples!"
- No obvious way to restore

**Expected Behavior:**
- Show toast after dismissal: "Templates cleared. [Undo]"
- Toast persists for 30 seconds
- Add "Restore Templates" button in workspace header
- Keep `original_content` field so restoration is perfect

**Implementation:**
```typescript
async function dismissAllTemplates(projectId, options) {
  // ... dismissal logic ...
  
  // Show undo toast
  showUndoableToast(
    '✨ Sample data cleared!',
    async () => {
      // Undo action
      await restoreTemplates(projectId, suiteId);
    },
    30000  // 30 second undo window
  );
}

// Workspace header shows restore option
function WorkspaceHeader() {
  const hasDismissedTemplates = tabs.some(t => 
    t.is_template && t.template_state === 'dismissed'
  );
  
  return (
    <div className="workspace-header">
      {/* ... other controls ... */}
      {hasDismissedTemplates && (
        <button onClick={restoreTemplates}>
          Restore Templates
        </button>
      )}
    </div>
  );
}
```

---

### 8.4 Failure Mode: Database Migration Fails

**Risk:** Adding columns fails on some user accounts.

**Mitigation:**
- Rollback script ready
- Feature flag to disable template tracking
- Graceful degradation (treat all tabs as non-templates)
- Logging to track failures

```typescript
// Feature flag check
const TEMPLATE_TRACKING_ENABLED = process.env.NEXT_PUBLIC_TEMPLATE_TRACKING === 'true';

function initializeWorkspaceWithTemplates(templates, suiteId) {
  if (!TEMPLATE_TRACKING_ENABLED) {
    // Legacy behavior
    for (const template of templates) {
      await addTab({
        name: template.name,
        type: template.type,
        content: template.content,
      });
    }
    return;
  }
  
  // New behavior with template tracking
  // ...
}
```

---

### 8.5 Failure Mode: Smart Detection Suggests Clearing Real Data

**Risk:** User has real data but detection thinks it's still a template.

**Mitigation:**
- Conservative thresholds (only suggest if >80% similar)
- Always show preview of what will be cleared
- Confirmation modal with tab names listed
- "Undo" option for 24 hours

```typescript
function showClearConfirmation(tabsToC clear) {
  return (
    <div className="modal">
      <h3>Clear Sample Data?</h3>
      <p>The following tabs will have their content cleared:</p>
      <ul>
        {tabsToClear.map(tab => (
          <li key={tab.id}>
            <strong>{tab.name}</strong>
            <button onClick={() => previewTab(tab)}>
              Preview
            </button>
          </li>
        ))}
      </ul>
      <label>
        <input type="checkbox" required />
        I understand this will remove content from these tabs
      </label>
      <button onClick={proceed}>Clear</button>
      <button onClick={cancel}>Cancel</button>
    </div>
  );
}
```

---

## 9. Success Metrics

### 9.1 Product Metrics

**Primary KPIs:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Template adoption rate | >80% | % of new projects with templates loaded |
| Template completion rate | >60% | % of users who edit >50% of templates |
| Template dismissal rate | 30-50% | % of users who explicitly dismiss templates |
| Time to first edit | <2 min | Time from template load to first edit |
| Cleanup prompt acceptance | >40% | % who click "Clear Samples" when prompted |

**Secondary KPIs:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Suite switching clarity | >70% | % who choose correct replace/keep option |
| Template restoration rate | <5% | % who restore after dismissing (lower = clearer intent) |
| Template-related support tickets | <2% | % of tickets about template confusion |
| New project creation time | <30 sec | Average time to create project with templates |

### 9.2 User Satisfaction Metrics

**Survey Questions (NPS follow-up):**

1. "Template examples helped me understand the system" (1-5)
   - Target: >4.0 average

2. "I knew when to remove sample data" (1-5)
   - Target: >3.5 average

3. "Switching suites was intuitive" (1-5)
   - Target: >4.0 average

4. "I feel in control of my workspace" (1-5)
   - Target: >4.5 average

### 9.3 Technical Metrics

**Performance:**
- Template initialization time: <500ms for 10 tabs
- Cleanup operation time: <1s for 20 tabs
- Database query performance: <100ms for tab loads

**Reliability:**
- Zero data loss incidents
- <0.1% failed template operations
- 100% reversibility (all dismissals can be undone)

### 9.4 Analytics Tracking

```typescript
// Track key events
trackEvent('template_initialized', {
  suite_id: string,
  template_count: number,
  project_id: string,
});

trackEvent('template_edited', {
  template_id: string,
  project_id: string,
  time_since_creation: number,  // seconds
});

trackEvent('template_dismissed', {
  template_ids: string[],
  project_id: string,
  dismissal_type: 'manual' | 'prompted',
  project_age: number,  // days
});

trackEvent('template_restored', {
  template_ids: string[],
  time_since_dismissal: number,  // seconds
});

trackEvent('suite_switched', {
  from_suite: string,
  to_suite: string,
  action: 'replace' | 'keep' | 'blank',
  tab_count: number,
});
```

---

## 10. Alternative Approaches

### 10.1 Approach: Templates as Separate "Scratchpad" Project

**Concept:** Don't mix templates with user projects. Create a permanent "Examples" project.

**How it works:**
- Each suite has a read-only "Examples" project
- User's first project starts blank
- User can reference examples project anytime
- No cleanup needed (examples always available)

**Pros:**
- No pollution of user workspace
- Examples always accessible
- Simple mental model
- No dismissal UX needed

**Cons:**
- User has to switch between projects to reference
- Doesn't teach "in context"
- Loses scaffolding benefit
- More friction for beginners

**Verdict:** ❌ Rejected - Removes key onboarding value

---

### 10.2 Approach: Templates in Modal/Sidebar

**Concept:** Show templates in a side panel, user drags into workspace.

**How it works:**
- Sidebar shows "Template Library"
- User drags template cards into workspace
- Templates only added on explicit user action
- No auto-initialization

**Pros:**
- User has full control
- No unwanted tabs
- Clear distinction between library and workspace
- Power user friendly

**Cons:**
- Adds UI complexity
- Beginner doesn't know what to do
- Requires understanding of drag-and-drop
- Loses automatic scaffolding

**Verdict:** ⚠️ Maybe as advanced feature, not default

---

### 10.3 Approach: AI Agent Offers Templates

**Concept:** Voice agent asks "Want me to set up your workspace?"

**How it works:**
- User connects to suite
- Agent: "Hi! Would you like me to create some example tabs to get you started?"
- User says "Yes" → templates added
- User says "No" → starts blank

**Pros:**
- Voice-first (matches app paradigm)
- Feels personalized
- User gives explicit consent
- Natural conversation flow

**Cons:**
- Adds latency to first connection
- Requires speech recognition accuracy
- User might mishear or misunderstand
- Can't see what templates are before accepting

**Verdict:** 🤔 Interesting for V2, needs UX refinement

---

### 10.4 Approach: Progressive Template Loading

**Concept:** Start with 1-2 key templates, add more as user progresses.

**How it works:**
- Day 1: Load 2 core templates
- Day 3: Suggest adding 2 more
- Day 7: Suggest final templates
- Gradual progression reduces overwhelm

**Pros:**
- Doesn't overwhelm new users
- Progressive disclosure
- User learns incrementally
- Can skip later templates

**Cons:**
- Complex state management
- User might miss templates
- Inconsistent experience across users
- Hard to explain "why now?"

**Verdict:** ⚠️ Interesting but over-engineered

---

### 10.5 Approach: Templates as Git-Style Branches

**Concept:** User "forks" templates, can reset to original.

**How it works:**
- Templates are immutable originals
- User "forks" to create editable copy
- Can diff against original
- Can reset to original anytime

**Pros:**
- Git-familiar paradigm
- Always can revert to clean state
- Clear distinction: original vs. fork
- Diff view shows changes

**Cons:**
- Too technical for target users
- "Fork" terminology confusing
- Adds complexity
- Most users won't need this

**Verdict:** ❌ Rejected - Over-engineered for use case

---

## 11. Final Recommendations

### ✅ Implement: Hybrid Intelligence Solution (Section 6)

**Why it's best:**
1. **Solves all 5 core problems:**
   - ✅ Templates initialize with projects (consistency)
   - ✅ Tracks scaffold vs. user content (metadata)
   - ✅ Handles suite switching cleanly (modal)
   - ✅ Provides lifecycle management (dismiss/restore)
   - ✅ Educates users (banners, badges)

2. **Balances automation and control:**
   - Automatic for beginners (templates auto-load)
   - Smart for intermediate (prompts when ready)
   - Controllable for power users (explicit actions)

3. **Reversible and safe:**
   - Can restore dismissed templates
   - Can undo cleanup
   - No data loss risk

4. **Scales with user:**
   - Beginner: Sees helpful examples
   - Intermediate: Gets prompted to clean up
   - Advanced: Can skip or bulk-dismiss

### 🎯 Success Criteria for Launch

**Must Have (P0):**
- [ ] Templates initialize on project creation
- [ ] Template badge shows on tabs
- [ ] "Dismiss All Templates" button works
- [ ] Templates can be restored
- [ ] Suite switching shows confirmation modal

**Should Have (P1):**
- [ ] Template banner explains what they are
- [ ] Smart detection triggers cleanup prompt
- [ ] Per-tab dismiss action
- [ ] Analytics tracking

**Nice to Have (P2):**
- [ ] Diff view (original vs. edited)
- [ ] User preference: "Skip templates"
- [ ] Celebration animation on cleanup
- [ ] Template usage insights

### 📊 Expected Impact

**Before (Current State):**
- Template initialization: Inconsistent (only on suite selection)
- User confusion: High (why no templates on 2nd project?)
- Cleanup: Manual per-tab deletion
- Suite switching: Creates tab pollution
- Grade: **C+**

**After (Hybrid Solution):**
- Template initialization: Consistent (every new project)
- User confusion: Low (clear badges and education)
- Cleanup: One-click bulk action + smart prompts
- Suite switching: Guided modal with clear options
- Grade: **A**

### ⏱️ Implementation Timeline

- **Week 1:** Database + Core Logic (CRITICAL)
- **Week 2:** UI Components + Cleanup (HIGH)
- **Week 3:** Smart Detection (MEDIUM)
- **Week 4:** Suite Switching + Polish (MEDIUM)

**Total:** 4 weeks (~80-100 hours)

---

## 12. Open Questions for User/Stakeholder

1. **Template restoration timeframe:** Should dismissed templates be restorable forever, or expire after 30 days?
   - Recommendation: Forever (storage is cheap, user trust is pricey)

2. **Default behavior for project #2+:** Should we prompt "Start with templates?" or just auto-add?
   - Recommendation: Auto-add always, add "Don't ask again" checkbox after 3 projects

3. **Suite switching confirmation:** Always show modal, or only if tabs exist?
   - Recommendation: Always show if >0 tabs exist

4. **Cleanup prompt timing:** After 1 week OR 20 edits, which triggers first?
   - Recommendation: Whichever comes first (adaptive to user behavior)

5. **Analytics priority:** Track template usage for product insights?
   - Recommendation: Yes, but anonymized and aggregate only

---

## 13. Conclusion

The workspace template notes system currently suffers from **inconsistent initialization** and **lack of lifecycle management**. Users get templates on first suite selection, but not on subsequent project creation, leading to confusion. Templates pollute workspaces indefinitely with no clear cleanup path.

The **Hybrid Intelligence Solution** addresses these issues by:

1. **Making templates a project concern** (not suite concern)
2. **Tracking template metadata** to enable smart features
3. **Providing both automatic and manual controls**
4. **Educating users** about template purpose
5. **Allowing reversibility** for safety

This solution balances **beginner onboarding** (templates help learn), **intermediate user needs** (smart cleanup prompts), and **power user control** (explicit dismiss/restore actions).

**Implementation is feasible in 4 weeks** with clear success metrics and low technical risk.

**Recommendation:** Proceed with Phase 1 (Database + Core Logic) immediately.

---

**Document Version:** 1.0  
**Last Updated:** October 19, 2025  
**Next Review:** After Phase 1 completion


