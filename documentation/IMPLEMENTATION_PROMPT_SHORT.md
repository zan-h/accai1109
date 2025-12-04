# Quick Implementation Prompt for Claude

I need help transforming my Next.js web app to match a spy/command-center aesthetic documented in `STYLE_GUIDE.md`.

## Project
- **Location:** `14-voice-agents/realtime-workspace-agents/`
- **Tech:** Next.js + TypeScript + Tailwind CSS
- **Style Guide:** `STYLE_GUIDE.md` (same directory)

## Task
Transform the entire app to match the style guide, which features:
- Dark terminal/surveillance monitor aesthetic
- Monospace fonts throughout
- Cyan (#00d9ff) accents with glow effects
- Corner bracket frame (L-shaped cyan brackets in all 4 corners)
- Dense, information-rich layouts
- Terminal-style command syntax
- Zero drop shadows (only glows: `box-shadow: 0 0 10px rgba(0,217,255,0.3)`)

## Implementation Plan

### Phase 1: Foundation
1. Read `STYLE_GUIDE.md` completely
2. Update `tailwind.config.ts` with colors, fonts, custom shadows from style guide
3. Add CSS variables to `src/app/globals.css`
4. Import JetBrains Mono or Fira Code font

### Phase 2: Layout
1. Create corner bracket component/styling
2. Update root layout with dark background + monospace font
3. Implement zero-gap grid layout (borders, no gaps)
4. Add optional vignette effect

### Phase 3: Components
Transform each component to match style guide:
- `BottomToolbar.tsx` - Terminal buttons with cyan glows
- `Transcript.tsx` - Activity log with dash prefixes, cyan agent names
- `Events.tsx` - Dense tables, hash prefixes, monospace
- `Workspace.tsx` + `Sidebar.tsx` + `TabContent.tsx` - Panels, tabs, borders
- `GuardrailChip.tsx` - Status indicators with colored dots

### Phase 4: Polish
- Hover states (cyan glows)
- Transitions (0.2-0.3s)
- Typography (uppercase headers, wide letter-spacing)
- Special characters (▶, >, ::, >>, ΔΔΔ)

## Rules
✅ DO: Maintain all existing functionality, use glows only, be consistent
❌ DON'T: Break features, add drop shadows, deviate from style guide

## Start By:
1. Reading `STYLE_GUIDE.md` 
2. Auditing current components
3. Creating detailed implementation plan
4. Starting with Tailwind config + globals.css

Ready when you are!

