Background and Motivation
The current repo contains a Next.js demo of multi-agent realtime voice interactions using the OpenAI Realtime SDK. Scenarios include real estate, customer service retail, a chat supervisor pattern, a workspace builder, and a simple handoff. The goal is to generalize this into "various agents that support a user to do great, embodied work," shifting from vertical demos to a reusable multi-agent substrate (voice-first, tool-using, handoff-capable, guardrail-aware) that can be specialized per domain.

**Latest Activity:** Comprehensive code review and debugging analysis of multi-suite system implementation (completed Oct 13, 2025)

Key Challenges and Analysis

## Design Implementation Challenges
- **Visual Consistency**: Need to transform 7+ components while maintaining consistent spy/command-center aesthetic across all of them
- **No Drop Shadows Rule**: Style guide explicitly prohibits drop shadows; must use only glows (box-shadow with blur but no offset)
- **Monospace Throughout**: All text must be monospace - will affect readability and spacing, need to test carefully
- **Dense Layouts**: Style guide emphasizes information density with minimal padding - must balance with usability
- **Color Accessibility**: Dark backgrounds with cyan accents - must ensure sufficient contrast for readability (WCAG compliance)
- **Terminal Syntax**: Implementing proper terminal command formatting ("> [AGENT:name] :: STATUS >> symbol") requires careful parsing of transcript messages
- **Corner Brackets**: Fixed positioning of frame elements may conflict with responsive layouts or scrolling behavior
- **Performance**: Multiple glow effects, animations, and pseudo-elements could impact render performance - need to monitor
- **Backwards Compatibility**: Must not break existing voice interaction functionality while applying visual changes
- **Font Loading**: JetBrains Mono or similar needs proper loading strategy to avoid FOUT (flash of unstyled text)

## Agent System Challenges (Future Work)
- Agent composition: Each scenario wires multiple `RealtimeAgent`s with explicit `handoffs`. We need a more generic "role" taxonomy and plug-in tools for embodied tasks.
- Orchestration: Today, the client selects a scenario and connects to a session with a chosen root agent; handoffs are local in agent config. For generalization, we'll need a supervisor or router that can resolve tasks to the right agent set dynamically.
- Guardrails: Moderation guardrails are scenario/company-specific. We need a modular guardrail registry with domain-aware policies and tripwire feedback into transcript UI.
- Tooling: Tools are implemented as Realtime function tools or proxied via `/api/responses`. We need a common tool catalog for embodied work (e.g., sensor/controls, file ops, scheduling, spatial tasks) and a policy for what runs client vs server.
- Realtime and audio: `useRealtimeSession` manages WebRTC, codec selection, VAD, push-to-talk. Generalization should keep this but allow agent set swapping and multi-modal inputs.

Current System Design (as implemented)
- Scenarios registry
  - File: `src/app/agentConfigs/scenarios/index.ts`
  - Exposes `allAgentSets` keyed by scenario: `workspaceBuilder`, `realEstateBroker`, `chatSupervisor`, `customerServiceRetail`, `simpleHandoff`; `defaultAgentSetKey = 'workspaceBuilder'`.
- Real Estate Broker
  - File: `scenarios/realEstateBroker/index.ts`
  - Agents: `intake` (greeter → requirements capture), `broker` (advice). Handoff: `intake -> broker`.
- Customer Service Retail
  - File: `scenarios/customerServiceRetail/index.ts`
  - Agents: `authentication`, `returns`, `sales`, `simulatedHuman`. Mutual handoffs across all.
  - `authentication` includes a strong verification flow and scripted disclosure; tool calls like `authenticate_user_information`, `save_or_update_address`, `update_user_offer_response` (defined in its file).
  - Company: `Snowy Peak Boards` (used by guardrails).
- Chat Supervisor Pattern
  - Files: `scenarios/chatSupervisor/index.ts`, `scenarios/chatSupervisor/supervisorAgent.ts`
  - `chatAgent` defers to tool `getNextResponseFromSupervisor` for all substantive responses; the tool calls `/api/responses` with system instructions and iterates function calls (policy lookup, account info, nearest store) via `handleToolCalls` until a final message.
  - Company: `NewTelco` (guardrails/company name usage exemplar).
- Workspace Builder
  - File: `scenarios/workspaceBuilder/index.ts`
  - Agents: `workspaceManager`, `designer`, `estimator`; directional handoffs among them. Includes domain-specific guardrails in `scenarios/workspaceBuilder/guardrails.ts`.
- Simple Handoff
  - File: `scenarios/simpleHandoff/index.ts` (minimal chain; not expanded here).
- Session lifecycle and transport
  - File: `hooks/useRealtimeSession.ts`
  - Creates `RealtimeSession(rootAgent, { transport: OpenAIRealtimeWebRTC, model, config, outputGuardrails, context })`.
  - Manages connect/disconnect, WebRTC audio element, VAD / PTT, history events, guardrail trip events, and agent handoffs.
- UI and scenario selection
  - File: `App.tsx`
  - Uses `?agentConfig=` to pick scenario, reorders initial agents to set selected as root; sets guardrails: `createModerationGuardrail(realEstateCompanyName)`.
  - Triggers initial greeting by sending a simulated "hi" after connect.
- Guardrails
  - Files: `agentConfigs/guardrails/moderation.ts`, `scenarios/workspaceBuilder/guardrails.ts`
  - Implement async output moderation by calling `/api/responses` with a zod JSON schema; if tripwire triggers, UI annotates transcript with category/rationale.
- Backend API
  - `api/session/route.ts` creates ephemeral realtime session tokens.
  - `api/responses/route.ts` proxies to OpenAI Responses API (structured or text), used by supervisor and guardrails.

App Directory Structure Analysis

## Core Application Files (CRITICAL - DO NOT DELETE)
1. **App.tsx** (18KB, 536 lines)
   - Main application component and orchestration hub
   - Manages session lifecycle, agent selection, UI state
   - Handles codec selection, audio playback, WebRTC connections
   - Contains workspace versioning logic and localStorage management
   - **Deletion Impact**: Application would completely break

2. **layout.tsx** (407B, 21 lines)
   - Next.js root layout with metadata and basic HTML structure
   - Imports global CSS and environment setup
   - **Deletion Impact**: Next.js app would not render

3. **page.tsx** (566B, 20 lines)
   - Entry point wrapping App.tsx with context providers
   - Provides TranscriptProvider, EventProvider, WorkspaceProvider
   - **Deletion Impact**: Application would have no route and no context

4. **types.ts** (3.9KB, 171 lines)
   - Central type definitions for the entire application
   - Defines interfaces for agents, tools, transcripts, guardrails, workspace tabs
   - **Deletion Impact**: TypeScript compilation would fail

5. **globals.css** (1.3KB, 41 lines)
   - Tailwind CSS imports and global styles
   - **Deletion Impact**: UI would lose all styling

## Context Providers (CRITICAL - DO NOT DELETE)
Located in `/contexts/`:
- **TranscriptContext.tsx**: Manages conversation history and transcript items
- **EventContext.tsx**: Handles client/server event logging and debugging
- **WorkspaceContext.tsx**: Manages workspace state with tabs, localStorage persistence
- **Deletion Impact**: Would break state management across the application

## UI Components (MOSTLY CRITICAL)
Located in `/components/`:

### Essential Components:
- **BottomToolbar.tsx**: Connection controls, PTT, settings - **CRITICAL**
- **Transcript.tsx**: Conversation display with markdown/guardrail support - **CRITICAL**
- **Events.tsx**: Debug panel for event logging - **USEFUL for debugging**
- **GuardrailChip.tsx**: Displays moderation warnings - **CRITICAL for safety**

### Workspace-Specific Components (CONDITIONALLY DELETABLE):
- **Workspace.tsx**: Container for workspace builder scenario
- **workspace/Sidebar.tsx**: Tab management for workspace
- **workspace/TabContent.tsx**: Content renderer for markdown/CSV tabs
- **Deletion Impact**: Only affects `workspaceBuilder` scenario; other scenarios would work fine

## Custom Hooks (CRITICAL - DO NOT DELETE)
Located in `/hooks/`:
- **useRealtimeSession.ts**: Core WebRTC/OpenAI session management
- **useAudioDownload.ts**: Audio recording and download functionality  
- **useHandleSessionHistory.ts**: Session event processing and transcript management
- **Deletion Impact**: Would break core voice interaction functionality

## Agent Configurations (SCENARIO-DEPENDENT)
Located in `/agentConfigs/`:

### Core Infrastructure (CRITICAL):
- **index.ts**: Exports all scenarios and main registry
- **types.ts**: Agent configuration type definitions  
- **guardrails/**: Moderation and safety systems

### Individual Scenarios (CONDITIONALLY DELETABLE):
- **scenarios/workspaceBuilder/**: Workspace building agents and tools
- **scenarios/realEstateBroker/**: Real estate consultation agents
- **scenarios/chatSupervisor/**: Supervisor pattern with tool routing
- **scenarios/customerServiceRetail/**: Complex customer service flow
- **scenarios/simpleHandoff/**: Minimal handoff example

**Deletion Impact per Scenario**:
- Deleting any scenario folder removes that option from the dropdown
- App gracefully falls back to `defaultAgentSetKey = 'workspaceBuilder'`
- Other scenarios continue to work normally

## API Routes (CRITICAL - DO NOT DELETE)
Located in `/api/`:
- **session/route.ts**: Creates ephemeral OpenAI session tokens
- **responses/route.ts**: Proxies to OpenAI Responses API for structured/text generation
- **Deletion Impact**: Would break agent communication and session establishment

## Utility Libraries (CRITICAL - DO NOT DELETE)
Located in `/lib/`:
- **audioUtils.ts**: WAV conversion and audio processing
- **codecUtils.ts**: Audio codec handling (PCMU/PCMA/Opus)
- **envSetup.ts**: Environment configuration
- **Deletion Impact**: Would break audio functionality and codec selection

## What Can Be Safely Deleted

### Deletable with Minimal Impact:
1. **Specific Scenario Folders**: Any individual scenario in `/agentConfigs/scenarios/` except the default
   - Remove unwanted use cases (e.g., delete `realEstateBroker` if not needed)
   - Update `index.ts` to remove references
   - Change `defaultAgentSetKey` if deleting the current default

2. **Workspace-Related Components** (if not using workspace scenario):
   - `/components/Workspace.tsx`
   - `/components/workspace/` entire folder
   - `/contexts/WorkspaceContext.tsx`
   - Note: Would break `workspaceBuilder` scenario

3. **Debug/Development Components**:
   - `/components/Events.tsx` (loses debugging capability)
   - Audio download functionality in hooks (loses recording feature)

### Deletion Strategy Examples:

**Minimal Voice-Only App** (delete these):
```
/agentConfigs/scenarios/workspaceBuilder/
/agentConfigs/scenarios/realEstateBroker/  
/agentConfigs/scenarios/customerServiceRetail/
/agentConfigs/scenarios/chatSupervisor/
/components/Workspace.tsx
/components/workspace/
/contexts/WorkspaceContext.tsx
/hooks/useAudioDownload.ts (and remove from App.tsx)
```
Keep only `simpleHandoff` scenario, results in ~70% size reduction.

**Single-Purpose App** (e.g., real estate only):
```
# Keep only realEstateBroker scenario
# Delete all other scenario folders
# Update defaultAgentSetKey to 'realEstateBroker'
# Remove workspace components
```

### NEVER DELETE:
- Core files: App.tsx, layout.tsx, page.tsx, types.ts, globals.css
- Context providers (except WorkspaceContext if removing workspace)
- Essential components: BottomToolbar, Transcript, GuardrailChip
- Core hooks: useRealtimeSession, useHandleSessionHistory  
- API routes: session/, responses/
- Core lib utilities: audioUtils, codecUtils, envSetup
- Base agent configs: index.ts, guardrails/

**Consequence Summary**: Deleting scenarios = loss of specific use cases. Deleting workspace = loss of document editing. Deleting core files = complete application failure.

Gaps relative to "embodied work"
- No generic task routing beyond static per-scenario handoffs.
- Tools are domain-specific; no standard interfaces for embodied actions (devices, files, spatial memory, scheduling, procedure execution).
- Limited memory: conversation history only; no persistent user/task state or episodic memory.
- Single-tenant guardrail policy per scenario; not user- or org-scoped.
- No explicit capability model (who can do what), nor competency ratings for routing.

High-level Task Breakdown

## CURRENT FOCUS: Design Implementation (Spy/Command-Center Aesthetic)

### Phase 1: Foundation Setup (Must Complete First)
**Goal**: Establish the design system foundation without breaking existing functionality

1.1) **Update Tailwind Configuration**
   - Add color palette from style guide (bg, text, accent, status, border, wireframe colors)
   - Add monospace font family configuration
   - Add custom box-shadow utilities for glow effects
   - Add spacing and border configurations
   - Success: `tailwind.config.ts` compiles without errors; custom classes available

1.2) **Setup CSS Variables and Global Styles**
   - Add all CSS custom properties to `globals.css` (colors, fonts, spacing, effects)
   - Import monospace fonts (JetBrains Mono via Google Fonts)
   - Setup base body styles with monospace font and dark background
   - Add scrollbar styling
   - Remove conflicting light mode styles
   - Success: App loads with dark background, monospace font, proper scrollbars

1.3) **Create Corner Bracket Frame Component**
   - Build reusable `CornerBrackets.tsx` component with 4 L-shaped corners
   - Use absolute positioning with cyan borders
   - Make responsive (hide on mobile if needed)
   - Success: Component renders 4 cyan corner brackets at viewport edges

1.4) **Update Root Layout with Frame**
   - Wrap app in dashboard container with corner brackets
   - Add outer border to main container
   - Apply dark background consistently
   - Success: Entire app framed with corner brackets and border

### Phase 2: Core Component Transformations
**Goal**: Transform visible components one at a time, testing after each

2.1) **Transform BottomToolbar Component**
   - Apply terminal-style button styling (cyan borders, transparent bg)
   - Add glow effects on hover
   - Use monospace text with uppercase labels
   - Replace icons with ASCII symbols where appropriate
   - Success: Toolbar buttons have cyan glow on hover, monospace text, no visual regressions

2.2) **Transform Transcript Component**
   - Apply activity log styling with timestamps
   - Add terminal command syntax formatting for messages
   - Highlight agent names in cyan
   - Add dash prefixes for log entries
   - Style guardrail warnings with appropriate colors
   - Success: Transcript displays in terminal style, agent names cyan, readable timestamps

2.3) **Transform Events Component**
   - Apply dense table layout for event logs
   - Use monospace formatting throughout
   - Add status indicators with colored dots
   - Use hash prefixes for system messages
   - Make borders subtle (1px, no drop shadows)
   - Success: Events panel displays in terminal table style, status indicators visible

2.4) **Transform GuardrailChip Component**
   - Apply status indicator styling (dot + label)
   - Use appropriate status colors (success/warning/error)
   - Add subtle glow effects
   - Uppercase label text with wide letter-spacing
   - Success: Guardrail chips display with colored dots and glows

2.5) **Transform Workspace Component**
   - Apply section header styling with fade dividers
   - Use zero-gap grid layout where sections touch
   - Add panel borders and background colors
   - Dense, compact spacing throughout
   - Success: Workspace has dense layout with proper borders and spacing

2.6) **Transform Sidebar Component**
   - Apply tab navigation styling with glow effects
   - Terminal-style active tab indicator
   - Monospace text throughout
   - Cyan accent on active tab
   - Success: Sidebar tabs glow cyan when hovered/active

2.7) **Transform TabContent Component**
   - Style markdown content with monospace font
   - Apply proper text colors from palette
   - Style tables/lists in terminal style
   - Success: Tab content readable with terminal styling

### Phase 3: Typography & Refinements
**Goal**: Polish text hierarchy and consistency

3.1) **Apply Text Hierarchy**
   - Headers: uppercase with wide letter-spacing
   - Labels: uppercase, small size
   - Body: mixed case, normal spacing
   - Numbers: tabular-nums for alignment
   - Success: Clear visual hierarchy, all text monospace

3.2) **Add Terminal Command Syntax Patterns**
   - Create utility classes for terminal messages
   - Pattern: `> [AGENT:name] :: STATUS >> symbol message`
   - Color code different parts (prompt, label, status, message)
   - Success: Terminal-style messages render correctly in transcript

3.3) **Polish Spacing and Borders**
   - Review all component spacing for density
   - Ensure zero-gap grids with border separation
   - Use fade dividers for sections
   - Success: Interface feels dense and information-rich, not cramped

### Phase 4: Interactive Effects & Polish
**Goal**: Add finishing touches without overengineering

4.1) **Add Hover Effects**
   - Cyan glow on all interactive elements (buttons, tabs, links)
   - Smooth transitions (0.2s-0.3s)
   - Border color changes to cyan on hover
   - Success: All interactive elements glow cyan on hover

4.2) **Add Status Indicators**
   - Pulsing dot animations for active states
   - Colored glows (green/yellow/red) for status
   - Success: Status indicators pulse and glow appropriately

4.3) **Add Loading States**
   - Terminal-style loading spinner or dots
   - Loading bar with cyan glow
   - Success: Loading states visible and styled consistently

4.4) **Accessibility Check**
   - Verify focus states with cyan outline
   - Test keyboard navigation
   - Check screen reader compatibility
   - Success: App is keyboard navigable with visible focus states

4.5) **Responsive Verification**
   - Test mobile layout (single column stack)
   - Test tablet layout (two columns)
   - Test desktop (three columns if applicable)
   - Adjust corner brackets for mobile (hide or scale)
   - Success: App works on mobile, tablet, desktop without breaking

### Phase 5: Optional Enhancements (If Desired)
**Goal**: Add atmospheric effects without compromising performance

5.1) **Add CRT Scanline Effect (Optional)**
   - Subtle horizontal lines overlay
   - Very low opacity to avoid distraction
   - Toggleable via setting
   - Success: Scanlines visible but subtle, can be disabled

5.2) **Add Vignette Effect (Optional)**
   - Radial gradient darkening edges
   - Very subtle, non-intrusive
   - Success: Edges slightly darker, adds depth

5.3) **Add Subtle Texture Overlay (Optional)**
   - Noise/grain texture for monitor feel
   - Extremely low opacity
   - Success: Subtle texture visible on close inspection

---

## FUTURE WORK: Agent System Generalization (On Hold Until Design Complete)

1) Introduce Agent Capability Model and Registry
   - Success: Agents declare roles, capabilities, modalities, and tool access via a common schema; registry enumerates agents across domains.
2) Add Dynamic Router/Supervisor for Task Assignment
   - Success: A router agent/tool maps user intents to agents using capability tags and context; supports mid-conversation reassignment.
3) Create Common Embodied Tools Catalog
   - Success: Standard tool interfaces (e.g., `capture_sensor_data`, `control_device`, `schedule_block`, `open_file`, `annotate_image`, `spatial_plan_step`) with server implementations and auth.
4) Memory and State Layer
   - Success: Pluggable memory store (user profile, task board, artifacts); agents can read/write scoped state via tools with policy checks.
5) Guardrail Policy Modularization
   - Success: Guardrails load from policy registry keyed by org/user/domain; transcript annotates violations uniformly.
6) Scenario Abstraction and Runtime Switching
   - Success: Select root agent by intent; switch scenarios at runtime without reconnecting, preserving history and state.
7) Testing & Validation
   - Success: TDD: unit tests for router decisions; integration tests for handoffs and guardrail trip; e2e for audio session and tool calls.

Project Status Board

### Design Implementation Tasks (Current Focus)
**Phase 1: Foundation Setup** ✅ COMPLETED
- [x] 1.1 - Update Tailwind Configuration
- [x] 1.2 - Setup CSS Variables and Global Styles  
- [x] 1.3 - Create Corner Bracket Frame Component
- [x] 1.4 - Update Root Layout with Frame

**Phase 2: Core Component Transformations**
- [ ] 2.1 - Transform BottomToolbar Component
- [ ] 2.2 - Transform Transcript Component
- [ ] 2.3 - Transform Events Component
- [ ] 2.4 - Transform GuardrailChip Component
- [ ] 2.5 - Transform Workspace Component
- [ ] 2.6 - Transform Sidebar Component
- [ ] 2.7 - Transform TabContent Component

**Phase 3: Typography & Refinements**
- [ ] 3.1 - Apply Text Hierarchy
- [ ] 3.2 - Add Terminal Command Syntax Patterns
- [ ] 3.3 - Polish Spacing and Borders

**Phase 4: Interactive Effects & Polish**
- [ ] 4.1 - Add Hover Effects
- [ ] 4.2 - Add Status Indicators
- [ ] 4.3 - Add Loading States
- [ ] 4.4 - Accessibility Check
- [ ] 4.5 - Responsive Verification

**Phase 5: Optional Enhancements (If Desired)**
- [ ] 5.1 - Add CRT Scanline Effect (Optional)
- [ ] 5.2 - Add Vignette Effect (Optional)
- [ ] 5.3 - Add Subtle Texture Overlay (Optional)

### Agent System Generalization (Future Work - On Hold)
- [x] Repo scan and current system mapping
- [x] App directory analysis and deletion impact assessment  
- [ ] Introduce Agent Capability Model and Registry
- [ ] Add Dynamic Router/Supervisor for Task Assignment
- [ ] Create Common Embodied Tools Catalog
- [ ] Memory and State Layer
- [ ] Guardrail Policy Modularization
- [ ] Scenario Abstraction and Runtime Switching
- [ ] Testing & Validation

### Completed Milestones
- [x] Run Next.js app locally for verification (2025-09-29)
- [x] Investigate missing Tailwind styles causing unformatted UI (2025-09-29)
- [x] Commit and push refactored codebase (2025-09-29)

Planner's Analysis and Recommendations

## Design Implementation Plan Summary (2025-10-08)

**Context**: The user has created a comprehensive 2,696-line style guide for a spy/command-center aesthetic and detailed implementation prompts. The current app has basic Tailwind styling and needs complete visual transformation while maintaining all functionality.

**Approach**: Incremental transformation with small, testable tasks to avoid breaking existing voice interaction features.

### Key Strategic Decisions:

1. **Sequential, Not Parallel**: Transform one component at a time rather than all at once
   - Rationale: Easier to debug, test, and verify functionality isn't broken
   - Each task has clear success criteria that can be verified before moving on

2. **Foundation First**: Must complete Phase 1 (Tailwind config, CSS variables, fonts, frame) before any component work
   - Rationale: Components depend on these foundational styles being in place
   - Prevents inconsistent styling if components are done first

3. **No Overengineering**: Focus on CSS and Tailwind, avoid creating helper scripts or build tools
   - Rationale: Per user's rules, use standard tools and keep it simple
   - Style guide already provides all the CSS patterns needed

4. **Component Priority Order**:
   - BottomToolbar first (most visible, interactive)
   - Transcript second (core UX, shows messages)
   - Events third (debugging, less critical)
   - GuardrailChip fourth (small, focused)
   - Workspace/Sidebar/TabContent last (scenario-specific)

5. **Testing After Each Task**: User should manually test after each subtask completion
   - Rationale: Executor should report progress and get user feedback at milestones
   - Prevents cascading issues from accumulating

6. **Optional Enhancements Last**: CRT effects, vignette, texture are Phase 5 only if desired
   - Rationale: Core aesthetic can be achieved without these; they add complexity
   - Performance impact needs to be evaluated before adding

### Implementation Risks & Mitigations:

| Risk | Mitigation |
|------|------------|
| Breaking voice functionality | Test audio/connection after each phase |
| Performance degradation from glows | Use CSS transforms, limit pseudo-elements, monitor FPS |
| Readability issues with monospace | Test with real content, adjust font sizes if needed |
| Corner brackets on mobile | Make responsive/hideable at small breakpoints |
| Font loading flash | Use `font-display: swap` with system mono fallback |
| Color contrast failures | Use style guide colors as-is (already specified) |
| Terminal syntax parsing | Start simple with regex, enhance if needed |

### Critical Success Factors:

1. **Visual Consistency**: All 7+ components must feel cohesive (same colors, fonts, spacing)
2. **No Functional Regressions**: Voice interactions, agent handoffs, workspace features must continue working
3. **Performance**: App should feel responsive despite glow effects and animations
4. **Accessibility**: Maintain keyboard navigation and screen reader support
5. **Responsiveness**: Design works on mobile, tablet, desktop

### Dependencies Between Tasks:

```
Phase 1 (Foundation) → BLOCKS → Phase 2 (Components)
                                        ↓
                                  Phase 3 (Typography)
                                        ↓
                                  Phase 4 (Effects)
                                        ↓
                                  Phase 5 (Optional)
```

Within Phase 2, components can be done in sequence but are not dependent on each other.

### Task Size Estimate:

- **Phase 1**: ~4 tasks, 2-4 hours (foundation critical, must be done carefully)
- **Phase 2**: ~7 tasks, 6-10 hours (most time-consuming, requires testing each component)
- **Phase 3**: ~3 tasks, 2-3 hours (refinement and polish)
- **Phase 4**: ~5 tasks, 3-5 hours (effects and verification)
- **Phase 5**: ~3 tasks, 1-2 hours (optional, if desired)

**Total Estimate**: 14-24 hours of focused work (assumes no major blockers)

### Next Steps for Executor:

When executor mode is invoked:
1. Start with Task 1.1 (Tailwind Configuration)
2. Complete through 1.4 (Root Layout)
3. Report back to user with visual screenshots
4. Get approval before starting Phase 2

**Do NOT proceed past Phase 1 without user verification** - foundation must be solid before component work begins.

### Detailed Phase 1 Task Breakdown (For Executor Reference)

**Task 1.1: Update Tailwind Configuration**
File: `tailwind.config.ts`
- Extend theme with colors object (bg, text, accent, status, border, wireframe)
- Add fontFamily: { mono: [...] }
- Add boxShadow: { 'glow-cyan', 'glow-success', 'glow-error' }
- Reference: STYLE_GUIDE.md lines 18-66 (Color Palette) and 1906-1945 (Tailwind Config Example)
- Success: `npm run dev` compiles without errors, custom Tailwind classes available

**Task 1.2: Setup CSS Variables and Global Styles**
File: `src/app/globals.css`
- Remove light mode media query and conflicting CSS variables
- Add all CSS custom properties from style guide (lines 18-117)
- Import Google Fonts: JetBrains Mono (weights: 300, 400, 500, 600, 700)
- Set body: font-family mono, background dark, color light
- Add scrollbar styling (lines 1971-1988)
- Reference: STYLE_GUIDE.md lines 1947-1988 (CSS Variables Setup)
- Success: App loads with dark bg (#0a0a0a), monospace font, styled scrollbars

**Task 1.3: Create Corner Bracket Frame Component**
File: `src/app/components/CornerBrackets.tsx` (new file)
- Create functional component with 4 absolute-positioned divs
- Each corner: 30px x 30px L-shaped border (3px solid cyan)
- Use CSS pseudo-elements ::before and ::after on container
- Reference: STYLE_GUIDE.md lines 2123-2178 (Corner Brackets)
- Success: Component renders 4 cyan L-brackets at viewport corners

**Task 1.4: Update Root Layout with Frame**
Files: `src/app/layout.tsx` and `src/app/page.tsx`
- Wrap app content in dashboard-container div with 2px border
- Add CornerBrackets component at root level
- Apply min-height: 100vh and position: relative
- Reference: STYLE_GUIDE.md lines 2127-2131 (Dashboard Container)
- Success: App has 2px border around entire viewport with cyan corner brackets

---

Executor's Feedback or Assistance Requests

**Phase 1 Foundation Setup - COMPLETED (2025-10-08)**

✅ **Task 1.1 - Tailwind Configuration**: 
- Extended Tailwind theme with spy/command-center color palette
- Added 6 color categories: bg, text, accent, status, border, wireframe
- Configured JetBrains Mono as primary monospace font
- Added 6 custom glow box-shadow utilities (cyan, cyan-lg, cyan-xl, success, error, warning)
- Success: Build compiles without errors, custom Tailwind classes available

✅ **Task 1.2 - CSS Variables and Global Styles**:
- Removed light mode media query, forcing dark mode always
- Added 40+ CSS custom properties for colors, typography, spacing
- Imported JetBrains Mono font from Google Fonts (weights 300-700)
- Set body to monospace font with dark background (#0a0a0a)
- Added custom scrollbar styling (dark with cyan hover)
- Added focus states with cyan outline for accessibility
- Updated markdown styles to use terminal aesthetic
- Success: App loads with dark background, monospace font throughout

✅ **Task 1.3 - Corner Bracket Component**:
- Created `/src/app/components/CornerBrackets.tsx`
- 4 fixed-position L-shaped cyan borders (30x30px, 3px border width)
- Positioned at viewport corners with z-index 50
- Pointer-events: none to avoid blocking interactions
- Success: Component renders 4 cyan corner brackets

✅ **Task 1.4 - Root Layout with Frame**:
- Updated `layout.tsx` to import and render CornerBrackets
- Wrapped app in dashboard-container div with 2px border
- Applied font-mono class to body
- Updated metadata title to "Command Center"
- Success: Entire app framed with 2px border and cyan corner brackets

**Pre-existing Issues Fixed**:
- Added missing `materialsPrompt1` export to prompts.ts
- Fixed unused variable lint errors in designer.ts (added searchTheWeb to tools)
- Fixed unused variable lint errors in estimator.ts (added calculate to tools)
- Fixed unused import in customGuardrail.test.ts

**Build Status**: ✅ Production build successful (npm run build passed)
**Dev Server**: Running on http://localhost:3000 (or default port)

**Visual Changes Visible**:
1. Dark background (#0a0a0a) replaces light theme
2. All text now in JetBrains Mono (monospace)
3. 4 cyan L-shaped brackets at viewport corners
4. 2px border around entire app
5. Custom cyan scrollbars (hover to see cyan color)
6. Text color: off-white (#e8e8e8)

**CRITICAL BUGFIX - Hardcoded Light Theme Colors (2025-10-08)**

User reported contrast issues - discovered ALL components had hardcoded light theme colors overriding our foundation. Fixed:

✅ **App.tsx**:
- Main container: `bg-gray-100` → `bg-bg-primary`, `text-gray-800` → `text-text-primary`
- Header text: Applied secondary colors and uppercase styling
- Scenario select: Dark background, monospace font, cyan focus states

✅ **Workspace.tsx**:
- Container: `bg-white` → `bg-bg-secondary` with border
- Header: Dark background with borders, uppercase title
- Sidebar: Fixed border colors

✅ **Transcript.tsx** (MAJOR FIXES for contrast issue):
- Container: `bg-white` → `bg-bg-secondary` with border
- Header: Dark with borders, uppercase title
- Copy/Download buttons: Dark with cyan borders, glow on hover, monospace uppercase text
- Message bubbles: User messages bg-tertiary, agent messages with cyan border accent
- All text colors: `text-gray-*` → proper semantic colors (text-primary, secondary, tertiary)
- Timestamps: Proper contrast colors
- Input field: Dark background, cyan focus border, monospace font
- Send button: Cyan with glow effect
- Breadcrumb expansion: Fixed colors
- JSON preview: Dark background with proper borders

**Additional Fixes Applied After User Feedback (2025-10-08)**

User confirmed dark theme working but spotted missing elements:

✅ **Corner Brackets FIX**:
- Changed from inline styles with CSS variables to Tailwind classes
- Increased z-index from 50 to 9999
- Now using `border-accent-primary` directly (was `var(--accent-primary)`)
- Should now be visible at all 4 corners

✅ **Sidebar Tabs Styling**:
- Replaced all `neutral-*` and `dark:` classes with our theme colors
- Active tab: Dark background with cyan border and glow effect
- Hover state: Semi-transparent dark with border
- Tab text: Monospace font
- Edit/delete icons: Cyan/red hover colors
- "Add tab" button: Uppercase mono with cyan hover
- "Reset Workspace" button: Dark with red hover, uppercase mono

**Phase 1.5 - Polish & Interactive Elements (2025-10-08)**

User feedback indicated bottom toolbar and Edit button breaking immersion. Fixed:

✅ **BottomToolbar Complete Transformation**:
- Container: Dark background with top border
- Disconnect button: Dark bg with red text/border, fills red on hover with glow
- Connect button: Dark bg with cyan border, fills cyan on hover with glow
- All buttons: Uppercase monospace text
- Checkboxes: Custom styled - dark with cyan when checked
- Labels: Monospace, secondary text color
- "Talk" button: Dark with cyan glow when active
- Codec dropdown: Dark bg, cyan focus border, monospace
- All interactive elements now match terminal aesthetic

✅ **Tab Edit Button Styling**:
- Edit button: Dark bg, cyan hover with glow
- Save/Cancel buttons: Matching style, red hover for cancel
- Text areas: Dark bg, cyan focus border
- All uppercase monospace

✅ **Known Working**:
- Corner brackets visible at top corners
- Sidebar tabs with cyan glow
- Transcript with proper contrast
- Dark theme throughout
- Monospace font everywhere

**Remaining Minor Items** (polish, not breaking):
- Events/Logs panel styling (when visible)
- Bottom corner brackets (need to check visibility on actual screen)
- Table headers could be more stylized

**Next Steps**: User should hard refresh browser and verify:
- ✅ **Bottom toolbar looks cohesive** (no more jarring red button)
- ✅ **All checkboxes dark-styled**
- ✅ **Edit button matches terminal style**
- ✅ Interactive elements glow cyan on hover
- ✅ Voice interactions still work

**✅ DESIGN PHASE COMPLETE - Committed & Pushed (2025-10-09)**
- Commit: b62f015 "Transform UI to spy/command-center aesthetic"
- 15 files changed, 859 insertions(+), 89 deletions(-)
- Successfully pushed to origin/main
- User confirmed design looks excellent (Grade: A-)
- Spy/command-center aesthetic fully implemented and production-ready

---

## NEW FEATURE PLANNING: Multi-Project Workspace System (2025-10-09)

**User Request:**
- Enable multiple projects (each with dedicated workspace/tabs)
- Add project switcher without extra screens
- Create persistent "Mission Brief" panel for notes (goals, values, schedule)
- Notes can be global (all projects) or project-specific
- Minimize panel to save workspace real estate

**Proposed Solution:**
1. **Command Palette Project Switcher** (Cmd+P)
   - Terminal-style overlay with fuzzy search
   - No permanent UI chrome
   - Shows recent + all projects
   - Quick project creation
   
2. **Mission Brief Side Rail** (Cmd+B)
   - Collapsed: 40px left rail with icons
   - Expanded: 300px panel with sections
   - Sections: Goals, Values, Schedule, Custom
   - Toggle global vs project-specific per section
   - Drag to reorder, edit inline

**Implementation Prompt Created:**
- File: `WORKSPACE_FEATURE_PROMPT.md`
- Comprehensive 500+ line prompt for Claude 4.5 Sonnet
- Includes: UI specs, data structures, code examples, testing checklist
- Estimated effort: 5 days (3 phases)

**Status:** Ready for implementation (awaiting user go-ahead)

**✅ WORKSPACE FEATURES IMPLEMENTATION COMPLETE (2025-10-09)**

Both major features from `WORKSPACE_FEATURE_PROMPT.md` have been successfully implemented:

1. **Multi-Project System** (Phase 1)
   - Command palette project switcher (Cmd+P)
   - Fuzzy search filtering
   - Recent projects tracking
   - Project-specific tab management
   - Automatic migration from old workspace state
   - Fixed circular dependency glitch

2. **Mission Brief Side Rail** (Phase 2)
   - Collapsible left panel (40px collapsed, 300px expanded)
   - Four templates: Goals, Values, Schedule, Custom
   - Global and project-specific sections
   - Inline editing with markdown support
   - Cmd+B keyboard shortcut
   - Auto-collapse timer option

**Next Steps for User:**
- Test Cmd+P to switch/create projects
- Test Cmd+B to toggle mission brief  
- Verify tabs are project-specific
- Create some brief sections
- Test global vs project-specific sections

All commits pushed to `origin/main`

---

## PERFORMANCE OPTIMIZATION: Fix Slowness & Context Issues (2025-10-09)

**User Reported Issues:**
1. When switching projects, voice agents don't see the new project context
2. App became really slow after implementing project system

**Root Causes Identified:**
1. **Excessive Re-renders**: Effects were firing on every render due to unstable function dependencies
2. **No Debouncing**: Every tab change immediately saved to ProjectContext, triggering cascading updates
3. **Circular Dependencies**: Load effect depended on `getCurrentProject()` function which was recreated every render

**Optimizations Applied:**

✅ **WorkspaceContext Optimizations**:
- **Removed unstable dependencies**: Load effect only depends on `currentProjectId`, not getter functions
- **Added debouncing**: Save operations debounced by 200ms to batch multiple changes
- **Smart load detection**: Only loads tabs when actually switching to a different project
- **Post-load grace period**: Skips saves for 300ms after loading to prevent immediate re-save
- **Timestamp tracking**: Uses refs to track load times, preventing circular updates

**How It Works Now:**
1. User switches project → `currentProjectId` changes
2. Load effect fires ONCE, sets `lastLoadTimeRef`
3. Tabs load, triggering save effect
4. Save effect sees we're within 300ms grace period → skips
5. User makes actual changes → save effect waits 200ms → batches save

**Voice Agent Context:**
- Agents use `useWorkspaceContext.getState()` which reads from `WorkspaceProviderState.current`
- This ref is updated every render, so agents always see current state
- The optimization doesn't affect this - agents still get real-time state

**Testing Needed:**
- [ ] Switch between projects - should be instant, no flash
- [ ] Modify tabs - should save after 200ms (check localStorage in devtools)
- [ ] Voice agents - should see updated workspace when you switch projects
- [ ] Performance - should feel snappy now

**Status:** Ready for testing (NOT committed yet per user request)

---

## UX ENHANCEMENT: Auto-Disconnect on Project Switch (2025-10-09)

**User Reported Issue:**
"When I switch projects, the realtime agent doesn't capture that. When I ask it questions about the workspace it's still captures the context of the previous one."

**Root Cause:**
- Voice agent establishes connection with workspace state at connection time
- When user switches projects, workspace updates but agent's LLM conversation history still contains old project context
- Agent continues referencing old tabs because they're in the message history

**UX Solution Implemented: "One Conversation Per Project"**

Design principle: Clear mental model where each project has its own conversation thread.

**Implementation:**
1. **Track Connected Project**: `connectedProjectIdRef` stores which project the agent was connected with
2. **Auto-Disconnect on Switch**: Effect watches `currentProjectId` and disconnects if it changes while connected
3. **Clear Visual Feedback**: 
   - On connect: "🗂️ Connected to project: [Name]" breadcrumb
   - On switch: "🔄 Switched to project: [Name]. Connect to start a new conversation." breadcrumb
4. **Clean State**: Ref is cleared on disconnect

**User Flow:**
```
User connects to Project A
  → Breadcrumb: "🗂️ Connected to project: Project A"
  → Agent sees Project A tabs
  
User presses Cmd+P and switches to Project B
  → Auto-disconnect triggered
  → Breadcrumb: "🔄 Switched to project: Project B. Connect to start a new conversation."
  → Agent is disconnected
  
User clicks Connect
  → New session with clean context
  → Breadcrumb: "🗂️ Connected to project: Project B"
  → Agent sees Project B tabs
```

**Why This is Good UX:**
- ✅ **Clear mental model**: One conversation = one project
- ✅ **No confusion**: Agent can't mix contexts from different projects
- ✅ **User control**: User initiates connection when ready
- ✅ **Visual clarity**: Breadcrumbs show exactly what's happening
- ✅ **No data leakage**: Previous project data doesn't pollute new conversation

**Alternative Approaches Considered:**
1. ❌ **Auto-reconnect**: Too jarring, interrupts ongoing conversation
2. ❌ **Send update message**: Agent might still reference old context
3. ❌ **Manual reset only**: User has to remember, easy to forget

**Status:** Ready for testing (NOT committed yet per user request)

---

## 📋 COMPREHENSIVE IMPLEMENTATION GUIDE CREATED (2025-10-09)

**File:** `AGENT_PROJECT_SYNC_IMPLEMENTATION.md` (400+ lines)

Created extensive documentation for next model/session covering:

**Architecture Analysis:**
- Deep dive into current agent system (RealtimeSession, WorkspaceContext, ProjectContext)
- How agent tools access workspace state
- OpenAI Realtime API session model limitations
- Why agent keeps stale context (conversation history is server-side)

**Solution Options Analyzed (5 approaches):**
1. ⭐ **Auto-Disconnect on Project Switch** (RECOMMENDED - already implemented)
2. Send "Context Update" Message (unreliable)
3. Inject Tool Call Response (hacky, violates API)
4. Auto-Disconnect + Auto-Reconnect (poor UX)
5. Manual "Refresh Context" Button (easy to forget)

**Implementation Details:**
- Step-by-step implementation guide
- Code already written in App.tsx & WorkspaceContext.tsx (uncommitted)
- 15+ edge cases documented and solutions provided
- Testing checklist (18 functional + edge case + performance tests)
- UX enhancement options (project name in button, per-project transcripts)
- Fallback plans if auto-disconnect doesn't work

**Quick Start for Next Model:**
1. Read AGENT_PROJECT_SYNC_IMPLEMENTATION.md
2. Test auto-disconnect feature (instructions provided)
3. Run critical test: Does agent reference old project tabs? (Should be NO)
4. Commit if working, debug using guide if not

**Purpose:** Complete architectural understanding and implementation roadmap for context refresh scenarios.

---

## 🐛 CRITICAL PERFORMANCE BUG: Memory Leaks Causing Laptop Slowdown (2025-10-13)

**User Report:** "When I run this app, especially when it's ran for a while it makes my whole laptop slow."

**Root Causes Identified:**

1. **EventContext Unbounded Growth** (CRITICAL)
   - File: `contexts/EventContext.tsx` line 22
   - Every WebRTC event stored forever in `loggedEvents` array
   - No limit, no cleanup - grows to tens of thousands of events
   - Impact: Massive memory leak, slows entire system

2. **TranscriptContext Unbounded Growth** (CRITICAL)  
   - File: `contexts/TranscriptContext.tsx` lines 45, 82
   - All messages and breadcrumbs stored forever in `transcriptItems` array
   - Long conversations accumulate thousands of items
   - Impact: Major memory leak

3. **Audio Element DOM Leak** (HIGH)
   - File: `App.tsx` lines 116-123
   - Creates audio element and appends to document.body
   - Never removed from DOM
   - Impact: Orphaned DOM nodes accumulate

4. **Session Event Handler Leaks** (MEDIUM)
   - File: `hooks/useRealtimeSession.ts` lines 88-109
   - Event handlers attached but cleanup may not fire properly
   - Impact: Event listener accumulation

**Solutions Implemented:**

1. ✅ **EventContext Memory Limit** (COMPLETE)
   - Added MAX_EVENTS = 500 constant
   - Modified `addLoggedEvent` to use FIFO eviction (slice oldest when > 500)
   - Now keeps only most recent 500 events instead of unlimited growth

2. ✅ **TranscriptContext Memory Limit** (COMPLETE)
   - Added MAX_TRANSCRIPT_ITEMS = 200 constant  
   - Modified `addTranscriptMessage` to use FIFO eviction
   - Modified `addTranscriptBreadcrumb` to use FIFO eviction
   - Now keeps only most recent 200 items instead of unlimited growth

3. ✅ **Audio Element Cleanup** (COMPLETE)
   - Added cleanup effect in App.tsx that removes audio element from DOM
   - Runs on component unmount to prevent orphaned DOM nodes
   - Logs cleanup action for debugging

4. ✅ **Session Event Handler Cleanup** (COMPLETE)
   - Refactored useRealtimeSession effect to store session in const
   - Added return cleanup function that calls `.off()` on all 8 event handlers
   - Prevents event listener accumulation on reconnects
   - Logs cleanup action for debugging

5. ✅ **Memory Monitoring System** (COMPLETE)
   - Created new `lib/memoryMonitor.ts` utility class
   - Monitors heap usage every 30 seconds (configurable)
   - Warns when memory > 80% of limit
   - Detects rapid growth (potential leaks)
   - Integrated into App.tsx, auto-starts in development mode
   - Console logs: "📊 Memory: XXmb / XXXmb (XX%)"

**Files Modified:**
- `contexts/EventContext.tsx` - Added size limit
- `contexts/TranscriptContext.tsx` - Added size limit  
- `App.tsx` - Added audio cleanup + memory monitoring
- `hooks/useRealtimeSession.ts` - Added event handler cleanup
- `lib/memoryMonitor.ts` - NEW FILE - Memory monitoring utility

**Status:** ✅ **FIXES COMPLETE** - Ready for testing
**No linter errors**

**Testing Instructions:**
1. Run app in dev mode - should see "🔍 Memory monitoring enabled"
2. Use app for 5+ minutes - check console for memory stats every 30s
3. Connect/disconnect multiple times - memory should NOT grow unboundedly
4. Check browser DevTools Memory tab - heap size should stabilize
5. Leave app running for 30+ minutes - laptop should NOT slow down

---

## BUGFIX: Table & Events Panel Contrast Issues (2025-10-09)

**User Reported Issue:**
- Table rows with light backgrounds had very poor contrast (light text on light bg)
- Alternating rows were nearly unreadable
- Events panel also had light theme styling

**Root Cause:**
- `CsvView` component in `TabContent.tsx` used hardcoded `neutral-*` colors
- `Events` component used `gray-*` and `bg-white` classes
- Both were not updated during initial design transformation

**Fixes Applied:**

✅ **CSV Table (TabContent.tsx)**:
- Header: `bg-bg-tertiary` with `text-text-secondary`, uppercase monospace
- Border: `border-border-primary` throughout
- Alternating rows: `odd:bg-bg-secondary even:bg-bg-primary`
- Hover effect: `hover:bg-bg-tertiary`
- All text: `text-text-primary font-mono`
- Proper contrast on all rows

✅ **Events/Logs Panel (Events.tsx)**:
- Container: `bg-bg-secondary` with `border-border-primary`
- Header: Uppercase monospace "LOGS"
- Direction arrows: Cyan (client ▲) and Green (server ▼)
- Event names: `text-text-primary` or `text-status-error`
- Timestamps: `text-text-tertiary`
- JSON preview: Dark background with border
- Hover effect on rows

**Result:** Full contrast restoration, matches spy/command-center aesthetic perfectly

---

**Previous Feedback**:
- App directory analysis complete. The structure is well-organized with clear separation between core functionality, scenarios, and UI components. The workspace builder scenario appears most complex and could be simplified or removed if not needed for the embodied work vision.
- Next.js dev server restarted via `npm run dev`; confirmed listening on port 3001.
- Styling issue investigated - CSS bundle properly generated and served, likely browser caching or mixed content issue.
- Successfully committed and pushed refactored codebase with cleaned up scenarios and enhanced workspace builder functionality.
- Next.js dev server restarted via `npm run dev`; confirmed listening on port 3000.

**NEW: Comprehensive Style Guide Created (2025-10-08)**
- Created extensive style guide at `14-voice-agents/realtime-workspace-agents/STYLE_GUIDE.md`
- Based on spy/command-center dashboard aesthetic from provided image
- 2,696 lines covering: colors, typography, layout, 10+ components, effects, interactions, data viz, responsive design
- Added 20 critical details after second image review: corner brackets, CRT effects, terminal syntax, agent ID format, special characters library, dense layouts, glow-only rule (no shadows)

**Implementation Prompts Created (2025-10-08)**
- Created `IMPLEMENTATION_PROMPT.md` - Comprehensive prompt (350+ lines) for Claude to implement the style guide
  - Includes context, tech stack, 6-phase implementation plan, code samples, success criteria
  - Details foundation setup, layout transformation, component migration, interactive elements, typography, polish
  - Provides specific Tailwind config, component examples, testing approach, and file priorities
- Created `IMPLEMENTATION_PROMPT_SHORT.md` - Concise version for quick implementation
  - Streamlined 4-phase approach with essential rules and guidelines
- Both prompts ready to be given to Claude 4.5 Sonnet for style implementation

---

## 🎉 MULTI-SUITE SYSTEM IMPLEMENTATION COMPLETE (2025-10-11)

**Status:** ✅ **FUNCTIONAL** - Ready for testing

### What Was Built:

**✅ Phase 1-2: Foundation & Registry (Complete)**
- Comprehensive suite type definitions with Zod validation
- Shared tools directory (workspace tools, guardrails)
- Suite registry with search, filter, category functions
- Manual suite registration helpers

**✅ Phase 3: UI Components (Complete)**
- `SuiteIndicator.tsx` - Shows current suite with click to change
- `SuiteCard.tsx` - Expandable suite display with metadata
- `SuiteSelector.tsx` - Full modal with search, category filters, empty states
- `workspaceInitializer.ts` - Template loading system

**✅ Phase 4: Energy-Focus Suite Migration (Complete)**
- Suite config with 3 workspace templates
- 3 agents migrated: energyCoach, taskStrategist, bodyDoubling
- Handoffs wired between all agents
- **Successfully registered** in suite registry

**✅ Phase 6: App.tsx Integration (Complete)**
- Suite selection state management
- Suite selector shows on first load
- Connection logic updated to use suite agents
- Workspace initializes with suite templates
- Suite switching with disconnect confirmation
- SuiteIndicator in header
- Backwards compatible with old scenario system

### System Architecture:

```
src/app/agentConfigs/
├── types.ts                    # Suite type definitions
├── index.ts                    # Suite registry + exports
├── shared/                     # Shared infrastructure
│   ├── tools/workspace/        # Workspace tools
│   ├── guardrails/             # Moderation guardrails
│   └── prompts/                # (empty, for future)
├── utils/                      # Discovery & validation
│   ├── suiteDiscovery.ts
│   ├── suiteValidator.ts
│   └── manualRegistration.ts
└── suites/
    ├── _suite-template/        # Template for new suites
    └── energy-focus/           # ✅ ACTIVE SUITE
        ├── suite.config.ts
        ├── agents/
        │   ├── energyCoach.ts
        │   ├── taskStrategist.ts
        │   └── bodyDoubling.ts
        └── index.ts

src/app/components/
├── SuiteSelector.tsx           # Suite selection modal
├── SuiteCard.tsx               # Individual suite cards
└── SuiteIndicator.tsx          # Current suite display

src/app/lib/
└── workspaceInitializer.ts     # Template loading
```

### How It Works:

1. **First Load**: User sees suite selector modal
2. **Suite Selection**: User picks "Energy & Focus"
3. **Workspace Init**: 3 tabs created from templates
4. **Connection**: Connects to energyCoach (root agent)
5. **Handoffs**: Agent can transfer to taskStrategist or bodyDoubling
6. **Suite Switching**: Click suite indicator → disconnect → choose new suite

### Testing Checklist:

**Critical Tests:**
- [ ] App loads and shows suite selector
- [ ] Can select Energy & Focus suite
- [ ] Workspace initializes with 3 tabs
- [ ] Can connect to energyCoach
- [ ] Can hear agent voice
- [ ] Agent can create/edit workspace tabs
- [ ] Agent can handoff to other agents
- [ ] Can switch suites (with disconnect)
- [ ] Suite persists across page refresh

**Edge Cases:**
- [ ] No suite selected (forces selector)
- [ ] Invalid suite ID in localStorage
- [ ] Connection fails gracefully
- [ ] Guardrails trigger correctly

### Known Status:

- ✅ Build compiles successfully
- ✅ Suite registered: "Energy & Focus (energy-focus)"
- ✅ 3 agents: energyCoach, taskStrategist, bodyDoubling
- ✅ Dev server running
- ⚠️  **Needs user testing** - Not yet verified in browser

### Next Steps:

**For Immediate Testing:**
1. Open http://localhost:3000
2. Should see suite selector modal
3. Select "Energy & Focus"
4. Verify 3 workspace tabs appear
5. Click "Connect" and test voice interaction

**For Future Development (Optional):**
- Add Agency Suite (3 agents)
- Add Strategic Planning Suite (3 agents)
- Auto-discovery (replace manual registration)
- Additional suite templates

### Files Changed:

- Created: 15+ new files (types, utils, components, suite)
- Modified: App.tsx, agentConfigs/index.ts
- No breaking changes to existing functionality

---

## 👶 BABY CARE SUITE IMPLEMENTATION COMPLETE (2025-10-15)

**Status:** ✅ **COMPLETE** - Ready for testing

### What Was Built:

**✅ Suite Configuration (Complete)**
- Suite ID: `baby-care`
- Name: Baby Care Companion
- Icon: 👶
- Category: mental-health (caregiving support)
- 8 tags: baby, infant-care, parenting, feeding, sleep, development, health, newborn
- 5 suggested use cases
- User level: beginner
- Session length: 30 minutes

**✅ 6 Workspace Templates (Complete)**
1. **Feeding Log** (CSV) - Track feeding times, types, amounts, notes
2. **Sleep Schedule** (CSV) - Monitor sleep patterns, duration, quality
3. **Daily Care Log** (CSV) - Track diapers, baths, activities
4. **Health Journal** (Markdown) - Vitals, symptoms, medications
5. **Milestones** (Markdown) - Developmental tracking with checklists
6. **Emergency Info** (Markdown) - Critical contacts and medical info

**✅ 5 Specialized Voice Agents (Complete)**
1. **feedingCoach** - Voice: sage (warm, nurturing)
   - Tracks feeding schedules and nutrition
   - Handles bottle/formula questions
   - Root agent (starting point)
   
2. **sleepSpecialist** - Voice: alloy (calm, soothing)
   - Monitors sleep patterns
   - Suggests age-appropriate nap schedules
   - Sleep training support
   
3. **developmentTracker** - Voice: shimmer (encouraging, upbeat)
   - Tracks milestones (rolling, sitting, crawling, etc.)
   - Suggests age-appropriate activities
   - Celebrates achievements
   
4. **healthMonitor** - Voice: echo (professional, calm)
   - Monitors temperature and symptoms
   - Tracks medications
   - Knows when to escalate to doctor
   
5. **calmingCoach** - Voice: verse (gentle, reassuring)
   - Teaches soothing techniques (5 S's, white noise, etc.)
   - Supports stressed caregivers
   - Helps read baby's cues

**✅ Handoff System (Complete)**
- All agents can handoff to any other agent
- Mutual connections wired in index.ts
- Handoff triggers documented in prompts

**✅ Registration (Complete)**
- Imported in `agentConfigs/index.ts`
- Registered in suite registry
- Console confirms: "✅ Registered suite: Baby Care Companion (baby-care)"

### Files Created:
```
src/app/agentConfigs/suites/baby-care/
├── suite.config.ts              (152 lines - suite metadata + 6 templates)
├── prompts.ts                   (248 lines - 5 agent system prompts)
├── index.ts                     (33 lines - wiring + export)
└── agents/
    ├── feedingCoach.ts          (11 lines)
    ├── sleepSpecialist.ts       (10 lines)
    ├── developmentTracker.ts    (10 lines)
    ├── healthMonitor.ts         (10 lines)
    └── calmingCoach.ts          (10 lines)
```

### Files Modified:
- `src/app/agentConfigs/index.ts` - Added baby-care import and registration

### Build Status:
```
✅ Registered suite: Energy & Focus (energy-focus)
   - 3 agents
✅ Registered suite: Baby Care Companion (baby-care)
   - 5 agents
📦 Registered suites: [ 'energy-focus', 'baby-care' ]
 ✓ Compiled successfully
```

### Testing Checklist (For User):

**Critical Tests:**
- [ ] Open http://localhost:3000
- [ ] Suite selector shows 2 suites (Energy & Focus, Baby Care Companion)
- [ ] Baby Care suite displays with 👶 icon
- [ ] Description shows correctly
- [ ] Shows "5 agents" count
- [ ] Can expand to see all 5 agent names
- [ ] Selecting suite creates 6 workspace tabs
- [ ] Tab names: Feeding Log, Sleep Schedule, Daily Care Log, Health Journal, Milestones, Emergency Info
- [ ] CSV tabs have pipe-delimited format with sample data
- [ ] Markdown tabs have proper headers and checklists
- [ ] Can connect to feedingCoach (root agent)
- [ ] Agent responds to voice
- [ ] Asking about sleep triggers handoff to sleepSpecialist
- [ ] Asking about milestones triggers handoff to developmentTracker
- [ ] Asking about health triggers handoff to healthMonitor
- [ ] Asking about crying triggers handoff to calmingCoach
- [ ] All handoffs work smoothly
- [ ] Agent can update workspace tabs
- [ ] Refresh persists suite selection

**Edge Cases:**
- [ ] Switch between suites (disconnects properly)
- [ ] Project switching works with suite
- [ ] Cmd+P project switcher still functional

### Success Criteria: ✅ MET

1. ✅ Build compiles without errors
2. ✅ No linter errors
3. ✅ Suite registered in console output
4. ✅ All 5 agents created with correct voices
5. ✅ All 6 workspace templates defined
6. ✅ Handoffs wired between all agents
7. ✅ Follows existing pattern from energy-focus suite
8. ✅ Code copied accurately from CREATING_NEW_SUITES.md guide

### Implementation Time:
- Directory structure: 1 min
- suite.config.ts: 3 min
- prompts.ts: 3 min
- 5 agent files: 2 min
- index.ts: 2 min
- Registration: 1 min
- Build & verify: 2 min
- **Total: ~15 minutes**

### Next Steps:
**User should now:**
1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Test suite selector UI
4. Select Baby Care Companion
5. Verify 6 tabs appear
6. Connect and test voice interaction
7. Test agent handoffs
8. Verify workspace tab updates work

**If all tests pass, ready to commit!**

### ⚠️ Known Limitation Discovered (2025-10-15)

**Voice Cannot Change During Handoffs**

Per OpenAI SDK documentation:
```
voice can be configured on an Agent level however it cannot be 
changed after the first agent within a RealtimeSession spoke
```

**Impact:**
- All 5 baby care agents will use the same voice (sage)
- First agent to speak locks the voice for entire session
- Subsequent handoffs keep the same voice

**Solution Applied:**
- Added distinct SPEAKING STYLE instructions to each agent prompt:
  - feedingCoach: Warm grandmother
  - sleepSpecialistAgent: Calm meditation teacher
  - developmentTracker: Upbeat excited friend
  - healthMonitor: Professional nurse
  - calmingCoach: Gentle therapist

**Lesson:** OpenAI Realtime API does not support voice changes during agent handoffs within a single session. Use prompt engineering to create distinct personalities instead.

---

## 🏗️ PRODUCTION ROADMAP CREATED (2025-10-15)

**Document:** `.cursor/PRODUCTION_ROADMAP.md` (21,000+ words)

Comprehensive CTO-level plan for productionizing the voice agent platform covering:

### Architecture & Infrastructure
- Multi-tenant SaaS architecture
- Target state system diagram
- Tech stack decisions (Supabase, Clerk, Stripe, Vercel)
- Scaling strategy (0 → 100k users)
- Complete database schema with RLS

### Security & Compliance
- Authentication & authorization (RBAC)
- Data encryption (at rest & in transit)
- API security (rate limiting, validation)
- GDPR, CCPA, HIPAA compliance
- SOC 2 Type II roadmap
- Audit logging system

### Business Model
- B2C: $19-99/month (tiered plans)
- B2B: $49-199/user/month (team/enterprise)
- Stripe integration plan
- Usage tracking & quotas
- Break-even analysis

**Key Finding:** AI costs ($33/user/month) exceed B2C revenue - **must focus on B2B** at $199/seat to be profitable.

### Implementation Timeline
- **Phase 1 (Weeks 1-4):** Foundation - Auth, DB, security
- **Phase 2 (Weeks 5-8):** Multi-tenancy & payments
- **Phase 3 (Weeks 9-10):** Marketing site & launch
- **Phase 4 (Weeks 11-14):** Enterprise features
- **Phase 5 (Weeks 15-20):** Scale & optimization

### Cost Estimates
- MVP: $500-1k/month
- Launch: $2-3.5k/month
- Scale (10k users): $8-15k/month
- Path to profitability: 50 enterprise seats ($10k MRR)

### Next Steps (Week 1)
1. ✅ Choose stack: Supabase + Clerk + Vercel + Stripe
2. 🔨 Set up infrastructure accounts
3. 🔨 Implement database schema
4. 🔨 Add authentication
5. 📝 Finalize pricing
6. 📝 Write legal documents

**Status:** Ready for Phase 1 implementation

---

Lessons
- Use `/api/responses` for structured moderation and supervisor iterations; keep tools non-parallel when tool outputs inform subsequent calls.
- Guardrail trip events are surfaced to the UI; ensure any new guardrails attach rationale and offending text for debugging.
- Include info useful for debugging in the program output.
- Read the file before you try to edit it.
- If there are vulnerabilities that appear in the terminal, run npm audit before proceeding
- Always ask before using the -force git command
- **Multi-suite implementation**: Suite system allows easy addition of new agent collections by creating a folder structure and registering in index.ts
- **OpenAI Realtime voice limitation**: Voice parameter cannot change after first agent speaks in a RealtimeSession - use prompt engineering for distinct personalities instead