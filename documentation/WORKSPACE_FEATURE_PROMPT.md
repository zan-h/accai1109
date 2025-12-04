# Multi-Project Workspace System - Implementation Prompt

## Context
- **Tech Stack**: Next.js 14+, TypeScript, Tailwind CSS, React
- **Design System**: Dark theme with cyan accents, monospace fonts (JetBrains Mono), terminal aesthetic
- **Current State**: Single workspace with tabs, already has `WorkspaceContext` managing tab state in localStorage

**Relevant Files:**
- `src/app/contexts/WorkspaceContext.tsx` - Current workspace state management
- `src/app/components/Workspace.tsx` - Main workspace component
- `src/app/components/workspace/Sidebar.tsx` - Tab sidebar
- `src/app/components/workspace/TabContent.tsx` - Tab content display
- `src/app/globals.css` - Global styles and CSS variables
- `tailwind.config.ts` - Tailwind configuration with custom colors

## Objective

Implement a multi-project workspace system with two key features:

### Feature 1: Command Palette Project Switcher
A keyboard-first project switcher with fuzzy search that allows users to quickly switch between projects without adding permanent UI chrome.

### Feature 2: Mission Brief Side Rail
A collapsible left-side panel for persistent notes (goals, values, schedules) that can be:
- Global (appear in all projects)
- Project-specific (only appear in selected projects)
- Minimized to save space (40px collapsed, 300px expanded)

---

## Detailed Specifications

### 1. PROJECT SWITCHER (Command Palette)

#### UI Behavior:
- **Trigger**: 
  - Keyboard: `Cmd/Ctrl + P` (or `Cmd/Ctrl + K`)
  - Click: Clicking project name in header (currently shows "WORKSPACE")
- **Appearance**: 
  - Full-screen overlay with dark semi-transparent backdrop (`bg-bg-overlay`)
  - Centered modal (600px wide max, responsive on mobile)
  - Terminal-style design matching existing aesthetic
- **Functionality**:
  - Fuzzy search filter (as user types, filter projects)
  - Display recent projects at top (last 3 accessed)
  - Show last modified timestamp in terminal format (`2024-10-09 14:32`)
  - `+ Create New Project` option at bottom
  - Arrow keys to navigate, Enter to select, Esc to close
  - Click outside to close

#### Visual Design:
```tsx
// Example structure
<div className="fixed inset-0 bg-bg-overlay z-50 flex items-start justify-center pt-[20vh]">
  <div className="w-full max-w-2xl bg-bg-secondary border-2 border-accent-primary shadow-glow-cyan">
    {/* Header */}
    <div className="border-b border-border-primary px-4 py-3">
      <div className="text-text-secondary text-xs uppercase tracking-widest">
        Switch Project
      </div>
    </div>
    
    {/* Search Input */}
    <input 
      type="text"
      placeholder="Type to search projects..."
      className="w-full px-4 py-3 bg-bg-primary border-b border-border-primary text-text-primary font-mono focus:outline-none"
    />
    
    {/* Project List */}
    <div className="max-h-96 overflow-y-auto">
      {/* Recent Section */}
      <div className="px-4 py-2 text-xs text-text-tertiary uppercase tracking-wide">
        Recent
      </div>
      {/* Project Items */}
      <div className="px-4 py-3 hover:bg-bg-tertiary border-l-2 border-transparent hover:border-accent-primary cursor-pointer">
        <div className="text-text-primary font-mono">Marketing Campaign</div>
        <div className="text-text-tertiary text-xs">Modified: 2024-10-09 14:32</div>
      </div>
      
      {/* All Projects Section */}
      <div className="px-4 py-2 text-xs text-text-tertiary uppercase tracking-wide border-t border-border-primary mt-2">
        All Projects
      </div>
      {/* More project items... */}
      
      {/* Create New */}
      <div className="px-4 py-3 border-t border-border-primary hover:bg-bg-tertiary cursor-pointer">
        <div className="text-accent-primary font-mono">+ Create New Project</div>
      </div>
    </div>
  </div>
</div>
```

#### Data Structure:
```typescript
interface Project {
  id: string;
  name: string;
  createdAt: number;
  modifiedAt: number;
  tabs: Tab[]; // Existing tab structure from WorkspaceContext
  activeBriefSectionIds: string[]; // IDs of brief sections active in this project
}

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  recentProjectIds: string[]; // Last 3 accessed
}
```

#### Implementation Steps:
1. Create `ProjectContext.tsx` to manage project state (localStorage: `'projectState'`)
2. Create `ProjectSwitcher.tsx` component with command palette UI
3. Add keyboard listener for Cmd/Ctrl+P in root layout
4. Modify `Workspace.tsx` header to show current project name (clickable)
5. Implement fuzzy search logic (simple includes or use library like `fuse.js`)
6. Add project creation dialog (simple prompt or inline form)
7. Migrate existing `workspaceState` to first default project on initial load

---

### 2. MISSION BRIEF SIDE RAIL

#### UI Behavior:
- **Position**: Fixed left side, inside the Workspace component (not global)
- **States**:
  - **Collapsed (default)**: 40px wide vertical strip with icon buttons
  - **Expanded**: 300px wide panel slides in from left
  - **Hidden**: Completely hidden (toggle in settings/header)
- **Trigger**:
  - Keyboard: `Cmd/Ctrl + B` (Brief)
  - Click: Click any icon in collapsed rail
  - Auto-collapse: After 5 seconds of no interaction (optional setting)
- **Functionality**:
  - Display brief sections as collapsible cards
  - Edit inline with markdown support (reuse existing markdown editor)
  - Add new sections with templates (Goals, Values, Schedule, Custom)
  - Drag to reorder sections
  - Toggle "Show in all projects" per section
  - Delete sections with confirmation

#### Visual Design - Collapsed State:
```tsx
<div className="w-10 bg-bg-secondary border-r border-border-primary flex flex-col items-center py-4 gap-4">
  {briefSections.map(section => (
    <button
      key={section.id}
      className="w-8 h-8 flex items-center justify-center text-accent-primary hover:bg-bg-tertiary hover:shadow-glow-cyan transition-all border border-transparent hover:border-accent-primary"
      title={section.title} // Tooltip shows preview
    >
      {section.icon || '📋'}
    </button>
  ))}
  
  {/* Add Section Button at bottom */}
  <button className="mt-auto w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-accent-primary">
    +
  </button>
</div>
```

#### Visual Design - Expanded State:
```tsx
<div className="w-80 bg-bg-secondary border-r border-border-primary flex flex-col">
  {/* Header */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
    <div className="text-text-primary uppercase tracking-widest font-mono text-sm">
      Mission Brief
    </div>
    <button className="text-text-tertiary hover:text-accent-primary">×</button>
  </div>
  
  {/* Sections */}
  <div className="flex-1 overflow-y-auto p-4 space-y-3">
    {briefSections.map(section => (
      <div key={section.id} className="border border-border-primary bg-bg-tertiary">
        {/* Section Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-primary">
          <div className="flex items-center gap-2">
            <span>{section.icon}</span>
            <span className="font-mono text-sm text-text-primary">{section.title}</span>
          </div>
          <div className="flex gap-2">
            <button className="text-text-tertiary hover:text-accent-primary text-xs">✎</button>
            <button className="text-text-tertiary hover:text-status-error text-xs">🗑</button>
          </div>
        </div>
        
        {/* Section Content */}
        <div className="p-3 text-sm text-text-primary markdown-body">
          {/* Render markdown content */}
          {section.content}
        </div>
        
        {/* Section Footer */}
        <div className="px-3 py-2 border-t border-border-primary flex items-center gap-2">
          <input
            type="checkbox"
            checked={section.isGlobal}
            className="w-3 h-3 bg-bg-primary border border-border-primary checked:bg-accent-primary"
          />
          <label className="text-xs text-text-tertiary">Show in all projects</label>
        </div>
      </div>
    ))}
  </div>
  
  {/* Add Section Button */}
  <div className="p-4 border-t border-border-primary">
    <button className="w-full py-2 border border-border-primary bg-bg-tertiary text-text-secondary hover:text-accent-primary hover:border-accent-primary transition-all uppercase text-xs tracking-wide">
      + Add Section
    </button>
  </div>
</div>
```

#### Data Structure:
```typescript
interface BriefSection {
  id: string;
  title: string;
  icon?: string; // Emoji or icon identifier
  content: string; // Markdown content
  isGlobal: boolean; // If true, appears in all projects
  order: number; // For drag-and-drop reordering
  createdAt: number;
  modifiedAt: number;
}

interface BriefState {
  sections: BriefSection[];
  isExpanded: boolean;
  autoCollapse: boolean;
}

// Templates for new sections
const BRIEF_TEMPLATES = {
  goals: {
    title: 'Goals',
    icon: '🎯',
    content: '# My Goals\n\n- Goal 1\n- Goal 2\n- Goal 3'
  },
  values: {
    title: 'Values',
    icon: '💡',
    content: '# Core Values\n\n- Value 1\n- Value 2\n- Value 3'
  },
  schedule: {
    title: 'Best Work Times',
    icon: '⏰',
    content: '# Optimal Schedule\n\n**Peak Hours:** 9am-12pm\n**Focus Time:** 2pm-5pm'
  },
  custom: {
    title: 'New Section',
    icon: '📝',
    content: '# Title\n\nContent here...'
  }
};
```

#### Implementation Steps:
1. Create `BriefContext.tsx` to manage brief sections (localStorage: `'briefState'`)
2. Create `MissionBriefRail.tsx` component (collapsed and expanded states)
3. Create `BriefSection.tsx` component (individual section card)
4. Create `AddBriefSection.tsx` modal/dialog (template selection)
5. Add keyboard listener for Cmd/Ctrl+B
6. Implement drag-and-drop reordering (use `react-beautiful-dnd` or simple native DnD)
7. Add auto-collapse timer logic (optional)
8. Integrate with ProjectContext to filter sections per project

---

## Integration Points

### WorkspaceContext Modifications:
- Move tab management to be project-specific
- Update localStorage key structure:
  - OLD: `'workspaceState'` (single workspace)
  - NEW: Within each project in `'projectState'`

### Workspace.tsx Layout:
```tsx
<div className="workspace-container">
  {/* Mission Brief Rail (left) */}
  <MissionBriefRail />
  
  {/* Current Workspace Content (center) */}
  <div className="flex-1">
    <WorkspaceHeader /> {/* Shows project name */}
    <div className="flex">
      <Sidebar /> {/* Existing tab sidebar */}
      <TabContent /> {/* Existing tab content */}
    </div>
  </div>
</div>
```

### Header Modifications (App.tsx):
```tsx
<div className="header-left">
  <Logo />
  <div 
    className="project-name cursor-pointer hover:text-accent-primary"
    onClick={openProjectSwitcher}
  >
    {currentProject.name}
  </div>
</div>
```

---

## Design Guidelines

### Color Palette (from tailwind.config.ts):
- Background: `bg-bg-primary` (#0a0a0a), `bg-bg-secondary` (#131313), `bg-bg-tertiary` (#1a1a1a)
- Text: `text-text-primary` (#e8e8e8), `text-text-secondary` (#8a8a8a), `text-text-tertiary` (#5a5a5a)
- Accent: `text-accent-primary` (#00d9ff), `border-accent-primary`
- Borders: `border-border-primary` (#2a2a2a)
- Glow: `shadow-glow-cyan` (0 0 10px rgba(0, 217, 255, 0.3))

### Typography:
- All text: `font-mono` (JetBrains Mono)
- Headers: `uppercase tracking-widest`
- Labels: `text-xs uppercase tracking-wide`
- Code/content: `text-sm`

### Animations:
- Use smooth transitions: `transition-all duration-200 ease-in-out`
- Slide animations for panel: `transform translate-x-[-100%]` → `translate-x-0`
- Glow on hover: `hover:shadow-glow-cyan`

### Accessibility:
- All interactive elements must have `focus:outline-none focus:border-accent-primary`
- Keyboard navigation throughout (arrow keys, Enter, Esc)
- ARIA labels for icon buttons
- Screen reader announcements for project switching

---

## Success Criteria

### Functional Requirements:
✅ User can press Cmd+P and see project switcher
✅ User can type to filter projects with fuzzy search
✅ User can create new projects with custom names
✅ User can switch projects and see different tab sets
✅ User can press Cmd+B to toggle mission brief rail
✅ User can add/edit/delete brief sections
✅ User can mark sections as global or project-specific
✅ User can reorder sections via drag-and-drop
✅ All state persists in localStorage across sessions
✅ Initial migration: existing workspace becomes default project

### UX Requirements:
✅ No page reloads when switching projects
✅ Smooth animations (<300ms) for panel transitions
✅ Auto-collapse works correctly (if enabled)
✅ Keyboard shortcuts work globally (not just in specific components)
✅ Visual feedback on all interactions (hover states, focus states)
✅ Empty states are helpful ("No projects yet. Press Cmd+P to create one.")
✅ Responsive design works on tablet/mobile (rail becomes bottom drawer on mobile)

### Performance:
✅ No noticeable lag with 50+ projects
✅ Fuzzy search results appear instantly (<100ms)
✅ localStorage operations are batched/debounced

---

## Testing Checklist

- [ ] Create first project from existing workspace
- [ ] Create 3+ new projects with different names
- [ ] Switch between projects via Cmd+P
- [ ] Switch projects by clicking header
- [ ] Verify tabs are project-specific
- [ ] Add brief section with each template type
- [ ] Edit brief section content inline
- [ ] Mark section as global, verify it appears in all projects
- [ ] Mark section as project-specific, verify isolation
- [ ] Reorder sections via drag-and-drop
- [ ] Delete section with confirmation
- [ ] Test auto-collapse timer (if implemented)
- [ ] Test keyboard navigation in project switcher
- [ ] Test Esc key to close modals
- [ ] Refresh page, verify all state persists
- [ ] Test with empty state (no projects)
- [ ] Test with long project names
- [ ] Test mobile responsive behavior

---

## Migration Strategy

### First Load (Existing Users):
```typescript
// On app initialization, check if migration needed
function migrateToProjectSystem() {
  const oldWorkspaceState = localStorage.getItem('workspaceState');
  const projectState = localStorage.getItem('projectState');
  
  if (oldWorkspaceState && !projectState) {
    // Migration needed
    const oldWorkspace = JSON.parse(oldWorkspaceState);
    const defaultProject: Project = {
      id: generateId(),
      name: 'Default Project',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      tabs: oldWorkspace.tabs,
      activeBriefSectionIds: []
    };
    
    const newProjectState: ProjectState = {
      projects: [defaultProject],
      currentProjectId: defaultProject.id,
      recentProjectIds: [defaultProject.id]
    };
    
    localStorage.setItem('projectState', JSON.stringify(newProjectState));
    console.log('✅ Migrated to project system');
  }
}
```

---

## File Structure

### New Files to Create:
```
src/app/contexts/
  - ProjectContext.tsx       # Project state management
  - BriefContext.tsx         # Brief sections management

src/app/components/
  - ProjectSwitcher.tsx      # Command palette modal
  - MissionBriefRail.tsx     # Side rail component (collapsed/expanded)
  - BriefSection.tsx         # Individual brief section card
  - AddBriefModal.tsx        # Template selection for new sections

src/app/lib/
  - projectUtils.ts          # Helper functions (fuzzy search, ID generation)
  - migrationUtils.ts        # Migration logic from old workspace
```

### Files to Modify:
```
src/app/contexts/
  - WorkspaceContext.tsx     # Integrate with ProjectContext

src/app/components/
  - Workspace.tsx            # Add MissionBriefRail, project name in header
  - App.tsx                  # Add project switcher trigger in header

src/app/layout.tsx           # Add global keyboard listeners (Cmd+P, Cmd+B)
```

---

## Implementation Order (Recommended)

### Phase 1: Project System (Days 1-2)
1. Create ProjectContext with basic CRUD
2. Create ProjectSwitcher UI component
3. Add keyboard shortcut (Cmd+P)
4. Implement fuzzy search
5. Add project creation flow
6. Integrate with existing WorkspaceContext
7. Implement migration logic
8. Test thoroughly

### Phase 2: Mission Brief Rail (Days 3-4)
1. Create BriefContext with basic CRUD
2. Create collapsed rail UI
3. Create expanded panel UI
4. Add keyboard shortcut (Cmd+B)
5. Implement section templates
6. Add edit/delete functionality
7. Implement drag-and-drop reordering
8. Integrate global/project-specific logic
9. Test thoroughly

### Phase 3: Polish & Edge Cases (Day 5)
1. Add empty states
2. Add loading states
3. Implement auto-collapse (optional)
4. Mobile responsive adjustments
5. Performance optimizations
6. Accessibility audit
7. User testing & feedback

---

## Additional Notes

### Keyboard Shortcuts Summary:
- `Cmd/Ctrl + P`: Open project switcher
- `Cmd/Ctrl + B`: Toggle mission brief rail
- `Arrow Up/Down`: Navigate project list
- `Enter`: Select project or action
- `Esc`: Close modals/panels

### Future Enhancements (Out of Scope):
- Project templates (e.g., "Marketing Campaign" template)
- Project tags/categories
- Project archive/restore
- Export/import projects as JSON
- Collaborative projects (multi-user)
- Brief section version history
- Brief section sharing/templates marketplace

### Performance Considerations:
- Use `React.memo()` for expensive components
- Debounce search input (300ms)
- Virtualize project list if >100 projects
- Lazy load brief section content
- Batch localStorage writes

---

## Example User Flow

```
1. User opens app
   → Last project loads automatically
   → Mission brief rail is collapsed (40px)

2. User wants to switch projects
   → Presses Cmd+P
   → Project switcher appears with fuzzy search
   → Types "mark"
   → "Marketing Campaign" filters to top
   → Presses Enter
   → Switches to Marketing Campaign project instantly
   → Brief rail shows project-specific + global sections

3. User wants to check goals
   → Clicks 🎯 icon in collapsed rail
   → Rail expands to 300px showing Goals section
   → Reads goals, clicks × to close
   → Rail collapses after 5 seconds (if auto-collapse enabled)

4. User wants to add new brief section
   → Presses Cmd+B to expand rail
   → Clicks "+ Add Section"
   → Modal shows templates: Goals, Values, Schedule, Custom
   → Selects "Values"
   → Section appears with default content
   → Clicks ✎ to edit inline
   → Marks "Show in all projects" ✓
   → Now appears in all projects

5. User creates new project
   → Presses Cmd+P
   → Clicks "+ Create New Project"
   → Types "Q4 Planning"
   → Presses Enter
   → New empty project created and switched to
   → Global brief sections appear automatically
   → User adds first tab
```

---

## Questions to Consider

1. **Project deletion**: Should there be a way to delete projects? (Not in V1, but add to header context menu later)
2. **Project duplication**: Copy tabs from one project to another? (Future enhancement)
3. **Brief section icons**: Emoji only or support for icon libraries? (Start with emoji, easy to upgrade)
4. **Mobile experience**: How does rail work on mobile? (Convert to bottom drawer)
5. **Brief section limits**: Max number of sections? (No limit, but warn at 20+)
6. **Search scope**: Should Cmd+F search across projects or just current? (Just current in V1)

---

## Getting Started

1. Review this entire prompt carefully
2. Examine the existing codebase structure
3. Start with Phase 1: Project System
4. Create a new branch: `feature/multi-project-workspace`
5. Commit frequently with clear messages
6. Test each feature before moving to the next
7. Request user feedback after Phase 1 completion before starting Phase 2

---

**Good luck! This is an exciting feature that will significantly enhance the user experience. Focus on smooth animations, keyboard accessibility, and that spy/command-center aesthetic. 🎯**

