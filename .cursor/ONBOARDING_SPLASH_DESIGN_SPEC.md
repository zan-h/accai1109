# Onboarding Splash Screen - Design Specification

**Created:** November 22, 2025  
**Feature:** First-time user onboarding experience  
**Goal:** Get new users from landing → first voice interaction in <60 seconds

---

## Behavioral Psychology Foundation

### Core Principles Applied

1. **Reduce Cognitive Load** - Show only essential information
2. **Action Bias** - Get user acting within 10 seconds
3. **Progressive Disclosure** - Reveal features as user needs them
4. **Immediate Feedback** - Celebrate first successful interaction
5. **Psychological Safety** - No judgment, permission to explore

### Target Metrics

- **Time to First Interaction:** <60 seconds (from landing to first voice message)
- **Completion Rate:** >90% (users who see splash → complete suite selection)
- **Comprehension:** User can explain what the app does in one sentence
- **Confidence:** User knows what to do next without instruction

---

## User Flow

```
┌─────────────────────────────────────────────────┐
│  User Lands on App                              │
│  (First time, not authenticated)                │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Clerk Authentication                           │
│  (Existing flow - unchanged)                    │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Check: hasCompletedOnboarding?                 │
│  (localStorage flag)                            │
└─────────────┬───────────────────────────────────┘
              │
       ┌──────┴──────┐
       │             │
    NO │             │ YES
       ▼             ▼
┌──────────────┐  ┌──────────────────────┐
│ NEW USER     │  │ RETURNING USER       │
│              │  │                      │
│ Show         │  │ Skip to Main App     │
│ Onboarding   │  │ (current behavior)   │
│ Splash       │  │                      │
└──────┬───────┘  └──────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Onboarding Welcome Screen                      │
│  - Headline (what is this?)                     │
│  - Subheadline (why use it?)                    │
│  - CTA: "Choose Your Work Style" button         │
│  - Optional: "Learn More" expandable            │
└─────────────────┬───────────────────────────────┘
                  │
            [User clicks CTA]
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Suite Selector Modal                           │
│  (Existing component - unchanged)               │
│  - Categories                                   │
│  - Suite cards                                  │
│  - Select suite                                 │
└─────────────────┬───────────────────────────────┘
                  │
         [Suite selected]
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Set: hasCompletedOnboarding = true             │
│  (localStorage)                                 │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Template Prompt (if suite has templates)       │
│  (Existing component - unchanged)               │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Main App Interface                             │
│  - Workspace                                    │
│  - Transcript                                   │
│  - Connect button                               │
└─────────────────┬───────────────────────────────┘
                  │
      [User clicks Connect]
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  First Connection Celebration 🎉                │
│  Toast: "Connected! Try saying: 'Help me..."    │
│  (Auto-dismiss after 5s)                        │
└─────────────────────────────────────────────────┘
```

---

## Visual Design

### Layout (OnboardingWelcome Component)

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│                        [LOGO]                             │
│                                                           │
│              ┌─────────────────────────┐                 │
│              │                         │                 │
│              │    [Animated Icon]      │                 │
│              │         🎙️              │                 │
│              │                         │                 │
│              └─────────────────────────┘                 │
│                                                           │
│        ╔═══════════════════════════════════════╗         │
│        ║                                       ║         │
│        ║    [HEADLINE]                         ║         │
│        ║    Work With Your Brain,              ║         │
│        ║    Not Against It                     ║         │
│        ║                                       ║         │
│        ╚═══════════════════════════════════════╝         │
│                                                           │
│              [SUBHEADLINE]                                │
│        Voice AI that adapts to your energy,              │
│        focus, and work style in real-time.               │
│                                                           │
│              ┌─────────────────────────┐                 │
│              │                         │                 │
│              │  Choose Your Work Style │  ← [CTA Button]│
│              │           →             │                 │
│              │                         │                 │
│              └─────────────────────────┘                 │
│                                                           │
│                   [? How it works]   ← [Learn More]      │
│                                                           │
│                                                           │
│                   [Skip for now]     ← [Secondary CTA]   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Spacing & Typography

**Container:**
- Full-screen overlay with backdrop blur
- Centered modal: `max-w-2xl` (matches SuiteSelector)
- Padding: `p-12` on desktop, `p-6` on mobile
- Background: `bg-bg-secondary` with `border-2 border-accent-primary`
- Shadow: `shadow-glow-cyan` (consistent with existing modals)

**Icon:**
- Size: `text-6xl` (96px)
- Animation: Gentle pulse (1.5s interval)
- Center aligned

**Headline:**
- Font: `font-mono` (system font-family)
- Size: `text-3xl md:text-4xl` (30px → 36px)
- Weight: `font-bold`
- Color: `text-text-primary`
- Tracking: `tracking-tight`
- Margin bottom: `mb-6`
- Max width: `max-w-xl` for readability
- Text align: `text-center`

**Subheadline:**
- Font: `font-mono`
- Size: `text-lg md:text-xl` (18px → 20px)
- Weight: `font-normal`
- Color: `text-text-secondary`
- Line height: `leading-relaxed`
- Margin bottom: `mb-10`
- Max width: `max-w-lg`
- Text align: `text-center`

**CTA Button:**
- Style: Primary action (accent-primary)
- Padding: `px-8 py-4`
- Font size: `text-lg`
- Font weight: `font-semibold`
- Border: `border-2 border-accent-primary`
- Background: `bg-accent-primary hover:bg-accent-primary-hover`
- Text color: `text-bg-primary` (inverted for contrast)
- Transition: `transition-all duration-200`
- Margin bottom: `mb-6`
- Full width on mobile, auto on desktop

**Learn More Link:**
- Font size: `text-sm`
- Color: `text-text-tertiary hover:text-accent-primary`
- Underline on hover
- Cursor: pointer
- Icon: `?` in circle or info icon
- Margin bottom: `mb-4`

**Skip Link:**
- Font size: `text-xs`
- Color: `text-text-tertiary`
- Underline on hover
- Cursor: pointer
- Position: Bottom of modal

### Color Palette (from existing system)

```css
/* From globals.css */
--bg-primary: #0a0a0a;
--bg-secondary: #141414;
--bg-overlay: rgba(0, 0, 0, 0.8);
--text-primary: #e5e5e5;
--text-secondary: #a3a3a3;
--text-tertiary: #737373;
--accent-primary: #06b6d4; /* cyan */
--border-primary: #262626;
```

### Animation

**Entry Animation:**
```css
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.onboarding-welcome {
  animation: fadeInScale 0.3s ease-out;
}
```

**Icon Pulse:**
```css
@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.icon-pulse {
  animation: iconPulse 1.5s ease-in-out infinite;
}
```

**Exit Animation:**
```css
@keyframes fadeOutScale {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.onboarding-welcome-exit {
  animation: fadeOutScale 0.2s ease-in;
}
```

---

## Copy Options (A/B Testing Candidates)

### Option A: Empowerment Focus (RECOMMENDED)
**Headline:** "Work With Your Brain, Not Against It"  
**Subheadline:** "Voice AI that adapts to your energy, focus, and work style in real-time."  
**CTA:** "Choose Your Work Style →"

**Why:** 
- Addresses ADHD audience directly without stigma
- Empowerment framing (positive)
- Clear value proposition
- Natural lead-in to suite selection

### Option B: Function Focus
**Headline:** "Your Voice-First Work Partner"  
**Subheadline:** "Real-time coaching that adapts to how you're feeling and what you need to get done."  
**CTA:** "Get Started →"

**Why:**
- Clear functional description
- Partnership framing (collaborative)
- Less assumption about user's challenges

### Option C: Outcome Focus
**Headline:** "Get More Done, Feel Better Doing It"  
**Subheadline:** "Voice AI coaching that matches your energy and work style."  
**CTA:** "Choose Your Approach →"

**Why:**
- Benefit-first messaging
- Addresses both productivity AND wellbeing
- Simple and direct

### Recommendation
**Use Option A** for initial launch. It:
- Resonates with ADHD audience (primary target)
- Sets up "work style" concept for suite selection
- Balances aspiration with clarity
- Tested well in research on ADHD productivity tools

---

## "Learn More" Expandable Content

### Trigger
- Link text: "How it works"
- Icon: `ℹ️` or `▼` chevron
- Position: Below CTA button, centered
- Animation: Smooth expand/collapse (0.2s ease)

### Expanded Content

```
┌─────────────────────────────────────────────────┐
│  HOW IT WORKS                                   │
│                                                 │
│  🎙️  Voice-First                                │
│      Push to talk or voice activation           │
│                                                 │
│  📊  Visual Workspace                           │
│      Tabs for notes, tasks, and ideas           │
│                                                 │
│  ⏱️  Guided Sessions                            │
│      Agents guide you through timed work        │
│                                                 │
│  📝  Auto-Tracked Progress                      │
│      Daily journal updated as you work          │
│                                                 │
│  You can customize everything later.            │
└─────────────────────────────────────────────────┘
```

**Typography:**
- Title: `text-sm font-semibold text-text-primary mb-4`
- Items: `text-sm text-text-secondary`
- Icons: `text-xl` (emoji or SVG)
- Layout: `space-y-3` for list items
- Max width: `max-w-md`
- Background: `bg-bg-primary` with subtle border
- Padding: `p-4`

---

## Accessibility

### Keyboard Navigation
- `Enter`: Trigger CTA (Choose Your Work Style)
- `Esc`: Skip onboarding (show "Skip" confirmation)
- `Tab`: Focus through elements (CTA → Learn More → Skip)
- `Space`: Expand/collapse Learn More

### Screen Readers
```tsx
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="onboarding-headline"
  aria-describedby="onboarding-subheadline"
>
  <h1 id="onboarding-headline">
    Work With Your Brain, Not Against It
  </h1>
  <p id="onboarding-subheadline">
    Voice AI that adapts to your energy, focus, and work style in real-time.
  </p>
  <button aria-label="Choose your work style and get started">
    Choose Your Work Style →
  </button>
</div>
```

### Focus Management
- Auto-focus on CTA button when modal opens
- Trap focus within modal (prevent tabbing outside)
- Return focus to main app when closed

### Color Contrast
- Headline: WCAG AAA (7:1 contrast ratio)
- Subheadline: WCAG AA (4.5:1 contrast ratio)
- CTA button: WCAG AAA (text on accent-primary)

---

## Mobile Responsiveness

### Breakpoints
- **Mobile:** `< 768px` (sm)
- **Tablet:** `768px - 1024px` (md)
- **Desktop:** `> 1024px` (lg)

### Mobile Adjustments
```css
/* Mobile (<768px) */
.onboarding-welcome {
  padding: 1.5rem; /* Reduced from 3rem */
  max-width: 100vw;
  height: 100vh; /* Full screen on mobile */
}

.onboarding-headline {
  font-size: 1.875rem; /* 30px, down from 36px */
  line-height: 1.2;
}

.onboarding-subheadline {
  font-size: 1rem; /* 16px, down from 20px */
}

.onboarding-cta {
  width: 100%; /* Full width on mobile */
  padding: 1rem;
}

.icon-container {
  font-size: 4rem; /* 64px, down from 96px */
}
```

### Touch Targets
- CTA button: Minimum 44px height (iOS guideline)
- Learn More link: Minimum 48px tap target
- Skip link: Minimum 44px tap target with padding

---

## Implementation Details

### Component File Structure

```
src/app/components/
  └── onboarding/
      ├── OnboardingWelcome.tsx      # Main component
      ├── LearnMoreSection.tsx       # Expandable content
      └── onboarding.types.ts        # TypeScript types
```

### State Management

**localStorage Keys:**
```typescript
interface OnboardingState {
  hasCompletedOnboarding: boolean;  // Set after suite selection
  hasSeenFirstConnection: boolean;  // Set after first successful connect
  onboardingDismissedAt?: string;   // ISO timestamp if user skipped
  onboardingCompletedAt?: string;   // ISO timestamp when completed
}
```

**Component State:**
```typescript
interface OnboardingWelcomeState {
  isLearnMoreExpanded: boolean;
  isExiting: boolean; // For exit animation
}
```

### Integration Points

**App.tsx modifications:**
```typescript
// Add state
const [showOnboarding, setShowOnboarding] = useState(() => {
  if (typeof window === 'undefined') return false;
  return !localStorage.getItem('hasCompletedOnboarding');
});

// Add component before SuiteSelector
{showOnboarding && (
  <OnboardingWelcome
    onComplete={() => {
      setShowOnboarding(false);
      setShowSuiteSelector(true);
    }}
    onSkip={() => {
      localStorage.setItem('hasCompletedOnboarding', 'true');
      localStorage.setItem('onboardingDismissedAt', new Date().toISOString());
      setShowOnboarding(false);
      setShowSuiteSelector(true);
    }}
  />
)}
```

**SuiteSelector.tsx modifications:**
```typescript
// After suite selection, mark onboarding as complete
const handleSelectSuite = async (suite: AgentSuite) => {
  // Existing logic...
  
  // Mark onboarding complete
  localStorage.setItem('hasCompletedOnboarding', 'true');
  localStorage.setItem('onboardingCompletedAt', new Date().toISOString());
  
  onSelectSuite(suite);
};
```

---

## Testing Checklist

### Functional Tests
- [ ] Onboarding shows for new users (no localStorage)
- [ ] Onboarding doesn't show for returning users (hasCompletedOnboarding=true)
- [ ] CTA button opens SuiteSelector
- [ ] Skip link bypasses to SuiteSelector
- [ ] Learn More expands/collapses correctly
- [ ] After suite selection, onboarding doesn't show again
- [ ] localStorage flags are set correctly

### Interaction Tests
- [ ] Keyboard: Enter triggers CTA
- [ ] Keyboard: Esc skips onboarding
- [ ] Keyboard: Tab cycles through focusable elements
- [ ] Keyboard: Space toggles Learn More
- [ ] Touch: All buttons have 44px+ hit targets (mobile)
- [ ] Touch: Smooth animations on mobile

### Visual Tests
- [ ] Entry animation plays smoothly
- [ ] Exit animation plays on CTA click
- [ ] Icon pulse animation works
- [ ] Learn More expand animation smooth
- [ ] Responsive layout works on mobile (375px)
- [ ] Responsive layout works on tablet (768px)
- [ ] Responsive layout works on desktop (1440px)

### Accessibility Tests
- [ ] Screen reader announces headline and subheadline
- [ ] Focus visible on all interactive elements
- [ ] Focus trap works (can't tab outside modal)
- [ ] Color contrast passes WCAG AA
- [ ] Keyboard navigation complete without mouse
- [ ] ARIA labels present and correct

### Browser Tests
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Safari iOS (mobile)
- [ ] Chrome Android (mobile)

### Edge Cases
- [ ] User clears localStorage mid-session
- [ ] User has multiple tabs open
- [ ] User refreshes during onboarding
- [ ] User goes offline during onboarding
- [ ] User has very long suite name in localStorage

---

## Success Metrics

### Quantitative
- **Time to First Interaction:** Median <60 seconds
- **Onboarding Completion Rate:** >90% (click CTA vs Skip)
- **Suite Selection Rate:** >95% (complete suite selection after onboarding)
- **First Connection Rate:** >80% (connect agent after onboarding)
- **Learn More Expansion Rate:** 20-30% (optional exploration)

### Qualitative
- User can explain app purpose in one sentence
- User feels confident about next steps
- User doesn't report confusion or overwhelm
- User rates onboarding as "quick and clear"

### A/B Testing Recommendations
1. Test headline options (A vs B vs C)
2. Test CTA text ("Choose Your Work Style" vs "Get Started")
3. Test Learn More visibility (default expanded vs collapsed)
4. Test icon choice (microphone vs brain vs abstract)

---

## Future Enhancements (Post-MVP)

### Phase 2: Progressive Disclosure
- Tooltip on Timer (after 3rd session)
- Tooltip on Work Journal (after first entry)
- Tooltip on Session History (after first save)
- All dismissible, tracked in localStorage

### Phase 3: Personalization
- Ask "What brings you here today?" (optional field)
- Pre-filter suites based on user intent
- Track which suites are most commonly chosen
- Surface popular suites first

### Phase 4: Video/Animation
- Short (5-10s) animated explainer
- Lottie animation for icon
- Video demo in Learn More section
- Only load if user expands Learn More (performance)

### Phase 5: Gamification
- "Let's get you set up in 60 seconds!" timer
- Progress bar during onboarding
- Celebration animation on completion
- Badge: "First Session Complete"

---

## Design System Consistency

This onboarding screen follows the existing accai design system:

✅ **Color Palette:** Uses `--accent-primary`, `--bg-secondary`, `--text-primary`  
✅ **Typography:** Uses `font-mono` throughout  
✅ **Spacing:** Uses Tailwind spacing scale (4px base unit)  
✅ **Borders:** Uses `border-accent-primary` for focus states  
✅ **Shadows:** Uses `shadow-glow-cyan` for modals  
✅ **Animations:** Consistent with existing modal animations  
✅ **Components:** Matches SuiteSelector modal style

---

## References

- **Behavioral Psychology:** "Hooked" by Nir Eyal (action triggers, habit formation)
- **Onboarding Patterns:** UserOnboard.com (case studies, best practices)
- **ADHD UX:** "Designing for ADHD" (reduced cognitive load, clear next steps)
- **Accessibility:** WCAG 2.1 AA guidelines
- **Mobile UX:** Apple Human Interface Guidelines (touch targets, readability)

---

**END OF DESIGN SPEC**

