# Implementation Prompt: Production UI/UX Transformation

**Task Type:** Full-Stack Development (Frontend Focus)  
**Estimated Effort:** 7 weeks (280-350 developer hours)  
**Scope:** 11 phases (Option A: Full Premium Experience, excluding landing page)  
**Role:** You are an expert React/Next.js developer specializing in advanced animations, WebGL, and enterprise-grade UI development.

---

## Mission

Transform the current functional voice-agent application into a **visually striking, enterprise-grade web experience** using cutting-edge web technologies (WebGL shaders, glassmorphism, smooth scroll, advanced animations) while maintaining:
- ✅ 60fps performance
- ✅ WCAG 2.1 AAA accessibility 
- ✅ Production-ready code quality
- ✅ All existing functionality intact

---

## Context & Background

### Current Application State
- **Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Features:** Multi-agent voice system, workspace tabs, transcript, timer, project management
- **Design:** Functional dark terminal aesthetic with basic glassmorphism and cyan accents
- **Authentication:** Clerk (already implemented)
- **Database:** Supabase (already implemented)

### User Requirements
- **Visual Excellence:** Push limits with WebGL particles, smooth animations, glassmorphism
- **Developer Mode:** Hide technical features (logs, codec selector, recording) behind settings
- **Accessibility First:** WCAG 2.1 AAA compliance mandatory
- **Performance:** Lighthouse >90, 60fps animations, <3s time to interactive
- **Particle Control:** Optional toggle (Settings → General tab)
- **No Landing Page:** Authenticated app only (skip Phase 9)
- **Full Completion:** Implement all 11 phases before release

---

## Reference Documentation

### Primary Specification (READ THIS FIRST)
**File:** `.cursor/PRODUCTION_UI_DESIGN_SPEC.md` (14,000+ words)

This is your complete implementation guide. It contains:
- Section 1: Visual System 2.0 (design tokens, colors, motion)
- Section 2: Background Ambient System (WebGL particles, gradient mesh)
- Section 3: Component-by-Component Redesign (6 major components)
- Section 4: Settings Panel & Developer Mode
- Section 5: Scroll Animations & Parallax
- Section 6: Micro-Interactions Catalog
- Section 7: Performance Optimization
- Section 8: Accessibility Compliance
- Section 9: Implementation Roadmap (your task breakdown)

### Supporting Documents
- `.cursor/PRODUCTION_UI_SUMMARY.md` - Executive summary
- `.cursor/VISUAL_EXAMPLE_PTT_BUTTON.md` - Before/after visual example
- `.cursor/scratchpad.md` - Project context and lessons learned

### Current Codebase Key Files
- `src/app/App.tsx` - Main application component
- `src/app/components/Transcript.tsx` - Session/transcript panel
- `src/app/components/Workspace.tsx` - Workspace panel
- `src/app/components/BottomToolbar.tsx` - Controls (needs refactoring)
- `src/app/components/PushToTalkButton.tsx` - Voice button (needs enhancement)
- `src/app/components/Timer.tsx` - Timer component
- `src/app/globals.css` - Current design tokens
- `tailwind.config.ts` - Tailwind configuration

---

## Implementation Phases

### ✅ Phase 1: Foundation & Setup (Week 1)
**Goal:** Install dependencies and establish new design system foundation

#### Tasks:
1. **Install Dependencies**
   ```bash
   npm install framer-motion@^11.0.0 three@^0.160.0 @react-three/fiber@^8.15.0 @react-three/drei@^9.95.0 gsap@^3.12.5 locomotive-scroll@^5.0.0-beta canvas-confetti@^1.9.2 react-intersection-observer@^9.5.3
   ```

2. **Create Design Token System**
   - Create `src/app/lib/design/colors.ts` (copy from spec Section 1.1)
   - Create `src/app/lib/design/motion.ts` (copy from spec Section 1.2)
   - Update `src/app/globals.css` with glassmorphism utilities (spec Section 1.3)

3. **Update Tailwind Config**
   - Add new color tokens to `tailwind.config.ts`
   - Add new shadow utilities (glow effects)
   - Ensure existing tokens remain for backwards compatibility

4. **Test Setup**
   ```bash
   npm run dev
   ```
   - Verify app still runs
   - Check console for dependency errors
   - Verify existing functionality intact

#### Success Criteria:
- [x] All dependencies installed without conflicts
- [x] Design token files created and imported
- [x] Glassmorphism CSS utilities available
- [x] App runs without errors
- [x] No existing functionality broken

#### Files to Create:
- `src/app/lib/design/colors.ts`
- `src/app/lib/design/motion.ts`

#### Files to Modify:
- `tailwind.config.ts`
- `src/app/globals.css`
- `package.json`

---

### ✅ Phase 2: Background Ambient System (Week 1-2)
**Goal:** Implement WebGL particle field and animated gradient mesh

#### Tasks:
1. **Create ParticleField Component**
   - File: `src/app/components/ambient/ParticleField.tsx`
   - Copy full implementation from spec Section 2.1
   - 2000 particles on desktop, 500 on mobile
   - Mouse parallax effect (0.05 influence)
   - Connection lines between nearby particles (<150px)
   - Cyan/magenta color palette
   - Drift animation (particles slowly rise)

2. **Create GradientMesh Component**
   - File: `src/app/components/ambient/GradientMesh.tsx`
   - Copy implementation from spec Section 2.2
   - Slowly morphing radial gradients
   - 20s animation cycle

3. **Add Particle Toggle Setting**
   - Add `particlesEnabled` to Settings state
   - Store in localStorage
   - Check `prefers-reduced-motion` and auto-disable if set

4. **Integrate into App**
   - Add to `src/app/App.tsx` or `src/app/layout.tsx`
   - Render behind all content (z-index: -10)
   - Conditional rendering based on settings toggle

5. **Performance Testing**
   - Monitor FPS in Chrome DevTools Performance tab
   - Should maintain 60fps on MacBook Air 2020 or equivalent
   - Throttle CPU 4x - should stay above 30fps
   - Mobile: Test on real device (iPhone 12 / Pixel 5 or newer)

#### Success Criteria:
- [x] ParticleField renders with 2000 particles on desktop
- [x] Particles respond to mouse movement (parallax)
- [x] Connection lines appear between nearby particles
- [x] GradientMesh animates smoothly behind particles
- [x] Toggle in settings works (enable/disable)
- [x] Respects prefers-reduced-motion
- [x] 60fps maintained on target devices
- [x] No memory leaks (check DevTools Memory profiler)

#### Files to Create:
- `src/app/components/ambient/ParticleField.tsx`
- `src/app/components/ambient/GradientMesh.tsx`

#### Files to Modify:
- `src/app/App.tsx` or `src/app/layout.tsx`

#### Testing Checklist:
- [ ] Desktop Chrome: 60fps ✓
- [ ] Desktop Firefox: 60fps ✓
- [ ] Desktop Safari: 60fps ✓
- [ ] Mobile iOS Safari: 30fps+ ✓
- [ ] Mobile Chrome Android: 30fps+ ✓
- [ ] Reduced motion: Disabled ✓
- [ ] Toggle setting: Works ✓

---

### ✅ Phase 3: Core Component Redesign (Week 2-3)
**Goal:** Redesign Header, Workspace, and Transcript with new visual system

#### 3.1 Header Component
**File:** `src/app/App.tsx` (header section, lines ~1167-1258)

**Changes:**
1. Wrap header in Framer Motion component
2. Add glassmorphism classes (`.glass-panel`)
3. Add scroll-based opacity/blur effect
4. Add neon accent line at bottom
5. Logo hover glow effect
6. Suite indicator with neon border

**Reference:** Spec Section 3.1

**Code to implement:**
```tsx
// Import at top
import { motion, useScroll, useTransform } from 'framer-motion';

// Inside component
const { scrollY } = useScroll();
const headerOpacity = useTransform(scrollY, [0, 100], [0.8, 0.95]);
const borderGlow = useTransform(scrollY, [0, 100], [0.3, 0.6]);

// Replace existing header with:
<motion.header
  className="fixed top-0 left-0 right-0 z-50 glass-panel"
  style={{ opacity: headerOpacity }}
>
  {/* existing header content */}
  
  {/* Add neon accent line */}
  <motion.div 
    className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-primary to-transparent"
    style={{ opacity: borderGlow }}
  />
</motion.header>
```

#### 3.2 Workspace Component
**File:** `src/app/components/Workspace.tsx`

**Changes:**
1. Add glassmorphism to main container
2. Implement mouse-follow glow effect
3. Add animated tab slider (layoutId="activeTab")
4. Entrance animation on mount
5. 3D hover lift effect on cards

**Reference:** Spec Section 3.3

**Key implementation:**
- Use `onMouseMove` to track cursor position
- Create gradient div that follows cursor (transform: translate)
- Add `<motion.div layoutId="activeTab" />` for tab indicator
- Use `whileHover` for lift effect

#### 3.3 Transcript Component
**File:** `src/app/components/Transcript.tsx`

**Changes:**
1. Wrap message bubbles in `<motion.div>`
2. Add entrance animation (fade + slide up)
3. Stagger messages (0.05s delay per message)
4. Hover glow effect on messages
5. Enhanced glassmorphism on user vs agent messages

**Reference:** Spec Section 3.4

**Key implementation:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.4, delay: index * 0.05 }}
  whileHover={{ scale: 1.02 }}
>
  {/* message content */}
</motion.div>
```

#### Success Criteria:
- [x] Header has glassmorphism and scroll effects
- [x] Neon accent line animates on scroll
- [x] Workspace has mouse-follow glow
- [x] Tab slider animates smoothly between tabs
- [x] Transcript messages fade in with stagger
- [x] Hover effects work on all interactive elements
- [x] No performance degradation (60fps maintained)

#### Files to Modify:
- `src/app/App.tsx` (header section)
- `src/app/components/Workspace.tsx`
- `src/app/components/Transcript.tsx`

---

### ✅ Phase 4: Push-to-Talk Button Enhancement (Week 3)
**Goal:** Transform PTT button into hero interaction element

**File:** `src/app/components/PushToTalkButton.tsx`

**Current State:** Simple button with basic hover (lines 1-100 approx)

**Target State:** Large circular button (128px) with:
- Glassmorphism layers
- Ripple effects on press
- Voice waveform visualization
- Pulsing outer ring when speaking
- Haptic feedback simulation
- Scale + spring physics

**Reference:** 
- Spec Section 3.5 (full implementation)
- `.cursor/VISUAL_EXAMPLE_PTT_BUTTON.md` (detailed example)

**Implementation Steps:**

1. **Replace entire component** with implementation from spec Section 3.5

2. **Key features to implement:**
   ```tsx
   // State for ripples
   const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
   
   // Ripple effect on press
   const handlePress = (e: React.MouseEvent) => {
     const rect = e.currentTarget.getBoundingClientRect();
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;
     setRipples(prev => [...prev, { id: Date.now(), x, y }]);
   };
   
   // Voice waveform (20 animated bars)
   {isSpeaking && (
     <motion.div className="absolute -top-20 flex gap-1">
       {[...Array(20)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ height: [random(), random(), random()] }}
           transition={{ duration: 0.3, repeat: Infinity }}
         />
       ))}
     </motion.div>
   )}
   ```

3. **Add confetti celebration** (import canvas-confetti):
   ```tsx
   import confetti from 'canvas-confetti';
   
   // On successful interaction
   confetti({
     particleCount: 50,
     spread: 70,
     origin: { y: 0.6 },
     colors: ['#00d9ff', '#ff00e5', '#00ff88'],
   });
   ```

4. **Test spacebar keyboard shortcut** (should still work with new design)

#### Success Criteria:
- [x] Button is large and prominent (128px × 128px)
- [x] Glassmorphism layers render correctly
- [x] Ripple effect expands on press (300px radius, 0.6s)
- [x] Voice waveform appears when speaking (20 bars)
- [x] Pulsing outer ring animates when active
- [x] Scale animation feels like haptic feedback
- [x] Spacebar shortcut still works
- [x] Touch-friendly on mobile (large tap target)
- [x] Accessibility: ARIA labels and keyboard support

#### Files to Modify:
- `src/app/components/PushToTalkButton.tsx` (complete rewrite)

#### Testing Checklist:
- [ ] Mouse press: Ripple appears ✓
- [ ] Spacebar: Activates PTT ✓
- [ ] Voice waveform: Animates when speaking ✓
- [ ] Outer ring: Pulses when active ✓
- [ ] Release: Springs back smoothly ✓
- [ ] Mobile touch: Large target, works smoothly ✓
- [ ] Screen reader: Announces states correctly ✓

---

### ✅ Phase 5: Timer Component Cinematic (Week 3-4)
**Goal:** Redesign timer as circular progress ring with celebration

**File:** `src/app/components/Timer.tsx`

**Current State:** Basic timer with start/stop controls

**Target State:** Circular SVG progress ring with:
- Neon glow filter
- Smooth path animation
- Confetti on completion
- 360° rotation on completion
- Gradient stroke

**Reference:** Spec Section 3.6

**Implementation:**

1. **Replace timer UI** with SVG circular progress:
   ```tsx
   <svg className="w-48 h-48" viewBox="0 0 240 240">
     {/* Background circle */}
     <circle cx="120" cy="120" r="100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
     
     {/* Progress circle */}
     <motion.circle
       cx="120" cy="120" r="100"
       fill="none"
       stroke="url(#timerGradient)"
       strokeWidth="8"
       strokeLinecap="round"
       strokeDasharray={circumference}
       strokeDashoffset={strokeDashoffset}
       transform="rotate(-90 120 120)"
       style={{ filter: 'drop-shadow(0 0 10px rgba(0,217,255,0.6))' }}
     />
     
     {/* Gradient definition */}
     <defs>
       <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
         <stop offset="0%" stopColor="#00d9ff" />
         <stop offset="100%" stopColor="#ff00e5" />
       </linearGradient>
     </defs>
   </svg>
   ```

2. **Calculate progress:**
   ```tsx
   const progress = (duration - timeRemaining) / duration;
   const circumference = 2 * Math.PI * 100; // radius = 100
   const strokeDashoffset = circumference - (progress * circumference);
   ```

3. **Add confetti on completion:**
   ```tsx
   useEffect(() => {
     if (timeRemaining === 0) {
       confetti({
         particleCount: 100,
         spread: 70,
         origin: { y: 0.6 },
         colors: ['#00d9ff', '#ff00e5', '#00ff88'],
       });
       
       // Rotation animation
       controls.start({
         scale: [1, 1.2, 1],
         rotate: [0, 360],
         transition: { duration: 0.8 },
       });
     }
   }, [timeRemaining]);
   ```

#### Success Criteria:
- [x] Circular progress ring renders correctly
- [x] Progress animates smoothly (0.5s linear transition)
- [x] Neon glow visible on progress path
- [x] Confetti fires on completion (100 particles)
- [x] Rotation animation on completion (360°, 0.8s)
- [x] Time remaining displayed in center
- [x] Play/pause button works
- [x] Mobile: Responsive sizing

#### Files to Modify:
- `src/app/components/Timer.tsx`

---

### ✅ Phase 6: Settings Panel & Developer Mode (Week 4) ⭐ CRITICAL
**Goal:** Hide all technical features behind a settings modal

**New File:** `src/app/components/SettingsModal.tsx`

**Reference:** Spec Section 4.1

**Implementation:**

1. **Create Settings Modal Component**
   - Full implementation in spec Section 4.1
   - 3 tabs: General / Voice / Developer
   - Glassmorphism design
   - Keyboard shortcut (Cmd+,)

2. **Settings State Management**
   ```tsx
   // Create settings context or use localStorage
   interface Settings {
     audioPlayback: boolean;
     reducedMotion: boolean;
     particlesEnabled: boolean; // ← NEW for Phase 2
     showEventLogs: boolean; // ← Move from main UI
     codec: 'opus' | 'pcmu' | 'pcma'; // ← Move from bottom toolbar
     recordAudio: boolean; // ← Move from bottom toolbar
     memoryMonitoring: boolean;
     performanceOverlay: boolean;
     voiceModel: string;
     speechSpeed: number;
   }
   ```

3. **Move Developer Features:**
   
   **From BottomToolbar.tsx:**
   - Remove "Logs" checkbox → Move to Settings > Developer > "Show Event Logs"
   - Remove "Codec" dropdown → Move to Settings > Developer > "Audio Codec"
   - Remove "Record audio" checkbox → Move to Settings > Developer > "Record Audio"
   
   **Keep in BottomToolbar.tsx:**
   - Connect/Disconnect button (primary action)
   - Audio playback checkbox (user-facing feature)
   - Session visibility toggle

4. **Add Settings Button to Header**
   ```tsx
   // In App.tsx header section
   <motion.button
     onClick={() => setShowSettings(true)}
     className="glass-panel p-2 rounded-lg hover:neon-border-cyan"
     whileHover={{ scale: 1.05 }}
   >
     <SettingsIcon />
   </motion.button>
   ```

5. **Keyboard Shortcut**
   ```tsx
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if ((e.metaKey || e.ctrlKey) && e.key === ',') {
         e.preventDefault();
         setShowSettings(true);
       }
     };
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, []);
   ```

6. **Settings Persistence**
   ```tsx
   // Save to localStorage on change
   useEffect(() => {
     localStorage.setItem('appSettings', JSON.stringify(settings));
   }, [settings]);
   
   // Load on mount
   useEffect(() => {
     const saved = localStorage.getItem('appSettings');
     if (saved) setSettings(JSON.parse(saved));
   }, []);
   ```

#### Success Criteria:
- [x] Settings modal opens with Cmd+,
- [x] 3 tabs render correctly (General / Voice / Developer)
- [x] All settings save to localStorage
- [x] Developer tab shows warning banner
- [x] Event logs moved from BottomToolbar to Settings
- [x] Codec selector moved to Settings > Developer
- [x] Recording controls moved to Settings > Developer
- [x] Particle toggle in Settings > General
- [x] BottomToolbar cleaned up (only essential controls)
- [x] Settings persist across page reload

#### Files to Create:
- `src/app/components/SettingsModal.tsx`
- `src/app/contexts/SettingsContext.tsx` (optional, or use localStorage)

#### Files to Modify:
- `src/app/App.tsx` (add settings button, keyboard shortcut)
- `src/app/components/BottomToolbar.tsx` (remove developer features)
- `src/app/components/Events.tsx` (conditional render based on settings)

#### Testing Checklist:
- [ ] Cmd+, opens settings ✓
- [ ] Settings save to localStorage ✓
- [ ] Event logs toggle works ✓
- [ ] Codec selector works (requires page reload) ✓
- [ ] Recording toggle works ✓
- [ ] Particle toggle works ✓
- [ ] Bottom toolbar is clean ✓

---

### ✅ Phase 7: Scroll Animations & Parallax (Week 4-5)
**Goal:** Add smooth scroll and depth-layered parallax

**New Files:**
- `src/app/lib/animations/scrollAnimations.ts`
- `src/app/lib/animations/smoothScroll.ts`

**Reference:** Spec Section 5.1, 5.2

**Implementation:**

1. **Install and Configure GSAP ScrollTrigger**
   ```tsx
   // scrollAnimations.ts
   import { gsap } from 'gsap';
   import { ScrollTrigger } from 'gsap/ScrollTrigger';
   
   gsap.registerPlugin(ScrollTrigger);
   
   export function initScrollAnimations() {
     // Parallax layers
     gsap.utils.toArray('.parallax-slow').forEach((element: any) => {
       gsap.to(element, {
         y: -100,
         ease: 'none',
         scrollTrigger: {
           trigger: element,
           start: 'top bottom',
           end: 'bottom top',
           scrub: 1,
         },
       });
     });
     
     // Fade in on scroll
     gsap.utils.toArray('.fade-in-scroll').forEach((element: any) => {
       gsap.from(element, {
         opacity: 0,
         y: 50,
         duration: 1,
         scrollTrigger: {
           trigger: element,
           start: 'top 80%',
           toggleActions: 'play none none reverse',
         },
       });
     });
   }
   ```

2. **Set Up Locomotive Scroll** (optional, may conflict with Next.js)
   - Test first without Locomotive Scroll
   - If scroll feels janky, add Locomotive Scroll
   - Use `scrollerProxy` to sync with ScrollTrigger

3. **Apply Classes to Components**
   ```tsx
   // In Workspace.tsx
   <div className="parallax-slow fade-in-scroll">
     {/* Workspace content */}
   </div>
   
   // In Transcript.tsx
   <div className="parallax-fast fade-in-scroll">
     {/* Transcript content */}
   </div>
   ```

4. **Initialize on Mount**
   ```tsx
   // In App.tsx or layout.tsx
   useEffect(() => {
     initScrollAnimations();
     
     return () => {
       ScrollTrigger.getAll().forEach(t => t.kill());
     };
   }, []);
   ```

#### Success Criteria:
- [x] Parallax effect works on scroll
- [x] Fade-in animations trigger at 80% viewport
- [x] 60fps maintained during scroll
- [x] No jank or stuttering
- [x] Scroll works on mobile
- [x] Respects reduced motion (disable animations)

#### Files to Create:
- `src/app/lib/animations/scrollAnimations.ts`

#### Files to Modify:
- `src/app/App.tsx` (initialize animations)
- `src/app/components/Workspace.tsx` (add classes)
- `src/app/components/Transcript.tsx` (add classes)

#### Testing Checklist:
- [ ] Desktop scroll: Smooth parallax ✓
- [ ] Mobile scroll: No performance issues ✓
- [ ] Reduced motion: Animations disabled ✓

---

### ✅ Phase 8: Micro-Interactions (Week 5)
**Goal:** Polish all interactive elements with delightful effects

**Reference:** Spec Section 6

**Tasks:**

1. **Create Reusable Button Component**
   ```tsx
   // src/app/components/ui/NeonButton.tsx
   export function NeonButton({ children, onClick }: ButtonProps) {
     return (
       <motion.button
         className="relative px-6 py-3 rounded-lg font-mono font-bold overflow-hidden group"
         onClick={onClick}
         whileHover="hover"
         whileTap="tap"
         variants={{
           hover: { scale: 1.05 },
           tap: { scale: 0.95 },
         }}
       >
         {/* Background gradient */}
         <div className="absolute inset-0 bg-gradient-to-r from-accent-primary to-accent-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
         
         {/* Shine effect */}
         <motion.div
           className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
           variants={{
             hover: { x: [-200, 200], opacity: [0, 0.3, 0] },
           }}
           transition={{ duration: 0.6 }}
         />
         
         <span className="relative z-10">{children}</span>
       </motion.button>
     );
   }
   ```

2. **Create Hover Card Component**
   ```tsx
   // src/app/components/ui/HoverCard.tsx
   export function HoverCard({ children }: { children: React.ReactNode }) {
     const [rotateX, setRotateX] = useState(0);
     const [rotateY, setRotateY] = useState(0);
     
     const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
       const rect = e.currentTarget.getBoundingClientRect();
       const x = e.clientX - rect.left;
       const y = e.clientY - rect.top;
       const centerX = rect.width / 2;
       const centerY = rect.height / 2;
       
       setRotateX(((y - centerY) / centerY) * -10);
       setRotateY(((x - centerX) / centerX) * 10);
     };
     
     return (
       <motion.div
         className="glass-panel-heavy rounded-2xl p-6"
         onMouseMove={handleMouseMove}
         onMouseLeave={() => { setRotateX(0); setRotateY(0); }}
         animate={{ rotateX, rotateY }}
         whileHover={{ scale: 1.02 }}
         style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
       >
         {children}
       </motion.div>
     );
   }
   ```

3. **Enhanced Input Focus States**
   ```css
   /* Add to globals.css */
   .input-neon {
     background: rgba(255, 255, 255, 0.05);
     border: 1px solid rgba(255, 255, 255, 0.2);
     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
   }
   
   .input-neon:focus {
     outline: none;
     background: rgba(255, 255, 255, 0.08);
     border-color: #00d9ff;
     box-shadow: 
       0 0 0 3px rgba(0, 217, 255, 0.1),
       0 0 20px rgba(0, 217, 255, 0.3);
     transform: scale(1.02);
   }
   ```

4. **Replace Generic Buttons**
   - Find all `<button>` elements
   - Replace with `<NeonButton>` where appropriate
   - Keep native buttons for simple cases

5. **Add Loading States**
   ```tsx
   // Spinner component
   <motion.div
     className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full"
     animate={{ rotate: 360 }}
     transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
   />
   ```

#### Success Criteria:
- [x] All primary buttons use NeonButton
- [x] Cards have 3D hover lift effect
- [x] Inputs have enhanced focus states
- [x] Loading states are smooth
- [x] All interactions feel premium
- [x] No performance impact

#### Files to Create:
- `src/app/components/ui/NeonButton.tsx`
- `src/app/components/ui/HoverCard.tsx`

#### Files to Modify:
- Various component files (replace buttons)
- `src/app/globals.css` (input styles)

---

### ✅ Phase 10: Performance Optimization (Week 7)
**Goal:** Ensure 60fps, fast load times, and accessibility

**Reference:** Spec Section 7

**Tasks:**

1. **Implement Reduced Motion Hook**
   ```tsx
   // src/app/hooks/useReducedMotion.ts
   export function useReducedMotion() {
     const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
     
     useEffect(() => {
       const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
       setPrefersReducedMotion(mediaQuery.matches);
       
       const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
       mediaQuery.addEventListener('change', handleChange);
       
       return () => mediaQuery.removeEventListener('change', handleChange);
     }, []);
     
     return prefersReducedMotion;
   }
   ```

2. **Apply Reduced Motion**
   ```tsx
   // In any animated component
   const prefersReducedMotion = useReducedMotion();
   
   <motion.div
     initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 40 }}
     animate={{ opacity: 1, y: 0 }}
     transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
   >
   ```

3. **Lazy Load Heavy Components**
   ```tsx
   // In App.tsx
   const ParticleField = lazy(() => import('./components/ambient/ParticleField'));
   const SettingsModal = lazy(() => import('./components/SettingsModal'));
   
   <Suspense fallback={<LoadingSpinner />}>
     <ParticleField />
   </Suspense>
   ```

4. **GPU Acceleration**
   ```css
   /* Add to globals.css */
   .gpu-accelerated {
     transform: translateZ(0);
     will-change: transform, opacity;
     backface-visibility: hidden;
     perspective: 1000px;
   }
   
   /* Apply to animated elements */
   .glass-panel,
   .neon-border-cyan,
   .animate-pulse {
     transform: translateZ(0);
   }
   ```

5. **Bundle Size Optimization**
   ```tsx
   // Use dynamic imports for Three.js
   const initParticles = async () => {
     const THREE = await import('three');
     // Initialize...
   };
   ```

6. **Run Lighthouse Audit**
   ```bash
   # In Chrome DevTools
   # Lighthouse → Generate Report
   # Target: Performance >90, Accessibility 100
   ```

#### Success Criteria:
- [x] Reduced motion respected everywhere
- [x] Heavy components lazy loaded
- [x] GPU acceleration applied
- [x] Lighthouse Performance >90
- [x] Bundle size optimized (<500KB gzipped)
- [x] 60fps maintained on target devices

#### Files to Create:
- `src/app/hooks/useReducedMotion.ts`

#### Files to Modify:
- All animated components (add reduced motion check)
- `src/app/globals.css` (GPU acceleration)
- `src/app/App.tsx` (lazy loading)

---

### ✅ Phase 11: Accessibility & Testing (Week 7-8) ⭐ CRITICAL
**Goal:** Achieve WCAG 2.1 AAA compliance and cross-browser compatibility

**Reference:** Spec Section 8, 12, 13

**Tasks:**

1. **Color Contrast Audit**
   - Use WebAIM Contrast Checker
   - All text must meet 7:1 ratio (AAA level)
   - Fix any failing combinations

2. **Keyboard Navigation**
   ```tsx
   // Test checklist:
   // - Tab: Navigate through all interactive elements
   // - Shift+Tab: Navigate backwards
   // - Enter: Activate buttons
   // - Space: Activate buttons, scroll page
   // - Escape: Close modals
   // - Arrow keys: Navigate lists/menus
   
   // Add keyboard handlers to custom components
   <div
     role="button"
     tabIndex={0}
     onKeyDown={(e) => {
       if (e.key === 'Enter' || e.key === ' ') {
         e.preventDefault();
         handleClick();
       }
     }}
   />
   ```

3. **ARIA Labels**
   ```tsx
   // Add to all interactive elements
   <motion.button
     aria-label="Start voice conversation"
     aria-pressed={isActive}
     role="button"
   >
     {/* Button content */}
   </motion.button>
   
   // Live regions for dynamic content
   <div aria-live="polite" aria-atomic="true">
     {statusMessage}
   </div>
   ```

4. **Screen Reader Testing**
   - macOS: VoiceOver (Cmd+F5)
   - Windows: NVDA (free) or JAWS
   - Test all main flows:
     - Connect to agent
     - Send message
     - View workspace
     - Open settings
     - Start timer

5. **Focus Indicators**
   ```css
   /* Ensure visible focus on all elements */
   *:focus-visible {
     outline: 2px solid #00d9ff;
     outline-offset: 4px;
   }
   ```

6. **Cross-Browser Testing**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)
   - iOS Safari (iPhone 12+)
   - Chrome Android (Pixel 5+)

7. **Automated Accessibility Audit**
   ```bash
   # Install axe DevTools extension in Chrome
   # Run audit on all pages
   # Fix all errors and warnings
   ```

#### Success Criteria:
- [x] All text meets 7:1 contrast ratio
- [x] Full keyboard navigation works
- [x] All interactive elements have ARIA labels
- [x] Screen reader announces all actions
- [x] Focus indicators visible
- [x] No axe DevTools errors
- [x] Works on all target browsers
- [x] Mobile browsers tested on real devices

#### Testing Checklist:
- [ ] Contrast: All text 7:1+ ✓
- [ ] Keyboard: All flows navigable ✓
- [ ] ARIA: All labels present ✓
- [ ] Screen reader: Announces correctly ✓
- [ ] Focus: Indicators visible ✓
- [ ] Chrome: All features work ✓
- [ ] Firefox: All features work ✓
- [ ] Safari: All features work ✓
- [ ] Edge: All features work ✓
- [ ] iOS Safari: Touch works ✓
- [ ] Chrome Android: Touch works ✓

---

### ✅ Phase 12: Launch Preparation (Week 8)
**Goal:** Final QA, user testing, and production deployment

**Tasks:**

1. **Visual QA (Pixel-Perfect Review)**
   - Open Figma (if available) or spec screenshots
   - Compare side-by-side with implementation
   - Fix any visual discrepancies
   - Check spacing, sizing, colors, fonts

2. **Performance Benchmarks**
   - Document Lighthouse scores (Performance, Accessibility, Best Practices, SEO)
   - Document FPS during animations (use DevTools Performance)
   - Document bundle sizes (run `npm run build` and check `.next/` folder)
   - Create benchmarks table in README

3. **User Testing Sessions**
   - Recruit 5+ users (mix of technical and non-technical)
   - Give them tasks:
     - Connect to agent and have conversation
     - Create new project
     - Start timer
     - Change settings
     - Switch suites
   - Observe and take notes
   - Fix critical issues

4. **Bug Fixes from Testing**
   - Create GitHub issues for all bugs found
   - Prioritize: P0 (blocking), P1 (critical), P2 (nice-to-have)
   - Fix all P0 and P1 bugs before launch

5. **Update Documentation**
   - Update README.md with new features
   - Document new settings
   - Add screenshots/GIFs of new UI
   - Document keyboard shortcuts

6. **Create Release Notes**
   ```markdown
   # v2.0.0 - Production UI Transformation
   
   ## 🎨 Visual Enhancements
   - WebGL particle field background
   - Glassmorphism design system
   - Smooth scroll animations
   - Enhanced micro-interactions
   
   ## 🔧 New Features
   - Settings panel with developer mode
   - Particle toggle
   - Enhanced PTT button
   - Cinematic timer
   
   ## ♿ Accessibility
   - WCAG 2.1 AAA compliance
   - Full keyboard navigation
   - Screen reader support
   
   ## ⚡ Performance
   - 60fps animations
   - Reduced motion support
   - Lazy loading
   ```

7. **Deploy to Staging**
   ```bash
   # Build production bundle
   npm run build
   
   # Test production build locally
   npm run start
   
   # Deploy to staging (Vercel/Netlify/AWS)
   # ... deployment commands ...
   ```

8. **Stakeholder Approval**
   - Demo to stakeholders
   - Walk through all features
   - Get sign-off

9. **Deploy to Production**
   ```bash
   # Deploy to production
   # ... deployment commands ...
   
   # Monitor for errors (Sentry/LogRocket)
   # Monitor performance (Vercel Analytics)
   ```

#### Success Criteria:
- [x] Visual QA complete (pixel-perfect)
- [x] Performance benchmarks documented
- [x] 5+ user testing sessions completed
- [x] All P0/P1 bugs fixed
- [x] Documentation updated
- [x] Release notes written
- [x] Staging deployment successful
- [x] Stakeholder approval received
- [x] Production deployment successful
- [x] No critical errors in production

---

## Success Metrics (Project Complete When...)

### Performance
- [x] Lighthouse Performance Score: >90
- [x] Lighthouse Accessibility Score: 100
- [x] FPS during animations: 60fps on desktop, 30fps+ on mobile
- [x] Time to Interactive: <3 seconds on 4G
- [x] Bundle size (gzipped): <500KB core JS

### Accessibility
- [x] WCAG 2.1 AAA compliance verified
- [x] axe DevTools: 0 errors
- [x] Color contrast: All text 7:1+
- [x] Keyboard navigation: 100% coverage
- [x] Screen reader tested: VoiceOver + NVDA

### Browser Compatibility
- [x] Chrome 90+: All features work
- [x] Firefox 88+: All features work
- [x] Safari 14+: All features work
- [x] Edge 90+: All features work
- [x] iOS Safari 14+: Touch works, performance acceptable
- [x] Chrome Android 10+: Touch works, performance acceptable

### User Experience
- [x] User testing: 5+ sessions completed
- [x] Critical bugs: 0 remaining
- [x] High-priority bugs: 0 remaining
- [x] Stakeholder approval: Received

### Code Quality
- [x] No TypeScript errors
- [x] No ESLint errors
- [x] All components documented
- [x] README updated

---

## Critical Guidelines

### DO:
✅ Read the full spec (`.cursor/PRODUCTION_UI_DESIGN_SPEC.md`) before starting
✅ Follow the phase order (don't skip ahead)
✅ Test each phase thoroughly before moving to next
✅ Commit frequently with descriptive messages
✅ Check for accessibility at every step
✅ Monitor performance (FPS, bundle size)
✅ Respect reduced motion preferences
✅ Ask questions if spec is unclear

### DON'T:
❌ Skip Phase 6 (Developer Mode) - it's critical for clean UI
❌ Skip Phase 11 (Accessibility) - WCAG AAA is mandatory
❌ Break existing functionality
❌ Use `any` types in TypeScript
❌ Hard-code values (use design tokens)
❌ Forget to test on mobile
❌ Commit code with TypeScript or ESLint errors
❌ Deploy without user testing

---

## Communication & Reporting

### After Each Phase:
Report back with:
1. **Status:** Complete / Blocked / In Progress
2. **Success Criteria:** Which ones met (checkbox list)
3. **Testing Results:** Screenshots, performance metrics
4. **Issues Encountered:** Any blockers or questions
5. **Next Steps:** What you'll work on next

### Example Report:
```
Phase 2 Complete: Background Ambient System

✅ Success Criteria:
- [x] ParticleField renders with 2000 particles
- [x] Mouse parallax works
- [x] 60fps maintained on MacBook Air
- [x] Reduced motion respected
- [x] Toggle in settings works

📊 Performance:
- Desktop: 60fps ✓
- Mobile: 35fps (acceptable, reduced to 500 particles)
- Bundle size: +150KB

🐛 Issues:
- None

📸 Screenshots:
[Attach screenshots]

➡️ Next: Phase 3 - Core Component Redesign
```

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Foundation | 3 days | Week 1 |
| Phase 2: Particles | 4 days | Week 1-2 |
| Phase 3: Components | 5 days | Week 2-3 |
| Phase 4: PTT Button | 3 days | Week 3 |
| Phase 5: Timer | 2 days | Week 3-4 |
| Phase 6: Settings | 5 days | Week 4 |
| Phase 7: Scroll | 4 days | Week 4-5 |
| Phase 8: Micro-Interactions | 3 days | Week 5 |
| Phase 10: Performance | 5 days | Week 7 |
| Phase 11: Accessibility | 5 days | Week 7-8 |
| Phase 12: Launch | 5 days | Week 8 |
| **Total** | **44 days** | **7-8 weeks** |

---

## Questions? Need Help?

If you encounter:
- **Unclear specifications:** Ask human for clarification
- **Technical blockers:** Document the issue and ask for help
- **Performance issues:** Report FPS measurements and device details
- **Design decisions:** Refer to spec Section 1-6, ask if not covered

---

## Ready to Begin?

1. ✅ Read this entire prompt
2. ✅ Read `.cursor/PRODUCTION_UI_DESIGN_SPEC.md` (full spec)
3. ✅ Review current codebase (`src/app/`)
4. ✅ Set up project tracking (optional: create GitHub Project)
5. ✅ Start Phase 1: Foundation & Setup

**Begin implementation now. Report back after each phase completion.**

Good luck! 🚀

