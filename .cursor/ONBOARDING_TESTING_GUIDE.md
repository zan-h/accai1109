# Onboarding Splash Screen - Testing Guide

**Feature:** First-time user onboarding experience  
**Implemented:** November 22, 2025  
**Status:** Ready for manual testing

---

## Quick Start Testing

### Test 1: New User Experience (Primary Test)

**Goal:** Verify onboarding shows for first-time users

**Steps:**
1. Open Chrome (or your preferred browser)
2. Open DevTools (`Cmd+Option+I` on Mac, `F12` on Windows)
3. Go to: **Application → Local Storage → your domain**
4. Delete these keys:
   - `hasCompletedOnboarding`
   - `selectedSuiteId`
   - `hasSeenFirstConnection`
5. Close DevTools
6. Refresh the page (`Cmd+R` or `F5`)

**Expected Result:**
- ✅ You see the onboarding splash screen with:
  - Animated microphone icon (🎙️) with subtle pulse
  - Headline: "Get More Done, Feel Better Doing It"
  - Subheadline: "Voice AI that adapts to your energy, focus, and work style in real-time."
  - Blue "Choose Your Work Style →" button
  - Gray "Skip for now" link at bottom
  - Keyboard hint: "Press Enter to continue • Press Esc to skip"

---

### Test 2: Complete Onboarding Flow

**Goal:** Verify full flow from onboarding → suite selection → app

**Steps:**
1. Starting from Test 1 (onboarding visible)
2. Click "Choose Your Work Style →" button
3. Suite selector modal should appear
4. Select any suite (e.g., "Energy Aligned Work")
5. If templates prompt appears, choose "Add Templates" or "Skip"
6. You should now be in the main app

**Expected Result:**
- ✅ Smooth transition: Onboarding → Suite Selector → Main App
- ✅ No errors in console
- ✅ If you refresh now, onboarding does NOT appear again

---

### Test 3: Skip Onboarding Flow

**Goal:** Verify users can skip onboarding

**Steps:**
1. Clear localStorage again (repeat Test 1 steps 1-6)
2. You see onboarding splash
3. Click "Skip for now" link at bottom
4. Suite selector should appear immediately

**Expected Result:**
- ✅ Onboarding disappears when you click "Skip for now"
- ✅ Suite selector appears
- ✅ No errors in console
- ✅ Check localStorage: `hasCompletedOnboarding` should be `true`
- ✅ Check localStorage: `onboardingDismissedAt` should have a timestamp

---

### Test 4: Keyboard Navigation

**Goal:** Verify keyboard shortcuts work

**Steps:**
1. Clear localStorage again to see onboarding
2. **Press Enter key** (don't click anything)
3. Suite selector should appear
4. Select a suite and close modals to get to main app
5. Clear localStorage again to see onboarding
6. **Press Esc key**
7. Suite selector should appear (same as skip)

**Expected Result:**
- ✅ Enter key triggers "Choose Your Work Style" action
- ✅ Esc key triggers "Skip" action
- ✅ Keyboard navigation works smoothly

---

### Test 5: Returning User (Skip Onboarding)

**Goal:** Verify returning users don't see onboarding

**Steps:**
1. Make sure you've completed onboarding at least once
2. Check localStorage: `hasCompletedOnboarding` should be `true`
3. Refresh the page (`Cmd+R` or `F5`)

**Expected Result:**
- ✅ Onboarding does NOT appear
- ✅ You go straight to main app
- ✅ Normal app behavior

---

### Test 6: First Connection Celebration

**Goal:** Verify celebration message on first agent connection

**Steps:**
1. Clear localStorage: Delete only `hasSeenFirstConnection`
2. Make sure you're in the main app (complete onboarding if needed)
3. Click "CONNECT" button (in bottom toolbar)
4. Wait for connection to complete
5. Look at the **transcript/session panel** (middle panel)

**Expected Result:**
- ✅ When status changes to "CONNECTED", you see a breadcrumb message:
  - "🎉 Connected! Try saying: 'Help me figure out what to work on'"
- ✅ This only shows ONCE (first connection ever)
- ✅ If you disconnect and reconnect, it does NOT show again

---

### Test 7: Mobile Responsiveness

**Goal:** Verify onboarding works on mobile devices

**Steps:**
1. Open Chrome DevTools (`Cmd+Option+I`)
2. Click "Toggle device toolbar" icon (or press `Cmd+Shift+M`)
3. Select "iPhone 12 Pro" or "iPhone SE" from dropdown
4. Clear localStorage to trigger onboarding
5. Refresh page

**Expected Result:**
- ✅ Onboarding is readable on small screen
- ✅ Text is not cut off
- ✅ Button is easily tappable (44px+ touch target)
- ✅ Icon scales appropriately
- ✅ "Skip for now" link is visible and tappable
- ✅ Animations are smooth

**Bonus:** Test on actual mobile device if available

---

## Edge Cases to Test

### Edge Case 1: Interrupt Onboarding with Browser Back

**Steps:**
1. Clear localStorage, see onboarding
2. Press browser back button
3. Press browser forward button

**Expected:** Should show onboarding again (or handle gracefully)

---

### Edge Case 2: Multiple Tabs

**Steps:**
1. Clear localStorage
2. Open two browser tabs to the app
3. In Tab 1: Complete onboarding
4. In Tab 2: Refresh page

**Expected:** Tab 2 should not show onboarding (localStorage is shared)

---

### Edge Case 3: Partially Complete Onboarding

**Steps:**
1. Clear localStorage
2. Click "Choose Your Work Style"
3. In suite selector, close the browser tab entirely
4. Open app in new tab

**Expected:** Should show onboarding again OR suite selector (graceful handling)

---

## Visual Quality Checklist

While testing, verify these visual qualities:

- [ ] **Animations are smooth** (no janky transitions)
- [ ] **Text is readable** (good contrast, size)
- [ ] **Icon pulse is subtle** (not distracting)
- [ ] **Button hover states work** (color change on hover)
- [ ] **Focus states are visible** (blue outline when tabbing)
- [ ] **Spacing feels comfortable** (not cramped)
- [ ] **Modal is centered** on all screen sizes
- [ ] **Backdrop blur/overlay** is visible behind modal

---

## Accessibility Checklist

- [ ] **Tab navigation works** (can Tab through all elements)
- [ ] **Focus indicator visible** (blue outline on focused element)
- [ ] **Screen reader compatibility** (use VoiceOver on Mac or NVDA on Windows)
  - Should announce: "Dialog. Heading: Get More Done, Feel Better Doing It"
  - Should announce button: "Button: Choose your work style and get started"
- [ ] **Color contrast** (text is readable against background)
- [ ] **Keyboard only** (can complete entire flow without mouse)

---

## Browser Compatibility

Test on these browsers if possible:

- [ ] **Chrome** (latest) - Primary browser
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest) - Mac only
- [ ] **Safari iOS** - Mobile
- [ ] **Chrome Android** - Mobile

---

## Performance Checklist

- [ ] **Page load time** - Onboarding appears quickly (<500ms)
- [ ] **Animation performance** - Smooth 60fps animations
- [ ] **No console errors** - Check DevTools console
- [ ] **No memory leaks** - Check DevTools Memory tab after multiple refreshes

---

## Bugs to Watch For

Common issues that might occur:

1. **Onboarding shows for returning users**
   - Check: localStorage is being read correctly
   - Fix: Verify `hasCompletedOnboarding` logic in App.tsx

2. **Onboarding gets stuck (can't dismiss)**
   - Check: Click handlers working on CTA and Skip buttons
   - Fix: Verify event handlers in OnboardingWelcome.tsx

3. **Animations are janky**
   - Check: CSS animations in globals.css
   - Fix: Reduce animation complexity or duration

4. **Keyboard shortcuts don't work**
   - Check: Event listeners in useEffect
   - Fix: Verify keydown handler in OnboardingWelcome.tsx

5. **First connection toast doesn't show**
   - Check: localStorage key `hasSeenFirstConnection`
   - Fix: Verify useEffect dependency array in App.tsx

6. **Mobile layout broken**
   - Check: Responsive classes in OnboardingWelcome.tsx
   - Fix: Adjust padding, text sizes for mobile breakpoints

---

## How to Reset and Test Again

**Quick Reset (Test as new user):**
```javascript
// Paste in browser console
localStorage.removeItem('hasCompletedOnboarding');
localStorage.removeItem('selectedSuiteId');
localStorage.removeItem('hasSeenFirstConnection');
location.reload();
```

**Full Reset (Nuclear option):**
```javascript
// Paste in browser console
localStorage.clear();
location.reload();
```

---

## Success Criteria

Onboarding is successful if:

✅ **New users see onboarding** on first visit  
✅ **Returning users skip onboarding** automatically  
✅ **Flow is smooth** (Onboarding → Suite → App)  
✅ **User can skip** if they want  
✅ **Keyboard navigation works** (Enter/Esc)  
✅ **Mobile responsive** (works on iPhone, Android)  
✅ **First connection celebrated** (one time only)  
✅ **No console errors** during any flow  
✅ **Animations are smooth** and professional  
✅ **Accessible** (keyboard, screen reader)  

---

## Feedback Questions

After testing, please provide feedback on:

1. **Headline effectiveness:** Does "Get More Done, Feel Better Doing It" resonate?
2. **Onboarding brevity:** Is it too brief, too long, or just right?
3. **First connection celebration:** Should it be more prominent (like a toast notification)?
4. **Skip option:** Is it visible enough? Too prominent?
5. **Overall UX:** Does the flow feel smooth and welcoming?
6. **Bugs found:** Any issues or unexpected behavior?

---

## Implementation Details

**Files Modified:**
- `src/app/components/OnboardingWelcome.tsx` (new)
- `src/app/App.tsx` (integration)
- `src/app/globals.css` (animations)

**localStorage Keys:**
- `hasCompletedOnboarding` - Boolean
- `onboardingCompletedAt` - ISO timestamp
- `onboardingDismissedAt` - ISO timestamp (if skipped)
- `hasSeenFirstConnection` - Boolean

**No database changes** - All state stored in localStorage (client-side only)

---

**Happy Testing! 🎉**

