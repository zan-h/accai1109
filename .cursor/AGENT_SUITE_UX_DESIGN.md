# Agent Suite System - UX Design & User Experience
**User-Centered Design for Multi-Agent Voice Assistant Selection**

---

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [User Personas](#user-personas)
3. [User Journey Maps](#user-journey-maps)
4. [UI/UX Flows](#uiux-flows)
5. [Detailed Screen Designs](#detailed-screen-designs)
6. [Interaction Patterns](#interaction-patterns)
7. [Onboarding Experience](#onboarding-experience)
8. [Edge Cases & Error States](#edge-cases--error-states)
9. [Mobile Experience](#mobile-experience)
10. [Accessibility](#accessibility)
11. [Microinteractions & Delight](#microinteractions--delight)
12. [User Testing Scenarios](#user-testing-scenarios)

---

## Design Philosophy

### Core Principles

1. **Clarity Over Cleverness**
   - Users should immediately understand what each suite does
   - No jargon - use plain language
   - Show, don't just tell (preview agents, use cases)

2. **Low Friction, High Value**
   - Get to conversation in 2 clicks
   - Suite selection is fast but informed
   - Easy to switch if choice wasn't right

3. **Progressive Disclosure**
   - Show essential info first (name, icon, description)
   - Expand to details on demand (agents, use cases)
   - Deep dive available but optional

4. **Voice-First Design**
   - Design assumes users will talk, not type
   - Visual UI is supportive, not primary
   - Clear audio feedback states

5. **Trust Through Transparency**
   - Always show which suite is active
   - Show which agent is speaking
   - Make handoffs visible and understandable

### Design Values

- **Approachable**: Not intimidating despite complexity
- **Responsive**: Immediate feedback to all interactions
- **Forgiving**: Easy to undo, switch, restart
- **Empowering**: User controls the experience
- **Beautiful**: Terminal aesthetic but warm

---

## User Personas

### Persona 1: Sarah - The Overwhelmed Professional
**Demographics**: 34, Product Manager, ADHD diagnosis  
**Tech Comfort**: High  
**Pain Points**: Decision fatigue, starting tasks, time blindness  
**Goals**: Get unstuck, build daily routines, feel less scattered  

**User Needs**:
- Quick access to energy/focus support
- Doesn't want to think hard about which suite to use
- Wants suggestions based on time of day
- Values gentle, non-judgmental tone

**Suite Preferences**: 🧘 Energy & Focus, 💼 Executive Function

---

### Persona 2: Marcus - The Aspiring Leader
**Demographics**: 28, Junior Manager, neurotypical  
**Tech Comfort**: Medium  
**Pain Points**: Lacks confidence in decisions, second-guesses himself  
**Goals**: Build leadership skills, make confident choices, strategic thinking  

**User Needs**:
- Help articulating vision and strategy
- Framework for decision-making
- Confidence building through action
- Professional, coaching tone

**Suite Preferences**: 🎯 Agency, 📋 Strategic Planning

---

### Persona 3: Jamie - The Creative Explorer
**Demographics**: 25, Freelance Designer, neurodivergent  
**Tech Comfort**: High  
**Pain Points**: Creative blocks, project planning, client communication  
**Goals**: Stay in flow, organize creative projects, manage business side  
**User Needs**:
- Creative process support
- Help with boring admin stuff
- Energy management for deep work
- Flexible, adaptive support

**Suite Preferences**: 🎨 Creative Flow (future), 🧘 Energy & Focus, 📋 Strategic Planning

---

### Persona 4: Dr. Chen - The Academic Researcher
**Demographics**: 42, University Professor  
**Tech Comfort**: Medium  
**Pain Points**: Grant writing, paper organization, work-life balance  
**Goals**: Publish more, mentor better, protect time for research  

**User Needs**:
- Long-term planning support
- Writing accountability
- Research organization
- Serious, professional tone

**Suite Preferences**: 📋 Strategic Planning, 💼 Executive Function

---

## User Journey Maps

### Journey 1: First-Time User (Sarah)

#### Phase 1: Arrival (0-30 seconds)
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Sarah opens app for the first time                 │
│  ↓                                                  │
│  [Landing Screen]                                   │
│  • Clean, minimal interface                         │
│  • Single prominent CTA: "Choose Your Support"      │
│  • Brief tagline: "Voice coaching for focused work" │
│  ↓                                                  │
│  Feeling: Curious, slightly uncertain               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Decision**: 
- Don't auto-show suite selector
- Give 2 seconds to orient
- Show friendly prompt: "What kind of support do you need today?"

#### Phase 2: Discovery (30s - 2min)
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Sarah clicks "Choose Your Support"                 │
│  ↓                                                  │
│  [Suite Selector Opens]                             │
│  • Sees 4-5 suite options                          │
│  • Reads descriptions quickly                       │
│  • Notices "Energy & Focus" mentions ADHD           │
│  • Clicks "Learn More" to see agents                │
│  ↓                                                  │
│  Feeling: Relieved (found something relevant)       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Decision**:
- Use inclusive language ("ADHD-friendly" not "for ADHD")
- Show use cases, not just features
- Preview agents without overwhelming detail

#### Phase 3: Selection (2-3min)
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Sarah clicks "Start Session" on Energy & Focus     │
│  ↓                                                  │
│  [Quick Setup]                                      │
│  • "Creating your workspace..."                     │
│  • Shows 3 tabs being created (visual feedback)     │
│  • "Connecting to Energy Coach..."                  │
│  • Audio test: "Can you hear me?"                   │
│  ↓                                                  │
│  Feeling: Anticipation, slight nervousness          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Decision**:
- Show progress, don't just load
- Audio test is friendly, not clinical
- Default to voice-on (but can change)

#### Phase 4: First Interaction (3-5min)
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Energy Coach speaks first]                        │
│  "Hi, I'm here to help you tune into your energy.   │
│   How are you feeling in your body right now?"      │
│  ↓                                                  │
│  Sarah sees:                                        │
│  • Visual: Audio waveform (agent speaking)          │
│  • Transcript appears in real-time                  │
│  • [Push to Talk] button pulses gently              │
│  ↓                                                  │
│  Sarah responds: "I'm really scattered today"       │
│  ↓                                                  │
│  Feeling: Heard, validated, safe to share           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Decision**:
- Agent speaks first (reduces user anxiety)
- First question is open, non-threatening
- Visual feedback confirms audio is working

#### Phase 5: Engagement (5-20min)
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Conversation flows naturally]                     │
│  • Energy Coach creates "Daily Check-in" tab        │
│  • Sarah sees workspace update in real-time         │
│  • Coach hands off to Task Strategist               │
│  • Visual indicator: "Now speaking: Task Strategist"│
│  ↓                                                  │
│  Sarah thinks: "Oh, this is actually helpful"       │
│  ↓                                                  │
│  Feeling: Engaged, supported, productive            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Decision**:
- Workspace changes are visible but not disruptive
- Handoffs are announced visually + audibly
- User can see progress (tabs filling up)

#### Phase 6: Completion (20-25min)
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Sarah says: "I think I'm good for now"             │
│  ↓                                                  │
│  [Agent offers gentle closure]                      │
│  "You've made great progress. Come back anytime."   │
│  ↓                                                  │
│  [Disconnect with confirmation]                     │
│  • "Session saved"                                  │
│  • "You created 3 tabs and broke down 5 tasks"      │
│  • Option: "Book next session" (calendar reminder)  │
│  ↓                                                  │
│  Feeling: Accomplished, clear on next steps         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Decision**:
- Session summary shows value delivered
- Closure is affirming, not abrupt
- Easy to return (save suite preference)

---

### Journey 2: Returning User Switching Suites (Marcus)

#### Context
Marcus used Agency Suite yesterday. Today he needs strategic planning help.

```
┌─────────────────────────────────────────────────────┐
│  Marcus opens app                                   │
│  ↓                                                  │
│  [Auto-loads last suite: Agency]                    │
│  Header shows: "🎯 Agency & Autonomy"               │
│  ↓                                                  │
│  Marcus thinks: "I need planning help today"        │
│  ↓                                                  │
│  Clicks suite indicator in header                   │
│  ↓                                                  │
│  [Suite Selector - But Smarter]                     │
│  • Recent suites shown at top                       │
│  • "You used Agency Suite yesterday"                │
│  • Suggested: "Try Strategic Planning for..."       │
│  ↓                                                  │
│  Marcus clicks Strategic Planning                   │
│  ↓                                                  │
│  [Quick Switch]                                     │
│  • "Switching to Strategic Planning..."             │
│  • Workspace adapts (new template tabs)             │
│  • Connects to Vision Mapper agent                  │
│  • Smooth transition < 3 seconds                    │
│  ↓                                                  │
│  Feeling: Empowered, in control                     │
└─────────────────────────────────────────────────────┘
```

**Design Decision**:
- Remember recent suites (show history)
- Suggest related suites intelligently
- Make switching feel lightweight, not destructive

---

## UI/UX Flows

### Flow 1: Initial Suite Selection

```
START
  │
  ├─> First Time User
  │     │
  │     ├─> Show Welcome Screen (2s)
  │     │   "Welcome! Let's find the right support for you"
  │     │
  │     └─> Open Suite Selector Automatically
  │
  └─> Returning User
        │
        ├─> Auto-load last used suite
        │
        └─> Show subtle prompt: "Continue with [Suite] or switch?"

SUITE SELECTOR OPENED
  │
  ├─> Browse Mode (Default)
  │     │
  │     ├─> See all suites (cards view)
  │     ├─> Can scroll, filter by category
  │     └─> Click "Learn More" to expand
  │
  ├─> Search Mode
  │     │
  │     ├─> Type in search box
  │     ├─> Filter by name, tags, description
  │     └─> Results update in real-time
  │
  └─> Suggested Mode (If returning user)
        │
        ├─> Show "Based on your history..."
        ├─> Show "People also use..."
        └─> Quick actions: "Continue last session"

SUITE SELECTION MADE
  │
  ├─> Show Loading State
  │     │
  │     ├─> "Preparing workspace..."
  │     ├─> "Connecting to [Agent Name]..."
  │     └─> Progress indicator (3-5s)
  │
  ├─> Initialize Workspace
  │     │
  │     ├─> Create tabs from templates
  │     ├─> Show tabs appearing one by one
  │     └─> Visual: "✓ 3 tabs created"
  │
  └─> Connect to Root Agent
        │
        ├─> Audio test: "Hello, can you hear me?"
        ├─> User can respond or click "I can hear you"
        └─> Agent begins conversation

CONVERSATION ACTIVE
  │
  └─> User can:
      ├─> Talk via voice
      ├─> Type text message
      ├─> View transcript
      ├─> Switch agents (via handoff)
      ├─> Change suite (via header)
      ├─> Disconnect
      └─> Pause/resume

END
```

---

## Detailed Screen Designs

### Screen 1: Landing / Welcome Screen (First Time Users Only)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                                                                │
│                                                                │
│                         🎙️ VoiceCoach                          │
│                                                                │
│              Voice-powered support for focused work            │
│                                                                │
│                                                                │
│                  ┌──────────────────────────┐                 │
│                  │                          │                 │
│                  │  Choose Your Support  →  │                 │
│                  │                          │                 │
│                  └──────────────────────────┘                 │
│                                                                │
│                                                                │
│            "What kind of help do you need today?"              │
│                                                                │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Interactions**:
- Button hover: Cyan glow effect
- Button click: Opens suite selector
- Auto-dismiss after 5s if no interaction → go to suite selector

---

### Screen 2: Suite Selector (Desktop View)

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐             │
│  │  Select Your Support Suite                                  [×] │             │
│  └─────────────────────────────────────────────────────────────────┘             │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐             │
│  │  🔍  Search suites by name or what you need help with...        │             │
│  └─────────────────────────────────────────────────────────────────┘             │
│                                                                                   │
│  [All] [Productivity] [Coaching] [Planning] [Mental Health] [Learning] [Creative]│
│   ^^                                                                              │
│  Active                                                                           │
│                                                                                   │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐             │
│  │ 🎯                           │  │ 📋                           │             │
│  │                              │  │                              │             │
│  │ Agency & Autonomy            │  │ Strategic Planning           │             │
│  │                              │  │                              │             │
│  │ Build decision-making        │  │ Long-term vision, priorities,│             │
│  │ confidence and strengthen    │  │ and execution roadmaps       │             │
│  │ your sense of personal agency│  │                              │             │
│  │                              │  │                              │             │
│  │ [autonomy] [confidence]      │  │ [planning] [strategy]        │             │
│  │ [decision-making]            │  │ [execution]                  │             │
│  │                              │  │                              │             │
│  │ ┌────────────┐ ┌───────────┐│  │ ┌────────────┐ ┌───────────┐│             │
│  │ │Learn More  │ │   Start   ││  │ │Learn More  │ │   Start   ││             │
│  │ └────────────┘ └───────────┘│  │ └────────────┘ └───────────┘│             │
│  └──────────────────────────────┘  └──────────────────────────────┘             │
│                                                                                   │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐             │
│  │ 🧘                           │  │ 💼                           │             │
│  │                              │  │                              │             │
│  │ Energy & Focus               │  │ Executive Function           │             │
│  │                              │  │                              │             │
│  │ Body-aware, ADHD-friendly    │  │ Working memory, sequencing,  │             │
│  │ productivity support         │  │ and time perception support  │             │
│  │                              │  │                              │             │
│  │ [adhd] [neurodivergent]      │  │ [executive-function] [memory]│             │
│  │ [energy] [focus]             │  │ [time]                       │             │
│  │                              │  │                              │             │
│  │ ┌────────────┐ ┌───────────┐│  │ ┌────────────┐ ┌───────────┐│             │
│  │ │Learn More  │ │   Start   ││  │ │Learn More  │ │   Start   ││             │
│  │ └────────────┘ └───────────┘│  │ └────────────┘ └───────────┘│             │
│  └──────────────────────────────┘  └──────────────────────────────┘             │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

**Visual Design Details**:
- Modal overlay: 80% opacity dark background
- Modal: Max width 1200px, centered
- Cards: 2x2 grid on desktop, stack on mobile
- Hover state: Card border glows cyan
- Typography: Monospace (JetBrains Mono)
- Spacing: Dense but breathable (16px gaps)

**Interactions**:
- Search: Filters cards in real-time (debounced 300ms)
- Category tabs: Smooth scroll to category
- Learn More: Expands card inline (see next section)
- Start: Closes modal, initializes suite

---

### Screen 3: Suite Card - Expanded State

```
┌──────────────────────────────────────────────────────────────┐
│ 🎯                                                           │
│                                                              │
│ Agency & Autonomy                                            │
│                                                              │
│ Build decision-making confidence and strengthen your         │
│ sense of personal agency                                     │
│                                                              │
│ [autonomy] [confidence] [decision-making] [self-direction]   │
│ [empowerment]                                                │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ AGENTS IN THIS SUITE                                         │
│ • Autonomy Coach - Supports self-direction                   │
│ • Decision Architect - Helps structure complex decisions     │
│ • Confidence Builder - Affirms agency, reduces doubt         │
│                                                              │
│ BEST FOR                                                     │
│ • Feeling stuck and need help taking action                  │
│ • Struggling with decision fatigue                           │
│ • Want to build confidence in your choices                   │
│ • Need support becoming more self-directed                   │
│                                                              │
│ WORKSPACE TOOLS                                              │
│ • Agency Journal for tracking growth                         │
│ • Decision Matrix for weighing options                       │
│ • Values Alignment checker                                   │
│                                                              │
│ ⏱️  Typical session: 30 minutes                             │
│ 📊 Difficulty: Beginner friendly                             │
│                                                              │
│ ┌────────────────┐ ┌─────────────────────────────────────┐ │
│ │  Hide Details  │ │          Start Session          →   │ │
│ └────────────────┘ └─────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Interactions**:
- Expanded state pushes other cards down
- Can expand multiple cards for comparison
- Hide Details: Collapses back to compact view
- Start Session: Same as compact view

---

### Screen 4: Main App - Active Session

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ┌──────┐  🎯 Agency & Autonomy [▼]        [@] Project: My Work   [⚙️]  [👤]       │
│  │ [≡] │                                                                             │
│  └──────┘  3 agents  •  Autonomy Coach                                              │
│                                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────┐  ┌───────────────────────────────────────────────────────┐        │
│  │             │  │                                                         │        │
│  │ WORKSPACE   │  │  TRANSCRIPT                                   [📋] [⬇] │        │
│  │             │  │                                                         │        │
│  │ Agency      │  │  ┌───────────────────────────────────────────────┐    │        │
│  │ Journal  ✓  │  │  │ [10:32] Now speaking: Autonomy Coach          │    │        │
│  │             │  │  └───────────────────────────────────────────────┘    │        │
│  │ Decision    │  │                                                         │        │
│  │ Matrix      │  │  [Agent] Hi, I'm your Autonomy Coach. I'm here to     │        │
│  │             │  │  help you reconnect with your sense of personal agency.│        │
│  │ Values      │  │  What's a situation where you'd like to feel more      │        │
│  │ Alignment   │  │  self-directed right now?                              │        │
│  │             │  │                                                         │        │
│  │ + Add Tab   │  │  [You] I'm struggling to decide whether to take this   │        │
│  │             │  │  new job opportunity...                                │        │
│  ├─────────────┤  │                                                         │        │
│  │             │  │  [Agent] That's a significant decision. Before we       │        │
│  │ BRIEF       │  │  structure the decision, let me ask: What matters       │        │
│  │             │  │  most to you in your work right now?                   │        │
│  │ 📋 Goals    │  │                                                         │        │
│  │ 💡 Values   │  │  [You] [Currently speaking... 🔴]                      │        │
│  │             │  │                                                         │        │
│  │ + Add       │  │                                                         │        │
│  │             │  │                                                         │        │
│  └─────────────┘  │                                                         │        │
│                   │                                                         │        │
│                   │  ┌──────────────────────────────────────────────┐      │        │
│                   │  │ Type a message...                      [📎]  │      │        │
│                   │  └──────────────────────────────────────────────┘      │        │
│                   └─────────────────────────────────────────────────────────┘        │
│                                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  [🔌 Connected]  [🎙️ Voice Active]  [🎧 Wideband]  [⏸️ Pause]  [🔴 Disconnect]     │
│                                                                                      │
│  ┌──────────────────┐          ┌─────────────────────────────┐                     │
│  │   [🎤 Push to    │          │  "I value growth and..."    │                     │
│  │      Talk]       │          │  ▁▂▃▅▆▇█▇▆▅▃▂▁              │                     │
│  └──────────────────┘          └─────────────────────────────┘                     │
│                                                                                      │
│  [ ] PTT Mode  [x] VAD  [ ] Mute Agent  [ ] Show Events                            │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Visual Hierarchy**:
1. **Header** (most important): Current suite, current agent
2. **Content Area**: Transcript (primary focus) + Workspace (context)
3. **Bottom Toolbar**: Connection status, audio controls

**Color Coding**:
- 🔴 Red: Disconnect, recording active
- 🟢 Green: Connected, all systems go
- 🟡 Yellow: Warnings, guardrail trips
- 🔵 Cyan: Interactive elements, accents

---

### Screen 5: Agent Handoff Visualization

```
┌─────────────────────────────────────────────────────────────┐
│  TRANSCRIPT                                                  │
│                                                              │
│  [Agent: Autonomy Coach]                                     │
│  "...I'm going to hand you off to the Decision Architect     │
│  who can help you structure this choice more clearly."       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🔄 Handoff in progress...                             │ │
│  │                                                         │ │
│  │  Autonomy Coach ────────────────▶ Decision Architect   │ │
│  │                                                         │ │
│  │  Transferring conversation context                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [10:35] Now speaking: Decision Architect              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Agent: Decision Architect]                                 │
│  "Thanks for that context. Let me help you create a          │
│  decision matrix to weigh your options..."                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Animation Sequence**:
1. Previous agent announces handoff
2. Breadcrumb appears with loading state (1s)
3. Arrow animates left to right (1s)
4. New agent name highlights
5. New agent speaks (smooth transition)

**Audio Feedback**:
- Subtle "whoosh" sound during transition
- No silence gap - feels like passing to colleague

---

### Screen 6: Guardrail Trip Visualization

```
┌─────────────────────────────────────────────────────────────┐
│  TRANSCRIPT                                                  │
│                                                              │
│  [Agent: Task Strategist]                                    │
│  "You're being lazy and need to just push through—"          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ⚠️  Content Warning - Agent response blocked           │ │
│  │                                                         │ │
│  │  Category: Unprofessional Language                     │ │
│  │  Reason: Language doesn't match supportive tone        │ │
│  │                                                         │ │
│  │  The agent will try again with a better response.      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Agent: Task Strategist]                                    │
│  "Let me rephrase that. What I'm hearing is that this        │
│  task feels overwhelming. Let's break it down together..."   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Design Decision**:
- Show the guardrail trip (transparency)
- Explain why it was blocked (education)
- Seamless recovery (agent regenerates)
- User doesn't need to do anything

---

## Interaction Patterns

### Pattern 1: "Smart Suggestions"

**Context**: User has been using Agency Suite for 3 sessions this week.

```
┌─────────────────────────────────────────────────────────┐
│  Session Complete!                                      │
│                                                         │
│  You spent 25 minutes with the Agency Suite today.     │
│                                                         │
│  💡 Try Next: Strategic Planning                       │
│                                                         │
│  "Now that you're building confidence in decisions,    │
│  Strategic Planning can help you think long-term."     │
│                                                         │
│  [Explore Strategic Planning] [Maybe Later]            │
└─────────────────────────────────────────────────────────┘
```

**When to Show**:
- After 3+ sessions with same suite
- After completing a natural milestone
- Not more than once per day

---

### Pattern 2: "Quick Switch"

**Context**: User realizes mid-session they need a different suite.

```
User clicks suite indicator in header
  ↓
┌─────────────────────────────────────────────┐
│  Switch Suite                               │
│                                             │
│  ⚠️  Active session will end                │
│                                             │
│  Your workspace will be saved automatically │
│                                             │
│  Continue to suite selector?                │
│                                             │
│  [Go Back] [Switch Suite]                   │
└─────────────────────────────────────────────┘
```

**Design Decision**:
- Confirm before destroying session (prevent accidents)
- Assure workspace is saved (reduce anxiety)
- Make it easy to cancel (forgiving)

---

### Pattern 3: "First-Time Agent Greeting"

**Context**: User connects to an agent for the first time.

```
[Animation: Agent avatar fades in]

Agent: "Hi, I'm [Name], your [Role]. This is my first time 
working with you, so I'd love to understand what brings 
you here today."

[Visual: Friendly, welcoming tone]
[Audio: Warm, not rushed]
```

**Design Decision**:
- Agent identifies self clearly
- Acknowledges it's first time (sets expectations)
- Open question (low pressure start)

---

### Pattern 4: "Energy-Based Suite Suggestions"

**Context**: It's 7am. User opens app.

```
┌─────────────────────────────────────────────────────────┐
│  Good morning! ☀️                                       │
│                                                         │
│  Based on the time (7:00 AM), you might benefit from:  │
│                                                         │
│  🧘 Energy & Focus                                     │
│  "Start your day with an energy check-in"              │
│                                                         │
│  [Start] [Show All Suites]                             │
└─────────────────────────────────────────────────────────┘
```

**Time-Based Suggestions**:
- **Morning (6am-10am)**: Energy & Focus
- **Midday (10am-2pm)**: Strategic Planning
- **Afternoon (2pm-6pm)**: Executive Function, Agency
- **Evening (6pm-10pm)**: Energy & Focus (wind down mode)

---

### Pattern 5: "Workspace Preview"

**Context**: User hovers over a suite card.

```
[Hover state shows preview]

┌────────────────────────────────┐
│  This suite will create:       │
│                                │
│  📝 Agency Journal             │
│  📊 Decision Matrix            │
│  ⚖️  Values Alignment          │
│                                │
│  + You can add more tabs       │
└────────────────────────────────┘
```

**Design Decision**:
- Show what user will get (set expectations)
- Emphasize it's just a starting point
- Reduce uncertainty before commitment

---

## Onboarding Experience

### First-Time User Onboarding (Progressive)

#### Step 1: Welcome (0-5 seconds)
```
┌──────────────────────────────────────────┐
│                                          │
│         Welcome to VoiceCoach            │
│                                          │
│    Voice-powered support for focused     │
│              work and life               │
│                                          │
│         [Get Started] [Learn More]       │
│                                          │
└──────────────────────────────────────────┘
```

#### Step 2: Audio Permissions (5-10 seconds)
```
┌──────────────────────────────────────────┐
│  🎤 Microphone Access                    │
│                                          │
│  VoiceCoach uses your microphone for     │
│  voice conversations with AI coaches.    │
│                                          │
│  Your audio is:                          │
│  ✓ Processed securely                   │
│  ✓ Never stored permanently             │
│  ✓ Only used during active sessions     │
│                                          │
│  [Allow Microphone]                      │
│                                          │
│  You can always use text instead         │
└──────────────────────────────────────────┘
```

#### Step 3: Suite Selection (10-30 seconds)
```
┌──────────────────────────────────────────┐
│  What brings you here today?             │
│                                          │
│  Choose the type of support you need:    │
│                                          │
│  🎯 Building confidence                  │
│  📋 Planning projects                    │
│  🧘 Managing energy/focus                │
│  💼 Executive function support           │
│  🎨 Creative work                        │
│                                          │
│  [See all options...]                    │
└──────────────────────────────────────────┘
```

#### Step 4: Quick Tour (30-60 seconds) - Optional, Skippable
```
┌──────────────────────────────────────────┐
│  Quick Tour (30 seconds)          [Skip] │
│                                          │
│  [1/3] Voice Interaction                 │
│                                          │
│  Talk naturally with your AI coach.      │
│  Push to talk or use voice activation.   │
│                                          │
│  [Visual: Animated demo of PTT button]   │
│                                          │
│  [Next →]                                │
└──────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────┐
│  Quick Tour (30 seconds)          [Skip] │
│                                          │
│  [2/3] Workspace                         │
│                                          │
│  Your coach will create tabs with        │
│  your notes, plans, and progress.        │
│                                          │
│  [Visual: Tabs appearing animation]      │
│                                          │
│  [← Back] [Next →]                       │
└──────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────┐
│  Quick Tour (30 seconds)          [Skip] │
│                                          │
│  [3/3] Agent Handoffs                    │
│                                          │
│  Agents work together. If one can't      │
│  help, they'll introduce you to          │
│  another who can.                        │
│                                          │
│  [Visual: Handoff animation]             │
│                                          │
│  [← Back] [Start Session!]               │
└──────────────────────────────────────────┘
```

#### Step 5: First Session (1-3 minutes)
- Agent speaks first
- Low-pressure opening question
- Celebrates first interaction
- Offers help navigating interface

---

### Contextual Tooltips (Just-in-Time Learning)

**Triggered only when user hovers/focuses on unfamiliar elements:**

```
[User hovers over PTT button]

┌─────────────────────────────────┐
│  💡 Push to Talk                │
│                                 │
│  Hold this button while         │
│  speaking, release when done.   │
│                                 │
│  Tip: You can also use voice    │
│  activation (VAD) in settings.  │
│                                 │
│  [Got it]                       │
└─────────────────────────────────┘
```

**Show once per session**, then remember user saw it.

---

## Edge Cases & Error States

### Error 1: Microphone Permission Denied

```
┌──────────────────────────────────────────────────┐
│  ⚠️  Microphone Access Required                  │
│                                                  │
│  VoiceCoach needs microphone access for voice    │
│  conversations.                                  │
│                                                  │
│  What you can do:                                │
│  • Use text input instead (type messages)        │
│  • Enable microphone in browser settings         │
│  • Check system privacy settings                 │
│                                                  │
│  [Switch to Text Mode] [Enable Microphone]       │
└──────────────────────────────────────────────────┘
```

**Design Decision**:
- Offer alternative (text mode)
- Provide clear instructions
- Don't block the entire experience

---

### Error 2: Connection Failed

```
┌──────────────────────────────────────────────────┐
│  🔌 Connection Failed                            │
│                                                  │
│  We couldn't connect to the AI coach.            │
│                                                  │
│  This might be because:                          │
│  • Your internet connection is unstable          │
│  • The service is temporarily unavailable        │
│  • Your browser blocked the connection           │
│                                                  │
│  [Try Again] [Use Offline Mode] [Get Help]       │
└──────────────────────────────────────────────────┘
```

**Design Decision**:
- Explain possible causes (reduce confusion)
- Offer retry (most likely to work)
- Offer offline mode (graceful degradation)

---

### Error 3: Guardrail Trip Loop (Agent keeps triggering)

```
┌──────────────────────────────────────────────────┐
│  ⚠️  Technical Difficulty                        │
│                                                  │
│  The agent is having trouble responding properly.│
│                                                  │
│  Would you like to:                              │
│  • Try a different agent in this suite           │
│  • Switch to a different suite                   │
│  • Report this issue                             │
│                                                  │
│  [Switch Agent] [Switch Suite] [Report]          │
└──────────────────────────────────────────────────┘
```

**Trigger**: 3+ consecutive guardrail trips from same agent

**Design Decision**:
- Acknowledge something's wrong (transparency)
- Offer concrete alternatives (don't abandon user)
- Allow reporting (help improve system)

---

### Edge Case: Mid-Conversation Suite Switch

**What happens to the conversation history?**

```
┌──────────────────────────────────────────────────┐
│  Switch to Strategic Planning Suite?             │
│                                                  │
│  Your current conversation will end, but your    │
│  workspace will be saved.                        │
│                                                  │
│  The new suite will start fresh - it won't see   │
│  your previous conversation.                     │
│                                                  │
│  💡 Tip: You can return to Agency Suite anytime  │
│  and continue where you left off.               │
│                                                  │
│  [Cancel] [Switch Suite]                         │
└──────────────────────────────────────────────────┘
```

**Design Decision**:
- Be explicit about what's preserved vs. lost
- Offer reassurance (can come back)
- Make it easy to cancel (prevent accidents)

---

### Edge Case: No Suites Match Search

```
┌──────────────────────────────────────────────────┐
│  No suites found for "procrastination help"      │
│                                                  │
│  Suggestions:                                    │
│  • Try "focus" or "task planning"                │
│  • Browse all suites below                       │
│  • Tell us what you need and we'll help         │
│                                                  │
│  [Clear Search] [Request Feature]                │
└──────────────────────────────────────────────────┘
```

**Design Decision**:
- Offer helpful alternatives (don't dead-end)
- Allow feature requests (product feedback loop)
- Show all suites below (user can browse)

---

## Mobile Experience

### Mobile Layout Adaptations

#### Suite Selector (Mobile)

```
┌────────────────────────────┐
│  Select Support        [×] │
├────────────────────────────┤
│  🔍 Search...              │
├────────────────────────────┤
│  [All▼] [Filter]           │
├────────────────────────────┤
│                            │
│  ┌──────────────────────┐ │
│  │ 🎯                   │ │
│  │ Agency & Autonomy    │ │
│  │                      │ │
│  │ Build decision-making│ │
│  │ confidence...        │ │
│  │                      │ │
│  │ [Learn More]         │ │
│  │ [Start Session]      │ │
│  └──────────────────────┘ │
│                            │
│  ┌──────────────────────┐ │
│  │ 📋                   │ │
│  │ Strategic Planning   │ │
│  │ ...                  │ │
│  └──────────────────────┘ │
│                            │
│  [Scroll for more...]     │
│                            │
└────────────────────────────┘
```

**Changes from Desktop**:
- Single column cards
- Cards are taller (more thumb-friendly)
- Category filter is dropdown (saves space)
- Search is always visible at top

---

#### Active Session (Mobile)

```
┌────────────────────────────┐
│ 🎯 Agency    [@] My Work  │
│ Autonomy Coach            │
├────────────────────────────┤
│                            │
│  ┌──────────────────────┐ │
│  │ Now: Autonomy Coach  │ │
│  └──────────────────────┘ │
│                            │
│  [Agent] Hi, I'm here     │
│  to help you reconnect    │
│  with your sense of...    │
│                            │
│  [You] I'm struggling to  │
│  decide whether to...     │
│                            │
│  [Agent] That's a         │
│  significant decision...  │
│                            │
│  ┌──────────────────────┐ │
│  │ Type a message...    │ │
│  │                 [📎] │ │
│  └──────────────────────┘ │
│                            │
├────────────────────────────┤
│  [🔌] [🎙️] [⏸️] [🔴]      │
│                            │
│  ┌────────────────────┐   │
│  │  [🎤 Push to Talk] │   │
│  └────────────────────┘   │
│                            │
│  [ Workspace ▼ ]          │
│                            │
└────────────────────────────┘
```

**Changes from Desktop**:
- Workspace is collapsed by default (focus on chat)
- Tap "Workspace ▼" to expand bottom sheet
- Larger touch targets (48px minimum)
- PTT button is prominent and easy to reach
- Simplified toolbar (fewer options)

---

#### Workspace Drawer (Mobile)

```
User taps "Workspace ▼"
  ↓
[Bottom sheet slides up]

┌────────────────────────────┐
│  Workspace          [▼]    │
├────────────────────────────┤
│                            │
│  [Agency Journal] ✓        │
│  [Decision Matrix]         │
│  [Values Alignment]        │
│                            │
│  [+ Add Tab]               │
│                            │
├────────────────────────────┤
│                            │
│  [Content preview here]    │
│                            │
│                            │
└────────────────────────────┘

[Swipe down to dismiss]
```

**Interaction**:
- Swipe up to expand fully
- Tap tab to view content
- Swipe down to return to chat

---

### Mobile-Specific Patterns

#### Pattern: Voice Button States (Mobile)

```
Default State:
┌──────────────────┐
│   🎤 Push to     │
│      Talk        │
└──────────────────┘

Pressed State:
┌──────────────────┐
│   🔴 Recording   │
│   Release to     │
│      Send        │
└──────────────────┘

Speaking State:
┌──────────────────┐
│   🔴 Speaking    │
│   ▁▃▅▇▅▃▁       │
└──────────────────┘
```

**Haptic Feedback**:
- Light tap when press starts
- Medium tap when release (message sent)
- Pattern vibration when agent starts speaking

---

## Accessibility

### WCAG 2.1 AA Compliance

#### Color Contrast
- All text: Minimum 4.5:1 contrast ratio
- Large text (18pt+): Minimum 3:1
- Interactive elements: 3:1 with surroundings

**Our Palette**:
- Text on dark bg: #e8e8e8 on #0a0a0a (17:1) ✅
- Cyan accent: #00d9ff on #0a0a0a (10:1) ✅
- Secondary text: #8a8a8a on #0a0a0a (7:1) ✅

#### Keyboard Navigation

**All interactive elements accessible via keyboard:**

```
Tab Order:
1. Suite selector trigger (header)
2. Search input
3. Category tabs (arrow keys to navigate)
4. Suite cards (arrow keys between)
   - Enter to expand
   - Enter again to start
5. Workspace tabs
6. Message input
7. PTT button (Space to activate)
8. Settings
9. Disconnect
```

**Keyboard Shortcuts**:
- `Cmd/Ctrl + P`: Open suite selector
- `Cmd/Ctrl + K`: Focus search
- `Cmd/Ctrl + B`: Toggle workspace
- `Space`: Push to talk (when PTT focused)
- `Escape`: Close modals, cancel actions
- `Cmd/Ctrl + Enter`: Send message
- `Cmd/Ctrl + D`: Disconnect

#### Screen Reader Support

**ARIA Labels**:
```html
<button aria-label="Open suite selector. Currently using Agency and Autonomy suite">
  🎯 Agency & Autonomy
</button>

<div role="log" aria-live="polite" aria-label="Conversation transcript">
  <!-- Transcript content -->
</div>

<button 
  aria-label="Push to talk. Hold space bar to speak"
  aria-pressed="false"
>
  🎤 Push to Talk
</button>
```

**Live Regions**:
- Transcript: `aria-live="polite"` (announces new messages)
- Connection status: `aria-live="assertive"` (announces immediately)
- Guardrail trips: `aria-live="assertive"`

#### Focus Management

**After Suite Selection**:
```
User selects suite → Modal closes → Focus moves to:
1. First message in transcript (if agent spoke)
2. Message input (if waiting for user)
```

**After Handoff**:
```
Agent hands off → Focus stays in transcript → Screen reader announces:
"Now speaking: Decision Architect"
```

---

### Cognitive Accessibility

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Changes**:
- No animated transitions
- Instant handoffs (no loading animation)
- No pulsing or waving effects
- Static indicators only

#### High Contrast Mode

**Browser high contrast mode detected:**
```css
@media (prefers-contrast: high) {
  .card {
    border: 3px solid; /* Thicker borders */
  }
  
  .button {
    outline: 2px solid; /* Clearer boundaries */
  }
  
  /* Remove subtle effects */
  .shadow-glow-cyan {
    box-shadow: none;
  }
}
```

#### Dyslexia-Friendly Options

**Settings panel option:**
```
[ ] Use dyslexia-friendly font
```

If enabled:
- Font: OpenDyslexic or Atkinson Hyperlegible
- Line height: 1.8 (increased spacing)
- Letter spacing: 0.15em
- Paragraph spacing: 2em

---

## Microinteractions & Delight

### Celebration Moments

#### First Session Complete
```
┌──────────────────────────────────────────┐
│              🎉 Amazing!                  │
│                                          │
│  You just completed your first session   │
│  with VoiceCoach!                        │
│                                          │
│  ✓ Created 3 workspace tabs              │
│  ✓ Talked with 2 different agents        │
│  ✓ Made progress on your goals           │
│                                          │
│  [Continue →]                            │
└──────────────────────────────────────────┘
```

**Subtle confetti animation (respects prefers-reduced-motion)**

---

#### Milestone: 10 Sessions
```
┌──────────────────────────────────────────┐
│              ⭐ Milestone!                │
│                                          │
│  You've completed 10 sessions!           │
│                                          │
│  Your most used suite:                   │
│  🧘 Energy & Focus (7 sessions)         │
│                                          │
│  Keep up the great work!                 │
│                                          │
│  [View Stats] [Continue]                 │
└──────────────────────────────────────────┘
```

---

### Anticipatory Design

#### Smart Pre-Loading
When user hovers over "Start Session":
- Pre-fetch agent data
- Initialize audio context
- Warm up connection
→ Connection happens ~1s faster

#### Predictive Suggestions
After 3+ sessions, system learns patterns:
- Time of day preferences
- Suite preferences
- Session length patterns
→ Suggests relevant suite proactively

---

### Easter Eggs (Subtle, Discoverable)

#### Konami Code
`↑ ↑ ↓ ↓ ← → ← → B A`
→ Reveals "Developer Mode" with extra debug info

#### Long Press Logo
Hold logo for 3 seconds
→ Shows system stats and fun facts
  - "You've spoken 12,459 words with your coaches"
  - "That's like reading a 50-page book!"

---

## User Testing Scenarios

### Scenario 1: First-Time User (Sarah)

**Task**: "You're feeling overwhelmed with work. Find support for managing your energy."

**Success Criteria**:
- [ ] Understands app purpose within 10 seconds
- [ ] Finds Energy & Focus suite within 30 seconds
- [ ] Starts conversation within 2 minutes
- [ ] Can use voice OR text comfortably
- [ ] Understands when agent hands off

**Questions After**:
- "What did you expect the app to do?"
- "Was anything confusing?"
- "Did you feel like you chose the right suite?"
- "Would you use this again?"

---

### Scenario 2: Suite Switching (Marcus)

**Task**: "You're in a session with Agency Suite but realize you need planning help. Switch suites."

**Success Criteria**:
- [ ] Finds suite switcher within 10 seconds
- [ ] Understands that conversation will end
- [ ] Comfortable with the transition
- [ ] New suite feels like fresh start
- [ ] Previous workspace is preserved

**Questions After**:
- "Was it clear how to switch?"
- "Were you worried about losing your work?"
- "Did the new suite feel different?"
- "Was the transition smooth?"

---

### Scenario 3: Mobile Experience (Jamie)

**Task**: "Use the app on your phone to get creative project help."

**Success Criteria**:
- [ ] Suite selector is usable on mobile
- [ ] Can read descriptions without zooming
- [ ] PTT button is easy to reach
- [ ] Can access workspace easily
- [ ] Conversation is readable

**Questions After**:
- "Was anything too small to tap?"
- "Could you read everything easily?"
- "Did the workspace feel accessible?"
- "Would you use this on mobile regularly?"

---

### Scenario 4: Returning User

**Task**: "Open the app and continue where you left off."

**Success Criteria**:
- [ ] Recognizes last suite used
- [ ] Can continue OR switch easily
- [ ] Previous workspace still there
- [ ] Feels like picking up where left off
- [ ] Connection is fast

**Questions After**:
- "Did it remember your preferences?"
- "Was it faster than last time?"
- "Did you feel oriented?"
- "Anything you wish it remembered?"

---

## Summary: UX Principles in Action

### What Makes This UX Great

1. **Zero Learning Curve**
   - Suite descriptions are plain language
   - No jargon or technical terms
   - Visual hierarchy guides attention
   - Familiar patterns (search, cards, chat)

2. **Informed Decisions**
   - See what you're getting (workspace preview)
   - Understand agent roles before starting
   - Know what to expect (session length, difficulty)
   - Can explore without committing

3. **Frictionless Flow**
   - 2 clicks from landing to conversation
   - Auto-saves everything
   - Easy to switch if choice was wrong
   - Handoffs are smooth and explained

4. **Trust Building**
   - Transparent about data usage
   - Shows what's happening (loading states)
   - Explains guardrail trips
   - Makes agent handoffs visible

5. **Inclusive Design**
   - Works with keyboard only
   - Screen reader friendly
   - High contrast support
   - Text alternative to voice
   - Mobile optimized

6. **Forgiving Errors**
   - Confirm before destructive actions
   - Easy undo/cancel
   - Clear error messages
   - Always offer next steps

### Metrics to Track

**Engagement**:
- Time to first session (target: <2 min)
- Sessions per user per week (target: 3+)
- Session completion rate (target: >80%)
- Suite switching rate (target: <20% mid-session)

**Quality**:
- NPS score (target: >50)
- Feature discovery rate (target: >70%)
- Error recovery rate (target: >90%)
- Return user rate (target: >60%)

**Performance**:
- Time to connection (target: <3s)
- Guardrail trip rate (target: <5%)
- Handoff success rate (target: >95%)
- Mobile vs desktop usage (track difference)

---

**Document Version**: 1.0  
**Last Updated**: 2024-10-11  
**UX Lead**: AI Product Design Team  



