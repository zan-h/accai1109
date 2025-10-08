# Claude Implementation Prompt: Apply Style Guide to Web App

## Context

I have a Next.js web application for multi-agent voice interactions (workspace builder / ADHD productivity system) that currently has basic Tailwind styling. I want to transform it to match a spy/command-center aesthetic documented in a comprehensive style guide.

**Project Location:** `/Users/mizan/100MRR/bh-refactor/14-voice-agents/realtime-workspace-agents/`

**Style Guide Location:** `STYLE_GUIDE.md` (same directory)

## Current Tech Stack

- **Framework:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS + CSS Modules
- **Language:** TypeScript
- **Key Files:**
  - `src/app/globals.css` - Global styles
  - `src/app/layout.tsx` - Root layout
  - `src/app/page.tsx` - Entry point
  - `src/app/App.tsx` - Main app component
  - `src/app/components/` - UI components (BottomToolbar, Transcript, Events, Workspace, etc.)
  - `tailwind.config.ts` - Tailwind configuration

## Objective

Transform the entire application to match the spy/command-center aesthetic defined in `STYLE_GUIDE.md`. The design features:
- Dark terminal/surveillance monitor aesthetic
- Monospace typography throughout
- Cyan accent colors with glow effects
- Corner bracket frame around the entire app
- Dense, information-rich layouts
- CRT monitor effects (optional)
- Terminal-style command syntax
- Zero drop shadows (glows only)

## What I Need You To Do

### Phase 1: Foundation Setup
1. **Read the style guide** (`STYLE_GUIDE.md`) to understand the complete design system
2. **Audit current styling** - Review existing components and identify what needs to change
3. **Configure Tailwind** - Update `tailwind.config.ts` with the color palette, fonts, and custom utilities from the style guide
4. **Setup CSS variables** - Add all CSS custom properties to `globals.css`
5. **Import monospace fonts** - Add font imports (recommend JetBrains Mono or Fira Code as alternatives to Courier New)

### Phase 2: Core Layout Transformation
1. **Dashboard frame with corner brackets** - Implement the outer frame with L-shaped cyan corner brackets
2. **Update root layout** - Apply dark background, monospace font, and container structure
3. **Grid system** - Implement the zero-gap grid layout where borders create visual separation
4. **Add optional effects** - Vignette, subtle texture overlay, CRT scanlines (make these toggleable)

### Phase 3: Component Migration
Transform existing components to match style guide specifications:

1. **Header/Toolbar** (`BottomToolbar.tsx`)
   - Terminal-style buttons with glow effects on hover
   - Monospace text with wide letter spacing
   - Icon buttons using ASCII-style symbols

2. **Transcript** (`Transcript.tsx`)
   - Activity log styling with timestamps
   - Terminal command syntax for messages
   - Agent name highlighting in cyan
   - Dash prefixes for log entries

3. **Events/Debug Panel** (`Events.tsx`)
   - Dense table layout
   - Monospace formatting
   - Status indicators with colored dots
   - Hash prefixes for system messages

4. **Workspace Components** (`Workspace.tsx`, `Sidebar.tsx`, `TabContent.tsx`)
   - Section headers with fade dividers
   - Tab navigation with glow effects
   - Panel borders and spacing
   - Data table styling for agent information

### Phase 4: Interactive Elements
1. **Buttons** - Apply terminal-style button styling with cyan borders and glow effects
2. **Inputs/Forms** - Dark backgrounds, cyan focus states, monospace text
3. **Modals** - Border with cyan glow, corner brackets
4. **Status Indicators** - Pulsing dots for success/warning/error states
5. **Loading States** - Terminal-style spinners or loading bars

### Phase 5: Typography & Content
1. **Apply monospace fonts** throughout the app
2. **Text hierarchy** - Use uppercase for headers with wide letter-spacing
3. **Color application** - Primary/secondary/tertiary text colors
4. **Special characters** - Use terminal symbols (▶, >, ::, >>, ΔΔΔ, etc.)

### Phase 6: Polish & Effects
1. **Hover states** - Cyan glow effects on interactive elements
2. **Transitions** - Smooth 0.2s-0.3s transitions
3. **Accessibility** - Ensure proper focus states and screen reader support
4. **Responsive** - Verify mobile/tablet layouts work with the new design

## Implementation Guidelines

### Priority Order
1. Start with foundation (Tailwind config, CSS variables, fonts)
2. Apply layout structure (frame, grid, containers)
3. Transform visible components one at a time
4. Add effects and polish last

### Code Quality
- Use TypeScript strictly
- Maintain existing component architecture
- Extract reusable styles into Tailwind utilities or CSS classes
- Keep components modular and maintainable
- Comment complex CSS (especially for effects like scanlines, corner brackets)

### Testing Approach
- Test each component after transformation
- Verify in different viewport sizes
- Check accessibility (keyboard navigation, screen readers)
- Test in different browsers
- Ensure voice interaction features still work

### What NOT To Do
- ❌ Don't break existing functionality
- ❌ Don't use drop shadows or text shadows (glows only!)
- ❌ Don't add decorative elements not in the style guide
- ❌ Don't change the app's core logic or behavior
- ❌ Don't remove any critical features

## Specific Requests

### 1. Tailwind Configuration
Please extend the Tailwind config with:
```typescript
// From STYLE_GUIDE.md - add colors, fonts, spacing, shadows
theme: {
  extend: {
    colors: {
      bg: { primary: '#0a0a0a', secondary: '#131313', tertiary: '#1a1a1a' },
      text: { primary: '#e8e8e8', secondary: '#8a8a8a', tertiary: '#5a5a5a' },
      accent: { primary: '#00d9ff', secondary: '#00b8d4' },
      status: { success: '#00ff88', warning: '#ffaa00', error: '#ff4444' },
      border: { primary: '#2a2a2a', secondary: '#1f1f1f', dim: '#151515' },
      wireframe: { primary: '#00d9ff', secondary: 'rgba(0, 217, 255, 0.4)' }
    },
    fontFamily: {
      mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
    },
    boxShadow: {
      'glow-cyan': '0 0 10px rgba(0, 217, 255, 0.3)',
      'glow-success': '0 0 10px rgba(0, 255, 136, 0.3)',
      'glow-error': '0 0 10px rgba(255, 68, 68, 0.3)'
    }
  }
}
```

### 2. Corner Bracket Component
Create a reusable component for the corner brackets:
```tsx
// components/CornerBrackets.tsx
export function CornerBrackets() {
  return (
    <>
      <div className="corner-bracket corner-top-left" />
      <div className="corner-bracket corner-top-right" />
      <div className="corner-bracket corner-bottom-left" />
      <div className="corner-bracket corner-bottom-right" />
    </>
  );
}
```

### 3. Terminal Message Component
Create a component for terminal-style messages:
```tsx
// Pattern: > [AGENT:name] :: STATUS >> symbol message
<TerminalMessage 
  agent="ghostFire" 
  status="INIT" 
  symbol="ΔΔΔ" 
  message="loading secure channel" 
/>
```

### 4. Status Indicator Component
Create reusable status indicators:
```tsx
<StatusIndicator status="success" label="ACTIVE" />
<StatusIndicator status="error" label="FAILED" />
```

## Expected Deliverables

After implementation, the app should:
1. ✅ Match the visual aesthetic in STYLE_GUIDE.md
2. ✅ Have corner brackets framing the entire interface
3. ✅ Use monospace typography throughout
4. ✅ Feature cyan accent colors with glow effects
5. ✅ Display terminal-style command syntax in logs/messages
6. ✅ Have dense, information-rich layouts
7. ✅ Include hover effects with cyan glows
8. ✅ Maintain all existing functionality
9. ✅ Work responsively on mobile/tablet/desktop
10. ✅ Meet accessibility standards

## How to Proceed

### Step-by-Step Approach:
1. **Read STYLE_GUIDE.md thoroughly** - Understand the complete design system
2. **Audit current app** - Identify all components that need transformation
3. **Create implementation plan** - Break down work into phases
4. **Start with foundation** - Tailwind config, globals.css, fonts
5. **Transform components incrementally** - One component at a time
6. **Test after each change** - Ensure nothing breaks
7. **Add polish** - Effects, animations, hover states
8. **Final review** - Compare against style guide for accuracy

### Questions to Consider:
- Should CRT effects (scanlines, glow) be toggleable via a setting?
- Do we want a dark/light mode toggle, or stay dark only?
- Should the corner brackets be visible on mobile, or only desktop?
- Are there any components we should prioritize first?

## Current State Reference

The app currently has:
- Basic Tailwind styling (likely default colors)
- Standard fonts (probably system fonts)
- Light/standard UI components
- Basic layout without special effects
- Working voice interaction features
- Transcript display
- Workspace/tab management
- Event logging/debugging panel

## Success Criteria

The transformation is complete when:
1. Someone looking at the app immediately gets "spy/command center" vibes
2. All text is monospace with proper hierarchy
3. Interactive elements glow cyan on hover
4. The corner brackets frame the entire interface
5. Terminal-style syntax appears in messages/logs
6. No drop shadows exist (only glows)
7. The design feels dense and information-rich
8. All existing features still work perfectly
9. The app is accessible and responsive

## Additional Notes

- **Be conservative** - Don't remove or break existing functionality
- **Be thorough** - Apply the style guide consistently across ALL components
- **Be practical** - If something from the style guide doesn't fit, explain why and suggest alternatives
- **Document decisions** - Comment complex CSS and explain choices
- **Ask questions** - If anything is unclear, ask before implementing

## Files to Focus On

### High Priority (Core Styling)
1. `tailwind.config.ts` - Color palette, fonts, utilities
2. `src/app/globals.css` - CSS variables, global styles
3. `src/app/layout.tsx` - Root layout and container
4. `src/app/App.tsx` - Main app structure

### Medium Priority (Visible Components)
5. `src/app/components/BottomToolbar.tsx` - Control buttons
6. `src/app/components/Transcript.tsx` - Message display
7. `src/app/components/Workspace.tsx` - Main workspace
8. `src/app/components/workspace/Sidebar.tsx` - Navigation
9. `src/app/components/workspace/TabContent.tsx` - Content area

### Lower Priority (Supporting Components)
10. `src/app/components/Events.tsx` - Debug panel
11. `src/app/components/GuardrailChip.tsx` - Status indicators
12. Other utility components

---

## Ready to Start?

Please begin by:
1. Reading the complete `STYLE_GUIDE.md` file
2. Examining the current state of the app (read the key files listed above)
3. Creating a detailed implementation plan with specific tasks
4. Confirming your understanding and asking any clarifying questions
5. Starting implementation with the foundation (Tailwind config, CSS variables)

Let me know when you've reviewed the style guide and are ready to begin the transformation!

