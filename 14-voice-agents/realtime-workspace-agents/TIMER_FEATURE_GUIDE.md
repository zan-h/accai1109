# Timer Feature Guide

## Overview

The Timer feature allows voice agents to start, pause, resume, and stop visible countdown timers that users can see in the UI. This is perfect for:

- **Focus sprints** (Flow Sprints suite)
- **Deep work sessions** (GTD suite)
- **Execution sprints** (12-Week Month suite)
- **Work sessions** (Joe Hudson suite)
- **Therapy sessions** (IFS Therapy suite)
- Any timed activity where users benefit from seeing countdown progress

## User Experience

### Visual Design

The timer appears as a **floating overlay** in the top-right corner of the screen with:

- **Large countdown display** (MM:SS format)
- **Progress bar** with percentage complete
- **Agent Check-ins toggle** (NEW!) - Control whether agents respond during timer
- **Status indicator** (Running, Paused, or Completed)
- **Session label** (e.g., "30-min Sprint", "Deep Work Session")
- **Elapsed/Remaining time** display
- **Control buttons** (Pause/Resume, Stop)
- **Minimized view** option for less distraction

### Color Coding

The timer uses intelligent color coding for at-a-glance status:

- **Cyan** (accent-primary): Normal running state
- **Yellow** (status-warning): Less than 5 minutes remaining OR paused
- **Red** (status-error): Less than 1 minute remaining (with pulse animation)
- **Green** (status-success): Timer completed

### States

1. **Running**: Timer actively counting down
2. **Paused**: Timer stopped but can be resumed
3. **Completed**: Timer reached zero (shows "TIME'S UP!" message)

### Agent Notifications (NEW!)

**Feature:** Agents can now automatically check in with users at key milestones during timed sessions!

#### How It Works

When a timer is running with agent notifications enabled, the agent will receive automatic notifications at strategic intervals:

- **Halfway (50%):** "Halfway there! How's it going?"
- **Final Stretch (<5 min):** "5 minutes left—finish strong!"
- **Completion (100%):** "Time's up! What did you accomplish?"

These notifications are sent **invisibly** to the agent (not shown in the user's transcript) so the agent can proactively check in without being explicitly prompted.

#### User Control: Agent Check-ins Toggle

Users have full control over agent responsiveness via the **"Agent Check-ins"** toggle:

- **ON (default):** Agent will check in at intervals - motivating and accountable
- **OFF:** Agent stays silent during timer - perfect for deep focus work

**Location:** Toggle appears between the progress bar and control buttons.

**Visual States:**
- **ON:** Green button with "✓ ON" - agent is actively monitoring
- **OFF:** Gray button with "✗ OFF" - agent won't interrupt

#### When to Use Each Mode

**Agent Check-ins ON:**
- Sprint sessions where motivation helps
- When you want accountability
- Learning to build a new habit
- Short timers (15-30 minutes)

**Agent Check-ins OFF:**
- Deep focus work requiring zero interruption
- When you're in flow state
- Long timers (60+ minutes)
- Meditation or therapy sessions

#### What Agents Receive

When an interval is reached, agents receive a structured system message:

```
[TIMER_HALFWAY: 50% complete, 15m remaining for "30-min Sprint"]
[TIMER_FINAL_STRETCH: <5 minutes remaining for "30-min Sprint"]
[TIMER_COMPLETE: Timer complete for "30-min Sprint"]
```

Agents are trained to respond naturally and briefly (1-2 sentences) without explicitly mentioning they received a notification.

**Example Responses:**
- Flow Sprints: "Halfway there! You're crushing it. 5/10 tasks done!"
- GTD: "Halfway mark. Still in focus?"
- 12-Week Month: "50% done. Keep the momentum!"
- Joe Hudson: "Halfway. How's it flowing?"

> **For detailed agent implementation:** See [TIMER_NOTIFICATIONS_GUIDE.md](./TIMER_NOTIFICATIONS_GUIDE.md)

## For Developers

### Adding Timer Support to an Agent

#### Step 1: Import Timer Tools

```typescript
import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';
```

#### Step 2: Add to Agent's Tools Array

```typescript
export const myAgent = new RealtimeAgent({
  name: 'myAgent',
  voice: 'shimmer',
  instructions: myAgentPrompt,
  tools: [...basicWorkspaceTools, ...timerTools], // Add timer tools here
  handoffs: [],
});
```

#### Step 3: Update Agent Prompt

Add instructions to the agent's prompt about when and how to use timers:

```typescript
export const myAgentPrompt = `
You are a productivity coach.

# Your Tools

- **start_timer**: Start a visible countdown timer for the user
  - Use when beginning a focus session, sprint, or timed activity
  - Example: start_timer({ label: "30-min Deep Work", durationMinutes: 30 })

- **get_timer_status**: Check how much time remains
  - Use to provide time-based encouragement
  - Returns remaining minutes, seconds, and completion percentage

- **pause_timer**: Pause the running timer
- **resume_timer**: Resume a paused timer  
- **stop_timer**: Stop and clear the timer

# When to Start Timers

1. When user commits to a work session: "Ready to start? I'll set a 25-minute timer."
2. After setting up a sprint: "Alright, timer starting... GO!"
3. For deep work: "I'm starting a 90-minute deep work timer for you."

**Important**: Always announce when you're starting the timer, as it creates accountability and excitement.
`;
```

### Available Timer Tools

#### 1. `start_timer`

Starts a new visible countdown timer with optional notification preferences.

**Parameters:**
- `label` (string, optional): Descriptive name for the timer (e.g., "30-min Sprint")
- `durationMinutes` (number, required): Duration in minutes
- `notifications` (object, optional): Configure which intervals trigger agent check-ins
  - `enable25Percent` (boolean): Notify at 25% complete (default: false)
  - `enableHalfway` (boolean): Notify at 50% complete (default: true)
  - `enable75Percent` (boolean): Notify at 75% complete (default: false)
  - `enableFinalStretch` (boolean): Notify when <5 min remain (default: true)
  - `enableCompletion` (boolean): Notify on completion (default: true)

**Examples:**

Basic usage (uses smart defaults: halfway, final stretch, completion):
```typescript
await start_timer({
  label: "Pomodoro Session",
  durationMinutes: 25
});
```

Deep work session (minimal interruption):
```typescript
await start_timer({
  label: "Deep Work",
  durationMinutes: 90,
  notifications: {
    enableHalfway: false,        // Don't interrupt at 50%
    enableFinalStretch: true,    // Warn before ending
    enableCompletion: true       // Debrief after
  }
});
```

High-engagement sprint (all check-ins):
```typescript
await start_timer({
  label: "Power Hour",
  durationMinutes: 60,
  notifications: {
    enable25Percent: true,
    enableHalfway: true,
    enable75Percent: true,
    enableFinalStretch: true,
    enableCompletion: true
  }
});
```

**Returns:**
```json
{
  "message": "Timer started: \"Pomodoro Session\" for 25 minutes",
  "timer": {
    "label": "Pomodoro Session",
    "durationMinutes": 25,
    "status": "running",
    "notificationConfig": {
      "halfway": true,
      "finalStretch": true,
      "completion": true
    }
  }
}
```

#### 2. `get_timer_status`

Gets current timer status and remaining time.

**Parameters:** None

**Returns:**
```json
{
  "status": "running",
  "label": "30-min Sprint",
  "durationMinutes": 30,
  "elapsedMinutes": 12,
  "remainingMinutes": 18,
  "remainingSeconds": 1087,
  "percentComplete": 40
}
```

Or if no timer:
```json
{
  "status": "no_timer",
  "message": "No active timer."
}
```

#### 3. `pause_timer`

Pauses the currently running timer.

**Parameters:** None

**Returns:**
```json
{
  "message": "Timer paused."
}
```

#### 4. `resume_timer`

Resumes a paused timer.

**Parameters:** None

**Returns:**
```json
{
  "message": "Timer resumed."
}
```

#### 5. `stop_timer`

Stops and clears the current timer.

**Parameters:** None

**Returns:**
```json
{
  "message": "Timer stopped."
}
```

## Implementation Examples

### Example 1: Flow Sprints (Productivity)

The Sprint Launcher agent starts a timer when launching a sprint:

```typescript
// In sprintLauncherPrompt:
**5. The Launch**
"Alright, 30 minutes on the clock. Your target: 10 tasks. Ready? 3... 2... 1... GO!"

**IMPORTANT: When you say "GO!", immediately call the start_timer tool with:**
- label: "30-min Sprint"
- durationMinutes: 30
```

### Example 2: GTD (Time-Blocked Work)

The Context Guide offers to start a timer for deep work:

```typescript
# Deep Work Strategy
If user has 2+ hours and high energy:
- "You have 2 hours of high energy. This is deep work time!"
- "I recommend focusing on [Project X]. Want me to start a timer?"
- If yes, use start_timer tool (e.g., 60 or 120 minutes for deep work)
```

### Example 3: Joe Hudson (Work Sprints)

The Simple Orchestrator starts a timer for committed work sessions:

```typescript
5. "Great. I'll start the timer and capture your note."
   - Use start_timer tool with the agreed duration (typically 10-25 minutes)
6. At 50% mark (optional): "Want to continue or stop at 10 minutes?"
   - Use get_timer_status to check progress
```

## Best Practices

### For Agent Designers

1. **Always announce**: Tell the user when you're starting a timer
2. **Use descriptive labels**: "30-min Sprint" is better than just "Timer"
3. **Set appropriate durations**: Match timer length to task type
4. **Check-in strategically**: Use `get_timer_status` at key moments (halfway, final minutes)
5. **Celebrate completion**: When timer finishes, acknowledge the achievement

### For UX

1. **Minimize by default?** No - expanded view creates accountability
2. **Sound on completion?** Currently visual only (audio can be added)
3. **Multiple timers?** Currently one timer at a time (intentional simplicity)
4. **Persistence?** Timer survives page refresh (stored in React state)

## Technical Architecture

### State Management

Timer state is managed in `WorkspaceContext.tsx`:

```typescript
export interface TimerState {
  id: string;
  label: string;
  durationMs: number;
  startedAt: number;
  pausedAt: number | null;
  elapsedMs: number;
  status: 'running' | 'paused' | 'completed';
  
  // Agent notification settings (NEW!)
  triggeredIntervals: Set<string>;             // Tracks which intervals already fired
  notificationPreferences: TimerNotificationPreferences;  // Which intervals to enable
  agentNotificationsEnabled: boolean;          // User toggle state (default: true)
}

export interface TimerNotificationPreferences {
  enable25Percent: boolean;       // Notify at 25% (default: false)
  enableHalfway: boolean;         // Notify at 50% (default: true)
  enable75Percent: boolean;       // Notify at 75% (default: false)
  enableFinalStretch: boolean;    // Notify at <5 min (default: true)
  enableCompletion: boolean;      // Notify at 100% (default: true)
}
```

**New Fields Explained:**

- **`triggeredIntervals`**: A Set that prevents duplicate notifications. Once "halfway" fires, it won't fire again even if you pause/resume.
- **`notificationPreferences`**: Agent-configurable intervals (set via `start_timer` tool).
- **`agentNotificationsEnabled`**: User's toggle preference (controlled via UI toggle button).

### Component Hierarchy

```
App.tsx
  ├─ Listens for timer.interval and timer.complete events (NEW!)
  ├─ Sends notifications to agent via sendUserText() (NEW!)
  └─ Timer.tsx (floating overlay, always rendered)
     ├─ Reads from WorkspaceContext
     ├─ Updates every 100ms when running
     └─ Emits CustomEvents at intervals (NEW!)
```

**Event Flow (NEW!):**
```
Timer.tsx detects interval
      ↓
Emits window.dispatchEvent('timer.interval')
      ↓
App.tsx event listener catches event
      ↓
Formats as [TIMER_HALFWAY: ...]
      ↓
sendUserText() → Agent receives notification
      ↓
addTranscriptMessage(..., isSystemMessage: true)
      ↓
Agent responds (if notifications enabled)
```

### Helper Functions

Located in `WorkspaceContext.tsx`:

- `startTimerHelper()`: Creates new timer
- `pauseTimerHelper()`: Pauses active timer
- `resumeTimerHelper()`: Resumes paused timer
- `stopTimerHelper()`: Clears timer
- `getTimerStatusHelper()`: Returns current status

### Auto-Completion

Timer automatically transitions to "completed" state when time expires:

```typescript
useEffect(() => {
  if (!activeTimer || activeTimer.status !== 'running') return;
  
  const checkInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = activeTimer.elapsedMs + (now - activeTimer.startedAt);
    
    if (elapsed >= activeTimer.durationMs) {
      setActiveTimer((prev) => ({
        ...prev,
        status: 'completed',
        elapsedMs: prev.durationMs
      }));
    }
  }, 100);
  
  return () => clearInterval(checkInterval);
}, [activeTimer]);
```

## Suites with Timer Support

Currently implemented in:

- ✅ **Flow Sprints** - Sprint Launcher, Task Logger | **Notifications:** ✅ Full support
- ✅ **GTD** - Context Guide (deep work sessions) | **Notifications:** ✅ Full support
- ✅ **12-Week Month** - Execution Coach (execution sprints) | **Notifications:** ✅ Full support
- ✅ **Joe Hudson** - Simple Orchestrator (work sessions) | **Notifications:** ✅ Full support

All timer-enabled suites now support agent notifications! 🎉

Easy to add to any suite - just follow the 3-step process above, then add timer notification guidelines to agent prompts.

## Future Enhancements

Implemented:
- ✅ **Agent notifications at intervals** (November 2025)
- ✅ **User toggle for agent responsiveness** (November 2025)
- ✅ **Configurable notification preferences** (November 2025)

Potential future improvements:

1. **Sound notifications** when timer completes
2. **Multiple concurrent timers** (e.g., break timer + work timer)
3. **Timer history/analytics** (track all timed sessions)
4. **Recurring timers** (Pomodoro cycles)
5. **Break reminders** (suggest breaks after long sessions)
6. **Custom timer presets** (user-defined common durations)
7. **Timer sync across devices** (if multi-device support added)

## Troubleshooting

### Timer not visible
- Check that `<Timer />` is rendered in App.tsx
- Verify WorkspaceContext is wrapping the app

### Timer not starting
- Confirm agent has `timerTools` in its tools array
- Check agent prompt includes instructions to use timer
- Look in console for error messages

### Timer not updating
- Timer updates every 100ms - should be smooth
- Check browser console for JavaScript errors
- Verify React state is updating (use React DevTools)

### Agent not responding to timer notifications
- **Check toggle:** Is "Agent Check-ins" set to ON?
- **Check console:** Look for `[Timer] Interval event:` logs
- **Check agent prompt:** Does the agent have timer notification guidelines?
- **Check connection:** Is the agent session active?
- **Check notifications preference:** Did the agent disable this interval when starting the timer?

### Agent notifications appear in transcript
- Should NOT happen - notifications are system messages (`isSystemMessage: true`)
- If visible, check `Transcript.tsx` filtering logic (line ~87)
- Verify `addTranscriptMessage` is called with correct parameters in `App.tsx`

### Events firing multiple times
- Should NOT happen - `triggeredIntervals` Set prevents duplicates
- Check browser console for duplicate logs
- Verify Set logic in `Timer.tsx` interval detection (lines 120-175)

## Questions?

For implementation help or feature requests, see the codebase or ask the development team!



