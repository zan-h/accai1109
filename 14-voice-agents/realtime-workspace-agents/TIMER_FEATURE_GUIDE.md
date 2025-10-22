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

Starts a new visible countdown timer.

**Parameters:**
- `label` (string, optional): Descriptive name for the timer (e.g., "30-min Sprint")
- `durationMinutes` (number, required): Duration in minutes

**Example:**
```typescript
await start_timer({
  label: "Pomodoro Session",
  durationMinutes: 25
});
```

**Returns:**
```json
{
  "message": "Timer started: \"Pomodoro Session\" for 25 minutes",
  "timer": {
    "label": "Pomodoro Session",
    "durationMinutes": 25,
    "status": "running"
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
}
```

### Component Hierarchy

```
App.tsx
  └─ Timer.tsx (floating overlay, always rendered)
     └─ Reads from WorkspaceContext
     └─ Updates every 100ms when running
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

- ✅ **Flow Sprints** - Sprint Launcher, Task Logger
- ✅ **GTD** - Context Guide (deep work sessions)
- ✅ **12-Week Month** - Execution Coach (execution sprints)
- ✅ **Joe Hudson** - Simple Orchestrator (work sessions)

Easy to add to any suite - just follow the 3-step process above!

## Future Enhancements

Potential improvements:

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

## Questions?

For implementation help or feature requests, see the codebase or ask the development team!



