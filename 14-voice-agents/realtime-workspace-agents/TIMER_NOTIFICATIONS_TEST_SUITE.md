# Timer Notifications Test Suite

**Feature:** Agent-Driven Timer Notifications with User Toggle Control  
**Date Created:** November 18, 2025  
**Status:** Ready for Testing

---

## Test Overview

This test suite validates the timer notification system that allows agents to check in with users at key intervals during timed sessions.

**Key Features to Test:**
1. ✅ Timer interval detection and event emission
2. ✅ Agent notifications toggle (ON/OFF)
3. ✅ System messages (invisible to user, visible to agent)
4. ✅ Agent responses to timer notifications
5. ✅ Notification preferences (configurable intervals)

---

## Test Environment Setup

### Prerequisites
- Local development server running (`npm run dev`)
- Supabase connection active
- At least one agent suite with timer support (Flow Sprints, GTD, 12-Week Month, or Joe Hudson)
- Browser console open (to view debug logs)

### Testing Tools
- **Browser Console:** Check for timer event logs
- **Transcript UI:** Verify system messages are hidden
- **Timer UI:** Test the Agent Check-ins toggle
- **Voice Agent:** Listen for agent responses

---

## Test Plan

### Phase A: Core Timer Functionality (Baseline)
**Goal:** Ensure existing timer functionality still works

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| **A1: Start Timer** | Start a 5-minute timer | Timer starts counting down visually | ⬜ |
| **A2: Pause Timer** | Click pause button | Timer pauses, time frozen | ⬜ |
| **A3: Resume Timer** | Click resume button | Timer continues from paused time | ⬜ |
| **A4: Stop Timer** | Click stop button | Timer stops and resets | ⬜ |
| **A5: Visual Progress** | Watch progress bar | Progress bar fills smoothly | ⬜ |

---

### Phase B: Agent Notifications Toggle
**Goal:** Verify user control over agent notifications

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| **B1: Toggle Visible** | Start any timer | "Agent Check-ins" toggle appears below progress bar | ⬜ |
| **B2: Default State** | Check toggle state on new timer | Toggle is ON by default (green, "✓ ON") | ⬜ |
| **B3: Toggle OFF** | Click toggle to disable | Button turns gray, shows "✗ OFF" | ⬜ |
| **B4: Toggle ON** | Click toggle to re-enable | Button turns green, shows "✓ ON" | ⬜ |
| **B5: Tooltip** | Hover over toggle | Tooltip shows current state and action | ⬜ |
| **B6: State Persists** | Toggle OFF, pause/resume timer | Toggle state remains OFF through pause/resume | ⬜ |

---

### Phase C: Interval Detection (Technical)
**Goal:** Verify timer emits events at correct intervals

**Setup:** Open browser console, start timer with notifications ON

| Test | Timer Duration | Interval | Expected Console Log | Status |
|------|----------------|----------|---------------------|--------|
| **C1: 25% Mark** | 20 min | 5 min | `[Timer] Interval event: 25%` | ⬜ |
| **C2: Halfway** | 20 min | 10 min | `[Timer] Interval event: halfway` | ⬜ |
| **C3: 75% Mark** | 20 min | 15 min | `[Timer] Interval event: 75%` | ⬜ |
| **C4: Final Stretch** | 20 min | 16 min | `[Timer] Interval event: finalStretch` | ⬜ |
| **C5: Completion** | 20 min | 20 min | `[Timer] Timer complete event` | ⬜ |
| **C6: Short Timer** | 3 min | 1.5 min | Halfway event emitted | ⬜ |
| **C7: Toggle OFF** | 10 min | Any | NO events emitted (notifications disabled) | ⬜ |

**Verification:**
- Check console for `[Timer] Interval event: [type]` logs
- Verify events only fire once per interval (no duplicates)
- Verify events respect toggle state

---

### Phase D: System Messages (App.tsx Integration)
**Goal:** Verify events are sent to agent as system messages

**Setup:** Open browser console, start timer with Flow Sprints agent

| Test | Interval | Expected Console Log | Expected in Transcript | Status |
|------|----------|---------------------|----------------------|--------|
| **D1: Halfway Message Sent** | 50% | `[App.tsx] Sending timer notification to agent: [TIMER_HALFWAY: ...]` | Message NOT visible in UI | ⬜ |
| **D2: Halfway Message Added** | 50% | `[App.tsx] Added system message to transcript` | Message NOT visible in UI | ⬜ |
| **D3: Final Stretch Sent** | <5 min | `[App.tsx] Sending timer notification: [TIMER_FINAL_STRETCH: ...]` | Message NOT visible in UI | ⬜ |
| **D4: Completion Sent** | 100% | `[App.tsx] Sending timer notification: [TIMER_COMPLETE: ...]` | Message NOT visible in UI | ⬜ |
| **D5: Message Format** | Any | Check message format in console | Should be `[TIMER_TYPE: X% complete, Ym remaining for "Label"]` | ⬜ |

**Verification:**
- System messages appear in console logs
- System messages do NOT appear in transcript UI
- Messages sent via `sendUserText()` successfully

---

### Phase E: Agent Responses (Flow Sprints)
**Goal:** Verify agents respond appropriately to notifications

**Setup:** Use Flow Sprints suite, start 30-minute timer

| Test | Interval | Expected Agent Response | Status |
|------|----------|------------------------|--------|
| **E1: Halfway Check-in** | 15 min (50%) | Agent says something brief like "Halfway there! How's it going?" | ⬜ |
| **E2: Response Brevity** | 15 min | Response is ≤2 sentences, under 10 seconds | ⬜ |
| **E3: Final Stretch Push** | <5 min | Agent says something motivating like "5 minutes left—finish strong!" | ⬜ |
| **E4: Completion Debrief** | 30 min | Agent asks about results: "Time's up! What did you accomplish?" | ⬜ |
| **E5: Natural Tone** | Any | Agent doesn't mention "notification" or read out exact time | ⬜ |
| **E6: Personality Match** | Any | Responses match Flow Sprints energy (enthusiastic, competitive) | ⬜ |

---

### Phase F: Agent Responses (GTD)
**Goal:** Verify GTD agents respond with appropriate tone

**Setup:** Use GTD suite, start 60-minute deep work timer

| Test | Interval | Expected Agent Response | Status |
|------|----------|------------------------|--------|
| **F1: Halfway Check-in** | 30 min (50%) | Brief, calm: "Halfway mark. Still in focus?" | ⬜ |
| **F2: Final Stretch** | <5 min | Practical: "5 minutes remaining. Wrap up what you're on." | ⬜ |
| **F3: Completion** | 60 min | Asks about task: "Timer done. How did that task go?" | ⬜ |
| **F4: Tone Match** | Any | Decisive, practical, action-oriented (not hyper-energetic) | ⬜ |

---

### Phase G: Agent Responses (12-Week Month)
**Goal:** Verify execution coach responds appropriately

**Setup:** Use 12-Week Month suite, start 20-minute sprint

| Test | Interval | Expected Agent Response | Status |
|------|----------|------------------------|--------|
| **G1: Halfway Check-in** | 10 min (50%) | "50% done. Keep the momentum!" | ⬜ |
| **G2: Final Stretch** | <5 min | "Final stretch. What can you complete?" | ⬜ |
| **G3: Completion** | 20 min | "Sprint complete. What did you get done? Let's log it." | ⬜ |
| **G4: Tone Match** | Any | Energetic, directive, accountability-forward | ⬜ |

---

### Phase H: Agent Responses (Joe Hudson)
**Goal:** Verify Joe Hudson style responses (minimal, somatic)

**Setup:** Use Joe Hudson suite, start 15-minute sprint

| Test | Interval | Expected Agent Response | Status |
|------|----------|------------------------|--------|
| **H1: Halfway Check-in** | 7.5 min (50%) | Very brief: "Halfway. How's it flowing?" | ⬜ |
| **H2: Response Length** | Any | ≤12 seconds of speech (per agent guidelines) | ⬜ |
| **H3: Final Stretch** | <5 min | "5 minutes. Finishing this or stopping with integrity?" | ⬜ |
| **H4: Completion** | 15 min | "Time's up. What happened—truthfully? What worked, what got in the way?" | ⬜ |
| **H5: Tone Match** | Any | Warm, direct, curious, no jargon | ⬜ |

---

### Phase I: Notification Preferences (Agent Configuration)
**Goal:** Verify agents can configure which intervals they want

**Setup:** Test via agent tool calls (requires voice interaction or manual testing)

| Test | Configuration | Expected Behavior | Status |
|------|---------------|-------------------|--------|
| **I1: Default Config** | Agent calls `start_timer` without notifications param | Gets default (50%, final stretch, completion) | ⬜ |
| **I2: Deep Work Config** | Agent specifies only final stretch + completion | No halfway notification, only <5min and completion | ⬜ |
| **I3: High Engagement** | Agent enables all intervals (25%, 50%, 75%, final, complete) | All 5 notifications received | ⬜ |
| **I4: Minimal Config** | Agent disables all except completion | Only completion notification | ⬜ |
| **I5: Partial Override** | Agent only specifies `enableHalfway: false` | Uses defaults for others, skips halfway | ⬜ |

**Note:** These tests require agent cooperation or manual configuration testing.

---

### Phase J: Edge Cases & Error Handling
**Goal:** Ensure system handles unusual scenarios gracefully

| Test | Scenario | Expected Behavior | Status |
|------|----------|-------------------|--------|
| **J1: Very Short Timer** | 2-minute timer | Only completion event fires (no halfway) | ⬜ |
| **J2: Toggle Mid-Timer** | Start with ON, toggle OFF at 25% | No more events after toggle | ⬜ |
| **J3: Toggle Mid-Timer** | Start with OFF, toggle ON at 25% | Events start firing from 50% onward | ⬜ |
| **J4: Multiple Timers** | Start timer, stop, start new timer | triggeredIntervals resets correctly | ⬜ |
| **J5: Pause During Interval** | Pause at exactly 50% mark | Event fires once when threshold crossed | ⬜ |
| **J6: Resume After Interval** | Pause at 60%, resume | Doesn't re-fire 50% event | ⬜ |
| **J7: No Agent Active** | Start timer without agent connection | No errors, timer works normally | ⬜ |
| **J8: Agent Handoff** | Timer running, agent hands off to another | New agent receives subsequent notifications | ⬜ |

---

### Phase K: Performance & Stability
**Goal:** Ensure system is stable and performant

| Test | Scenario | Expected Behavior | Status |
|------|----------|---|--------|
| **K1: Timer Accuracy** | 10-minute timer | Completes within ±2 seconds of 10:00 | ⬜ |
| **K2: Event Timing** | Watch console timestamps | Events fire within ±3 seconds of target | ⬜ |
| **K3: No Memory Leaks** | Run 5 timers in succession | No console errors, memory stable | ⬜ |
| **K4: Console Clean** | Normal operation | No unexpected errors or warnings | ⬜ |
| **K5: UI Responsiveness** | During notifications | UI remains responsive, no lag | ⬜ |
| **K6: Multiple Check-ins** | 60-minute timer with all intervals | All notifications work without degradation | ⬜ |

---

## Test Execution Checklist

### Before Testing
- [ ] Pull latest code from repository
- [ ] Run `npm install` (if dependencies changed)
- [ ] Start development server (`npm run dev`)
- [ ] Open browser console
- [ ] Clear console and check for startup errors

### During Testing
- [ ] Test in order (A → K)
- [ ] Mark each test as ✅ (pass) or ❌ (fail)
- [ ] Document any bugs in "Bugs Found" section below
- [ ] Take screenshots of failures
- [ ] Note exact steps to reproduce issues

### After Testing
- [ ] Calculate pass rate: X/Y tests passed
- [ ] Prioritize bugs (critical → minor)
- [ ] Create bug fix plan
- [ ] Re-test after fixes

---

## Bugs Found

### Critical Bugs 🔴
<!-- Bugs that break core functionality -->

**Example:**
- **Bug ID:** BUG-001
- **Test:** E1 - Halfway Check-in
- **Issue:** Agent doesn't respond to halfway notification
- **Steps to Reproduce:**
  1. Start Flow Sprints suite
  2. Start 30-minute timer
  3. Wait for 15 minutes
- **Expected:** Agent says something like "Halfway there!"
- **Actual:** Agent is silent
- **Console Logs:** [paste relevant logs]
- **Priority:** Critical
- **Status:** 🔴 Not Fixed / 🟡 In Progress / 🟢 Fixed

---

### Major Bugs 🟠
<!-- Bugs that impact user experience but don't break functionality -->

---

### Minor Bugs 🟡
<!-- Polish issues, UI glitches, etc. -->

---

## Test Results Summary

**Total Tests:** 80  
**Tests Passed:** ___ / 80  
**Tests Failed:** ___ / 80  
**Pass Rate:** ___%

**Phase Results:**
- Phase A (Core Timer): ___ / 5
- Phase B (Toggle Control): ___ / 6
- Phase C (Interval Detection): ___ / 7
- Phase D (System Messages): ___ / 5
- Phase E (Flow Sprints): ___ / 6
- Phase F (GTD): ___ / 4
- Phase G (12-Week Month): ___ / 4
- Phase H (Joe Hudson): ___ / 5
- Phase I (Preferences): ___ / 5
- Phase J (Edge Cases): ___ / 8
- Phase K (Performance): ___ / 6

**Recommended Next Steps:**
1. Fix all critical bugs (🔴)
2. Fix all major bugs (🟠)
3. Re-test failed cases
4. Document any known minor issues (🟡) for future work
5. If pass rate ≥ 90%, proceed to documentation phase

---

## Notes & Observations

### What Worked Well
<!-- Document positive findings -->

### What Needs Improvement
<!-- Document areas for enhancement -->

### User Experience Feedback
<!-- Note any UX issues or suggestions -->

---

## Appendix: Manual Testing Scripts

### Script 1: Quick Smoke Test (5 minutes)
**Goal:** Verify basic functionality quickly

```
1. Start Flow Sprints agent
2. Say: "I want to do a 5-minute sprint"
3. Toggle notifications OFF
4. Wait for completion
5. Expected: Timer works, no agent check-ins
6. Start another 5-minute timer
7. Toggle notifications ON
8. Wait for completion
9. Expected: Agent checks in at end
```

### Script 2: Full Agent Response Test (30 minutes)
**Goal:** Test all intervals with real agent

```
1. Start Flow Sprints agent
2. Start 20-minute timer (notifications ON)
3. At 5 min (25%): No agent response expected
4. At 10 min (50%): Agent should check in
5. At 15 min (75%): No agent response expected
6. At ~16-17 min (<5 min left): Agent should motivate
7. At 20 min (complete): Agent should debrief
8. Record all responses and verify they match guidelines
```

### Script 3: Toggle Behavior Test (10 minutes)
**Goal:** Verify toggle works mid-session

```
1. Start 15-minute timer with notifications ON
2. At 3 minutes: Toggle OFF
3. At 7.5 minutes (halfway): Verify NO agent response
4. At 8 minutes: Toggle ON
5. At 11 minutes (<5 min): Verify agent DOES respond
6. At 15 minutes: Verify agent responds to completion
```

---

**Last Updated:** November 18, 2025  
**Tester:** [Your Name]  
**Version:** 1.0

