# Timer Notifications Guide for Agent Developers

**Last Updated:** November 18, 2025  
**Feature Status:** ✅ Production Ready

---

## Overview

This guide explains how to implement timer notification support in your voice agents. Timer notifications allow agents to proactively check in with users at key milestones during timed sessions without being explicitly prompted.

**What You'll Learn:**
1. How timer notifications work (architecture)
2. How to add notification support to your agents
3. Best practices for agent responses
4. Testing and debugging

---

## How It Works

### The Big Picture

```
User starts timer
      ↓
Timer.tsx runs every 100ms
      ↓
Detects milestone (25%, 50%, 75%, <5min, completion)
      ↓
Checks: Is toggle ON? Is this interval enabled? Already triggered?
      ↓
Emits CustomEvent('timer.interval')
      ↓
App.tsx catches event
      ↓
Formats as [TIMER_TYPE: details]
      ↓
sendUserText() → Agent receives message
      ↓
addTranscriptMessage(..., isSystemMessage: true)
      ↓
Agent responds naturally!
```

### Key Concepts

**1. System Messages**
- Notifications are sent to the agent but **NOT shown in the user's transcript**
- Achieved via `isSystemMessage: true` flag
- Agent sees them, user doesn't

**2. User Control**
- Users can toggle "Agent Check-ins" ON/OFF
- Default: ON (agents are engaged)
- OFF mode: Perfect for deep focus work

**3. Agent Configuration**
- Agents can specify which intervals they want when starting timers
- Default smart intervals: 50%, <5min, completion
- Customizable per timer via `notifications` parameter

---

## Adding Notification Support to Your Agent

### Step 1: Import Shared Guidelines

Add the timer notification guidelines to your agent's prompt file:

```typescript
// src/app/agentConfigs/suites/my-suite/prompts.ts

import { TIMER_NOTIFICATION_GUIDELINES } from "../../shared/prompts/timerNotifications";

export const myAgentPrompt = `
You are [Agent Name].

[Your agent instructions...]

# Tools at Your Disposal
- start_timer: Start a visible countdown timer
- get_timer_status: Check remaining time
- [other tools...]

${TIMER_NOTIFICATION_GUIDELINES}
`;
```

That's it! The shared guidelines handle all the instruction details.

### Step 2: Ensure Agent Has Timer Tools

Verify your agent has access to timer tools:

```typescript
// src/app/agentConfigs/suites/my-suite/index.ts

import { timerTools } from '../../shared/tools/workspace/timerTools';

export const myAgent = new RealtimeAgent({
  name: 'myAgent',
  voice: 'shimmer',
  instructions: myAgentPrompt,
  tools: [...basicWorkspaceTools, ...timerTools], // ← Include timer tools
  handoffs: [],
});
```

### Step 3: Test It!

1. Start your agent
2. Have the agent start a timer
3. Wait for halfway point
4. Agent should check in naturally!

---

## The Shared Guidelines

Located in `src/app/agentConfigs/shared/prompts/timerNotifications.ts`, these guidelines tell agents:

### When to Respond

**DO respond to:**
- **HALFWAY (50%)**: Brief check-in to gauge progress
- **FINAL_STRETCH (<5 min)**: Motivational push for strong finish
- **COMPLETE (100%)**: Celebrate and debrief

**DON'T respond to:**
- 25% and 75% marks (too frequent, can distract)
- Unless user explicitly requested frequent check-ins

### How to Respond

**Keep it BRIEF:**
- 1-2 sentences maximum
- No long explanations
- Get straight to the point

**Be NATURAL:**
- Don't mention you received a notification
- Don't read out exact time remaining
- Speak as if checking in organically

**Match YOUR personality:**
- Sprint coach → high energy, competitive
- Deep work guide → calm, focused
- Therapy assistant → gentle, supportive

### Example Responses

✅ **GOOD Halfway Responses:**
- "Halfway there! You're doing great."
- "50% done. How's it going?"
- "Nice progress! Keep it up."

✅ **GOOD Final Stretch Responses:**
- "5 minutes—bring it home!"
- "Almost there! Strong finish!"
- "Last few minutes. You got this!"

✅ **GOOD Completion Responses:**
- "Time! How'd you do?"
- "Session complete! What did you accomplish?"
- "Nice work! Feeling good about that?"

❌ **BAD Responses:**
- "I just received a TIMER_HALFWAY notification indicating..."
- "The timer shows you have exactly 4 minutes and 37 seconds..."
- "Tick tock! Time is passing! Stay focused!"
- "Let me interrupt your deep work to tell you you're doing great..."

---

## Configuring Notification Intervals

### Default Smart Intervals

When agents start a timer without specifying notifications, they get:

- ❌ 25%: OFF (too frequent)
- ✅ **50% (halfway)**: ON
- ❌ 75%: OFF (too frequent)
- ✅ **Final stretch (<5 min)**: ON
- ✅ **Completion**: ON

### Customizing Intervals

Agents can configure which intervals they want using the `notifications` parameter:

#### Example 1: Deep Work (Minimal Interruption)

```typescript
await start_timer({
  label: "Deep Work Session",
  durationMinutes: 90,
  notifications: {
    enableHalfway: false,        // Don't interrupt
    enableFinalStretch: true,    // Warn before ending
    enableCompletion: true       // Debrief after
  }
});
```

**Agent receives:**
- Nothing at 45 min (halfway skipped)
- Notification when <5 min remain
- Notification on completion

#### Example 2: High-Engagement Sprint (All Intervals)

```typescript
await start_timer({
  label: "Power Sprint",
  durationMinutes: 30,
  notifications: {
    enable25Percent: true,
    enableHalfway: true,
    enable75Percent: true,
    enableFinalStretch: true,
    enableCompletion: true
  }
});
```

**Agent receives:**
- Notification at 7.5 min (25%)
- Notification at 15 min (50%)
- Notification at 22.5 min (75%)
- Notification when <5 min remain
- Notification on completion

#### Example 3: Completion Only (Maximum Focus)

```typescript
await start_timer({
  label: "Meditation",
  durationMinutes: 20,
  notifications: {
    enableHalfway: false,
    enableFinalStretch: false,
    enableCompletion: true       // Only debrief at end
  }
});
```

**Agent receives:**
- Nothing during timer
- Notification only on completion

---

## Personality-Matched Responses

Different agent personalities should respond differently to the same notification.

### Example: Halfway Point (50%)

**Flow Sprints (Energetic, Competitive):**
> "Halfway there! You're crushing it. 5/10 tasks done!"

**GTD (Practical, Decisive):**
> "Halfway mark. Still in focus?"

**12-Week Month (Directive, Accountability-Forward):**
> "50% done. Keep the momentum!"

**Joe Hudson (Warm, Curious, Minimal):**
> "Halfway. How's it flowing?"

**IFS Therapy (Gentle, Supportive):**
> "You're halfway through. How are your parts feeling?"

### Example: Final Stretch (<5 min)

**Flow Sprints:**
> "5 minutes left—let's finish strong! 3 more tasks to hit target!"

**GTD:**
> "5 minutes remaining. Wrap up what you're on."

**12-Week Month:**
> "Final stretch. What can you complete?"

**Joe Hudson:**
> "5 minutes. Finishing this or stopping with integrity?"

**IFS Therapy:**
> "5 minutes remain. Take a breath. You've done well."

### Example: Completion

**Flow Sprints:**
> "Time! You did 8 tasks in 30 minutes. Let's break down the numbers..."

**GTD:**
> "Timer done. How did that task go?"

**12-Week Month:**
> "Sprint complete. What did you get done? Let's log it."

**Joe Hudson:**
> "Time's up. What happened—truthfully? What worked, what got in the way?"

**IFS Therapy:**
> "Session complete. What did you notice? How do you feel?"

---

## Agent Prompt Template

Here's a complete example for a new agent with timer support:

```typescript
import { TIMER_NOTIFICATION_GUIDELINES } from "../../shared/prompts/timerNotifications";

export const myProductivityCoachPrompt = `
You are a Productivity Coach helping users build focus and momentum.

SPEAKING STYLE: Energetic, supportive, brief. Like a friendly coach cheering them on.

# Your Role
- Help users start focused work sessions
- Provide encouragement at key moments
- Celebrate completions and wins
- Keep energy high but not overwhelming

# Starting Timers

When user commits to a work session:
1. Confirm the task: "Got it, you'll work on [task]."
2. Suggest duration: "How about 25 minutes?"
3. Start with fanfare: "Alright! 25 minutes on the clock. Let's do this!"
4. **IMPORTANT:** Call start_timer immediately after announcing start

Example:
await start_timer({
  label: "Report Writing",
  durationMinutes: 25
});

# During Timers

You'll receive automatic notifications at:
- Halfway point
- Final 5 minutes
- Completion

Respond briefly and naturally—no need to mention the notification!

# Your Tools
- start_timer: Begin a timed session
- get_timer_status: Check remaining time (use sparingly)
- pause_timer, resume_timer, stop_timer: Control active timer
- [other workspace tools...]

${TIMER_NOTIFICATION_GUIDELINES}
`;
```

---

## Message Format Reference

When intervals are reached, agents receive messages in this format:

### Interval Notifications

```
[TIMER_25_PERCENT: 25% complete, 22m 30s remaining for "30-min Sprint"]
[TIMER_HALFWAY: 50% complete, 15m remaining for "30-min Sprint"]
[TIMER_75_PERCENT: 75% complete, 7m 30s remaining for "30-min Sprint"]
[TIMER_FINAL_STRETCH: <5 minutes remaining for "30-min Sprint"]
```

### Completion Notification

```
[TIMER_COMPLETE: Timer complete for "30-min Sprint"]
```

### Parsing Tips

Agents don't need to parse these explicitly—just respond naturally. The format is designed to be:
- Self-documenting (clear what happened)
- Concise (no verbose explanations)
- Structured (consistent pattern)

---

## Best Practices

### DO

✅ **Keep responses under 10 seconds of speech**
✅ **Match your agent's personality**
✅ **Use the halfway check-in to gauge progress**
✅ **Use final stretch to motivate strong finish**
✅ **Use completion to debrief and celebrate**
✅ **Respect user's flow state—brief is better**
✅ **Test with different timer lengths**

### DON'T

❌ **Don't mention receiving a notification**
❌ **Don't read out exact seconds remaining**
❌ **Don't interrupt unnecessarily**
❌ **Don't give long motivational speeches**
❌ **Don't respond to 25% and 75% by default**
❌ **Don't assume user wants frequent check-ins**

---

## Testing Your Implementation

### Quick Test (5 minutes)

1. Start development server: `npm run dev`
2. Select your agent suite
3. Ask agent to start a 5-minute timer
4. Wait ~2.5 minutes (halfway)
5. **Expected:** Agent checks in briefly
6. Wait until <5 min mark (should be almost immediate for 5-min timer)
7. **Expected:** Agent encourages to finish
8. Wait for completion
9. **Expected:** Agent asks about results

### Full Test (30 minutes)

See `TIMER_NOTIFICATIONS_TEST_SUITE.md` for comprehensive test plan.

**Key Tests:**
- Agent responds at halfway (50%)
- Agent responds at final stretch (<5 min)
- Agent responds at completion
- Responses match personality
- Responses are brief (1-2 sentences)
- Agent doesn't mention "notification"

### Debug Console Logs

Watch for these logs in browser console:

```
[Timer] Interval event: halfway
⏰ Sent timer notification to agent: [TIMER_HALFWAY: ...]
✓ Added system message to transcript
```

If you see these logs but agent doesn't respond:
- Check agent prompt has timer notification guidelines
- Verify agent session is connected
- Check "Agent Check-ins" toggle is ON

---

## Advanced: Context-Aware Responses

Agents can provide more contextual responses by:

### 1. Tracking User State

```typescript
// In agent logic
if (userReportedStuck && at_halfway) {
  respond("Halfway there. Still stuck? Want to talk through it?");
} else {
  respond("Halfway mark! How's it flowing?");
}
```

### 2. Matching Session Type

```typescript
// For short sprints (15-25 min)
respond_energetically("Halfway! You're flying!");

// For deep work (60+ min)
respond_calmly("Halfway through. Still focused?");
```

### 3. Referencing Task Complexity

```typescript
if (task_is_complex && at_final_stretch) {
  respond("5 minutes left. Focus on wrapping up, not perfecting.");
} else {
  respond("5 minutes—sprint to the finish!");
}
```

---

## Common Patterns

### Pattern 1: Sprint with Task Tracking

**Flow Sprints** agents track completed tasks during sprint:

```
Agent: "30 minutes starting... GO!"
[starts timer]

[15 minutes - halfway]
Agent: "Halfway! You're at 4/10 tasks—right on pace!"

[<5 minutes]
Agent: "5 minutes left! You're at 7/10—3 more to hit target. Let's GO!"

[completion]
Agent: "TIME! You completed 9 tasks in 30 minutes. Let's review..."
```

### Pattern 2: Deep Work with Minimal Interruption

**GTD** agents respect deep focus:

```
Agent: "Starting 90-minute deep work session. I'll check in near the end."
[starts timer with enableHalfway: false]

[85 minutes - final stretch]
Agent: "5 minutes remain on your deep work block."

[completion]
Agent: "Session complete. How was the focus? Did you make progress on [task]?"
```

### Pattern 3: Body-Aware Work Session

**Joe Hudson** agents check somatic state:

```
Agent: "20 minutes. I'll start the timer."
[starts timer]

[10 minutes - halfway]
Agent: "Halfway. Where are you feeling this in your body?"

[<5 minutes]
Agent: "5 minutes. Still with it, or time to stop with integrity?"

[completion]
Agent: "Time. What happened? What worked, what got in the way?"
```

---

## Troubleshooting

### Agent not responding to notifications

**Check 1:** Agent has timer notification guidelines in prompt?
```typescript
${TIMER_NOTIFICATION_GUIDELINES}  // ← This line present?
```

**Check 2:** Agent has timer tools?
```typescript
tools: [...basicWorkspaceTools, ...timerTools]  // ← Timer tools included?
```

**Check 3:** User toggle is ON?
- Look at timer UI—is "Agent Check-ins" showing "✓ ON"?

**Check 4:** Agent disabled this interval?
- Check if agent used `notifications: { enableHalfway: false }` when starting timer

**Check 5:** Console shows events firing?
```
[Timer] Interval event: halfway  // ← Should see this
```

### Agent responses appear in transcript

Should NOT happen. If visible:

**Check:** `addTranscriptMessage` called with `isSystemMessage: true`
```typescript
addTranscriptMessage(itemId, 'user', text, false, true);
                                              //    ↑ This should be true
```

**Check:** `Transcript.tsx` filters system messages
```typescript
if (isHidden || isSystemMessage) {
  return null;  // ← Should not render
}
```

### Events firing multiple times

Should NOT happen. If duplicates:

**Check:** `triggeredIntervals` Set is working
```typescript
if (activeTimer.triggeredIntervals.has('halfway')) {
  return;  // ← Should prevent duplicate
}
```

**Check:** Only one interval detection `useEffect` running

---

## Examples from Production Suites

### Flow Sprints Task Logger

```typescript
import { TIMER_NOTIFICATION_GUIDELINES } from "../../shared/prompts/timerNotifications";

export const taskLoggerPrompt = `
You are the Task Logger. During sprints, you celebrate every win.

[...role description...]

# Time Check-Ins

**Halfway point:**
"Quick check: halfway through! You're at 5/10 - right on pace!"

**5 minutes left:**
"5 minutes left! You're at 7/10 - 3 more to hit target. Let's GO!"

**Time's up (when timer completes):**
"TIME! Sprint complete! You did [X] tasks in [Y] minutes - let's see how you did!"
[Hand off to recordBreaker for analysis]

# Tools at Your Disposal
- get_timer_status: Check remaining time
- Write to "Sprint Log" CSV for EVERY task

${TIMER_NOTIFICATION_GUIDELINES}
`;
```

### Joe Hudson Simple Orchestrator

```typescript
import { TIMER_NOTIFICATION_GUIDELINES } from "../../shared/prompts/timerNotifications";

export const simpleOrchestratorPrompt = `
You are the Simple Orchestrator embodying Joe Hudson's approach.

[...role description...]

**PHASE 2: WORK SPRINT (10-25 minutes)**
5. "Great. I'll start the timer and capture your note."
   - Use start_timer tool with the agreed duration
6. At 50% mark (optional): "Want to continue or stop at 10 minutes?"
7. When done: Move to Phase 3.

**PHASE 3: REFLECTION (≤90 seconds)**
1. "What happened—truthfully? What worked, what got in the way?"
2. "What's one insight?"
3. "What's the next micro-step?"

ALWAYS:
- Keep responses ≤12 seconds

${TIMER_NOTIFICATION_GUIDELINES}
`;
```

---

## Related Documentation

- **[TIMER_FEATURE_GUIDE.md](./TIMER_FEATURE_GUIDE.md)** - Complete timer system documentation
- **[TIMER_NOTIFICATIONS_TEST_SUITE.md](./TIMER_NOTIFICATIONS_TEST_SUITE.md)** - Testing procedures
- **[CREATING_NEW_SUITES.md](./CREATING_NEW_SUITES.md)** - How to create new agent suites

---

## Version History

**v1.0 - November 18, 2025**
- Initial release
- Covers basic notification implementation
- Includes examples from 4 production suites
- Comprehensive best practices

---

## Questions or Issues?

- Review test suite: `TIMER_NOTIFICATIONS_TEST_SUITE.md`
- Check existing implementations in Flow Sprints, GTD, 12-Week Month, Joe Hudson suites
- Look for console logs during timer operation
- Use browser DevTools React inspector to check state

Happy building! 🎉

