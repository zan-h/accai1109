# Chapter 3 Implementation — Code Appendices

This document maps specific code snippets from the implementation to sections in Chapter 3 of the dissertation. Each section includes relevant code examples with file paths and line numbers for reference.

---

## 3.1 Development Journey

### 3.1.1 Workspace Abstraction (Agent-Controlled Multi-Tab Documents)

**Description:** Tools that allow agents to create, read, and update markdown and CSV tabs, enabling persistent artefacts.

**File:** `src/app/agentConfigs/shared/tools/workspace/workspaceTools.ts`

```typescript
// Lines 26-49: Tool for adding workspace tabs
export const addTabTool = tool({
  name: 'add_workspace_tab',
  description: 'Add a new tab to the workspace',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the tab',
      },
      type: {
        type: 'string',
        description: "The type of the tab (e.g., 'markdown', 'csv', etc.)",
      },
      content: {
        type: 'string',
        description: 'The content of the tab to add',
      },
    },
    required: ['name', 'type'],
    additionalProperties: false,
  },
  execute: addWorkspaceTab,
});

// Lines 51-77: Tool for setting tab content
export const setContentTool = tool({
  name: 'set_tab_content',
  description: 'Set the content of a workspace tab (pipe-delimited CSV or markdown)',
  parameters: {
    type: 'object',
    properties: {
      index: {
        type: 'integer',
        nullable: true,
        description: '0-based position of the tab (optional – you can use id or name instead)',
        minimum: 0,
      },
      name: {
        type: 'string',
        nullable: true,
        description: 'The name of the tab (optional – you can use id or index instead)',
      },
      content: {
        type: 'string',
        description: 'The content for the tab (pipe-delimited CSV or markdown)',
      },
    },
    required: ['content'],
    additionalProperties: false,
  },
  execute: setTabContent,
});
```

**Key Implementation Details:**
- Tabs can be identified flexibly by name, index, or ID
- Supports both markdown and CSV formats
- Provides `get_workspace_info`, `add_workspace_tab`, `set_tab_content`, `rename_workspace_tab`, and `delete_workspace_tab` tools

### 3.1.2 Work Journal (Calendar-Organized Progress Tracking)

**Description:** Journal entries created by users, agents, or automatically by the timer when focus blocks complete.

**File:** `src/app/agentConfigs/shared/tools/journal/workJournalTools.ts`

```typescript
// Lines 50-107: Tool for agents to log accomplishments
export const addWorkJournalEntryTool = tool({
  name: 'add_work_journal_entry',
  description: `Log an accomplishment or progress note to the user's daily work journal.
  
  Use this when:
  - User reports completing a task or making progress
  - A timer/ritual completes and you want to log what was done
  - User achieves a milestone worth celebrating
  - You want to help them track their work for the day
  
  The entry will appear in the work journal UI with a 🤖 icon showing it came from you.
  
  Write entries naturally and conversationally - focus on what the user accomplished.
  Good: "Completed wireframe sketches" | Bad: "User worked on wireframes"`,
  parameters: {
    type: 'object',
    properties: {
      note: {
        type: 'string',
        description:
          'Brief description of what was accomplished (max 200 chars). Be specific and conversational.',
        maxLength: 200,
      },
      projectId: {
        type: 'string',
        description:
          'Optional UUID of the project this work relates to.',
      },
      durationMs: {
        type: 'number',
        description:
          'Optional duration in milliseconds from a timer.',
      },
    },
    required: ['note'],
    additionalProperties: false,
  },
  execute: addWorkJournalEntryHelper,
});
```

**Key Implementation Details:**
- Entries auto-tagged with `agentLogged: true` metadata
- 200-character limit for conciseness
- Dispatches `workJournal.addEntry` custom event
- Supports optional project association and duration tracking

### 3.1.3 Timer as Agent-Aware Mechanism

**Description:** Timer emits structured events at key milestones that agents can respond to when check-ins are enabled.

**File:** `src/app/components/Timer.tsx`

```typescript
// Lines 65-105: Interval detection and event emission
useEffect(() => {
  if (!activeTimer || activeTimer.status !== 'running') return;
  
  const checkInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = activeTimer.elapsedMs + (now - activeTimer.startedAt);
    const remaining = Math.max(0, activeTimer.durationMs - elapsed);
    const percentComplete = Math.min(100, (elapsed / activeTimer.durationMs) * 100);
    
    // Helper function to emit interval event
    const emitTimerIntervalEvent = (type: string) => {
      if (!activeTimer.agentNotificationsEnabled) return;
      if (activeTimer.triggeredIntervals.has(type)) return;
      
      activeTimer.triggeredIntervals.add(type);
      
      const event = new CustomEvent('timer.interval', {
        detail: {
          type,
          percentComplete: Math.round(percentComplete),
          remainingMs: remaining,
          remainingMinutes: Math.floor(remaining / 60000),
          label: activeTimer.label,
          timerId: activeTimer.id,
        },
      });
      window.dispatchEvent(event);
    };
    
    // Check intervals (25%, 50%, 75%, final stretch)
    if (activeTimer.notificationPreferences.enable25Percent && 
        percentComplete >= 25 && 
        !activeTimer.triggeredIntervals.has('25%')) 
      emitTimerIntervalEvent('25_percent');
      
    if (activeTimer.notificationPreferences.enableHalfway && 
        percentComplete >= 50 && 
        !activeTimer.triggeredIntervals.has('50%')) 
      emitTimerIntervalEvent('halfway');
      
    if (activeTimer.notificationPreferences.enable75Percent && 
        percentComplete >= 75 && 
        !activeTimer.triggeredIntervals.has('75%')) 
      emitTimerIntervalEvent('75_percent');
      
    if (activeTimer.notificationPreferences.enableFinalStretch && 
        remaining < 300000 && remaining > 60000 && 
        !activeTimer.triggeredIntervals.has('final_stretch')) 
      emitTimerIntervalEvent('final_stretch');
      
    if (activeTimer.notificationPreferences.enableCompletion && 
        remaining === 0 && elapsed >= activeTimer.durationMs && 
        !activeTimer.triggeredIntervals.has('complete')) 
      emitTimerIntervalEvent('complete');
    
  }, 100);
  
  return () => clearInterval(checkInterval);
}, [activeTimer, currentTime]);
```

**User Control - Agent Check-ins Toggle:**

```typescript
// Lines 237-259: ON/OFF toggle for agent notifications
<div className="absolute top-4 left-4 z-20 flex flex-col items-start group">
  <button
    onClick={toggleTimerNotifications}
    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full border transition-all ${
      activeTimer.agentNotificationsEnabled 
        ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' 
        : 'bg-white/5 border-white/10 text-text-tertiary'
    }`}
  >
    <span className="text-xs">🔔</span>
    <span className="text-[10px] font-mono font-bold uppercase">Agent</span>
  </button>
  
  {/* Hover Tooltip */}
  <div className="absolute top-full left-0 mt-2 w-40 p-2 rounded-lg bg-black/90 
                  border border-white/10 text-[10px] opacity-0 group-hover:opacity-100">
    {activeTimer.agentNotificationsEnabled 
      ? "Agent will receive progress updates to encourage you."
      : "Agent updates disabled. The timer runs silently."}
  </div>
</div>
```

**Key Implementation Details:**
- Events only fire when `agentNotificationsEnabled` is true (implements RQ2 ON/OFF manipulation)
- `triggeredIntervals` Set prevents duplicate notifications
- Events sent as invisible system messages to agents via `App.tsx`
- User retains full control via UI toggle

### 3.1.4 WebRTC-Based Realtime Voice Integration

**Description:** Migration from WebSocket to WebRTC for low-latency, echo-cancelled audio.

**File:** `src/app/hooks/useRealtimeSession.ts`

```typescript
// Lines 128-171: WebRTC session initialization
const connect = useCallback(
  async ({
    getEphemeralKey,
    initialAgents,
    audioElement,
    extraContext,
    outputGuardrails,
  }: ConnectOptions) => {
    if (sessionRef.current) return; // already connected

    updateStatus('CONNECTING');

    const ek = await getEphemeralKey();
    const rootAgent = initialAgents[0];

    // Codec selection for voice quality simulation
    const codecParam = codecParamRef.current;
    const audioFormat = audioFormatForCodec(codecParam);

    sessionRef.current = new RealtimeSession(rootAgent, {
      transport: new OpenAIRealtimeWebRTC({
        audioElement,
        // Set preferred codec before offer creation
        changePeerConnection: async (pc: RTCPeerConnection) => {
          applyCodec(pc);
          return pc;
        },
      }),
      model: 'gpt-4o-realtime-preview-2024-06-03',
      config: {
        inputAudioFormat: audioFormat,
        outputAudioFormat: audioFormat,
        inputAudioTranscription: {
          model: 'whisper-1',
        },
      },
      outputGuardrails: outputGuardrails ?? [],
      context: extraContext ?? {},
    });

    await sessionRef.current.connect({ apiKey: ek });
    updateStatus('CONNECTED');
  },
  [callbacks, updateStatus],
);
```

**Key Implementation Details:**
- `OpenAIRealtimeWebRTC` provides encrypted, jitter-buffered, echo-cancelled audio
- Supports codec preferences (opus, pcmu8, pcma8) for quality/bandwidth trade-offs
- Whisper-1 transcription enabled for both user and assistant speech
- Output guardrails injected at session level

### 3.1.5 Production Persistence (Supabase PostgreSQL)

**Description:** Separate tables for `voice_sessions` and `transcript_items` with row-level security.

**File:** `supabase/migrations/004_voice_sessions_and_transcripts.sql`

```sql
-- Lines 14-32: Voice sessions table
CREATE TABLE voice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  suite_id TEXT NOT NULL,                    -- 'energy-focus', 'baby-care', etc.
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,                      -- NULL if session still active
  is_active BOOLEAN DEFAULT true,            -- Can user reconnect?
  last_activity_at TIMESTAMPTZ DEFAULT NOW(), -- Updated on each transcript save
  metadata JSONB DEFAULT '{}'::jsonb,        -- agent_handoffs, tool_calls_count
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_project ON voice_sessions(project_id, started_at DESC);
CREATE INDEX idx_sessions_active ON voice_sessions(project_id, is_active) WHERE is_active = true;
```

```sql
-- Lines 40-63: Transcript items table
CREATE TABLE transcript_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES voice_sessions(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,                     -- Frontend itemId
  type TEXT NOT NULL CHECK (type IN ('MESSAGE', 'BREADCRUMB')),
  role TEXT CHECK (role IN ('user', 'assistant')),
  title TEXT,                                -- Message content or breadcrumb title
  data JSONB,                                -- Breadcrumb data (tool calls, events)
  timestamp TEXT NOT NULL,                   -- "14:23:45.123"
  created_at_ms BIGINT NOT NULL,            -- Unix ms (for ordering)
  status TEXT NOT NULL CHECK (status IN ('IN_PROGRESS', 'DONE')),
  is_hidden BOOLEAN DEFAULT false,
  guardrail_result JSONB,                    -- Full GuardrailResultType
  sequence INTEGER NOT NULL,                 -- Order within session
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(session_id, item_id)
);
```

**Row-Level Security:**

```sql
-- Lines 72-86: RLS policies
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_items ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions
CREATE POLICY users_own_sessions ON voice_sessions
  FOR ALL
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Users can only access transcript items from their own sessions
CREATE POLICY users_own_transcript_items ON transcript_items
  FOR ALL
  USING (session_id IN (
    SELECT id FROM voice_sessions WHERE user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  ));
```

**Key Implementation Details:**
- `voice_sessions` tracks each continuous conversation
- `transcript_items` maps 1:1 with frontend `TranscriptItem` type
- RLS ensures users can only access their own data
- Auto-updates `last_activity_at` on transcript inserts
- Helper function `end_stale_sessions()` for cleanup

---

## 3.2 Functional Goals & Constraints

### 3.2.1 Goal (c): Structured Within-Session Interventions (ON/OFF)

**Description:** Single-action toggle determining whether agents may initiate brief check-ins.

**File:** `src/app/contexts/WorkspaceContext.tsx`

```typescript
// Lines 391-410: Timer with notification preferences
const startTimer = useCallback((
  label: string, 
  durationMs: number, 
  notificationPreferences?: Partial<TimerNotificationPreferences>
) => {
  const newTimer: TimerState = {
    id: createTabId(),
    label,
    durationMs,
    startedAt: Date.now(),
    pausedAt: null,
    elapsedMs: 0,
    status: 'running',
    // Agent notification settings
    triggeredIntervals: new Set<string>(),
    notificationPreferences: {
      ...DEFAULT_TIMER_NOTIFICATIONS,
      ...notificationPreferences,
    },
    agentNotificationsEnabled: true, // Enabled by default
  };
  setActiveTimer(newTimer);
  console.log(`⏱️  Timer started: "${label}" (agent notifications: ON)`);
}, []);
```

**Timer Notification Structure:**

```typescript
// Lines 374-380: Notification preferences interface
export interface TimerNotificationPreferences {
  enable25Percent: boolean;       // Notify at 25%
  enableHalfway: boolean;         // Notify at 50% (default: true)
  enable75Percent: boolean;       // Notify at 75%
  enableFinalStretch: boolean;    // Notify at <5 min (default: true)
  enableCompletion: boolean;      // Notify at 100% (default: true)
}
```

**Key Implementation Details:**
- Default smart intervals: 50%, <5min, completion
- Agents can customize intervals via `start_timer` tool
- User toggle (`agentNotificationsEnabled`) gates all emissions
- Creates clean within-participant contrast (ON vs OFF)

### 3.2.2 Goal (d): Embedded, Low-Burden Measurement

**Description:** Inline pre-/post-session scales and single-item focus/progress ratings.

**File:** `src/app/components/experiments/ExperimentQuestionnaireModal.tsx`

```typescript
// Lines 38-94: Post-session questionnaire submission
const handleSubmit = async () => {
  // Basic validation
  if (type === 'experiment_1') {
    if (controlScore === null || workloadScore === null || safetyScore === null) {
      showToast('Please answer all rating questions', 'error');
      return;
    }
  }

  setIsSubmitting(true);

  try {
    const results: any = {
      controlScore,
      comments,
    };

    if (type === 'experiment_1') {
      results.workloadScore = workload Score;
      results.safetyScore = safetyScore;
    }

    // Call API to save results
    const response = await fetch('/api/experiments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        experimentType: type,
        results,
        userAgent: navigator.userAgent,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save results');
    }
    
    showToast('Thank you! Experiment session complete.', 'success');
    closeExperiment();
  } catch (error) {
    console.error('Failed to submit experiment:', error);
    showToast('Failed to save results. Please try again.', 'error');
  } finally {
    setIsSubmitting(false);
  }
};
```

**Experiment Orchestration:**

```typescript
// Lines 15-33: Timer completion triggers questionnaire
useEffect(() => {
  if (!isActive || stage !== 'running' || type !== 'experiment_1') return;

  const handleTimerComplete = () => {
    console.log('🧪 Experiment 1: Timer completed, showing questionnaire');
    showToast('Session complete! Please fill out the quick survey.', 'success');
    completeExperiment(); // Moves to 'completed' stage
  };

  window.addEventListener('timer.complete', handleTimerComplete);
  window.addEventListener('timer.completed', handleTimerComplete);

  return () => {
    window.removeEventListener('timer.complete', handleTimerComplete);
    window.removeEventListener('timer.completed', handleTimerComplete);
  };
}, [isActive, stage, type, completeExperiment, showToast]);
```

**Key Implementation Details:**
- Scales: agency (control), workload, emotional safety, satisfaction
- Brief, clearly signposted, recoverable if skipped
- Auto-triggers on timer completion
- Minimal disruption to work session

---

## 3.3 Multi-Agent Voice Agent Design

### 3.3.1 Prompt Specificity and the DETAIL Framework

**Description:** Agents are specified across task, behavioral, temporal, and analogical dimensions.

**File:** `src/app/agentConfigs/suites/energy-focus/prompts.ts`

```typescript
// Lines 1-37: Grounding Guide prompt with detailed specifications
export const groundingGuidePrompt = `You are the Grounding Guide for the Energy Aligned Work suite.

## Your Role
Check in on the user's body, emotions, and energy level. Help them understand their 
current state before they start working.

## Core Directive
Pure state assessment. NO task planning yet. Just help the user understand where 
they're at right now.

## Conversation Pattern
1. Ask about their body: "How's your body feeling right now?"
2. Check their energy level: "On a scale of 1-10, what's your energy like?"
3. Notice emotions: "What are you feeling right now?"
4. Reflect back what you hear

## Voice & Tone
- Calm and grounding
- Present and attentive
- No rushing to solutions
- Simple, direct questions

## Key Guidelines
- Keep check-in under 5 minutes
- Don't suggest tasks or work plans
- Just help them notice their current state
- Log findings to Daily Check-In workspace tab
- When done, hand off to Capacity Mapper

## What NOT to do
- Don't plan their day
- Don't suggest specific tasks
- Don't push them to work if energy is low
- Don't skip the body check-in

Your job is to help them get grounded and aware. That's it.
`;
```

**Key Implementation Details:**
- **Task specificity:** "Pure state assessment. NO task planning yet."
- **Behavioral specificity:** "Calm and grounding", "Simple, direct questions"
- **Temporal specificity:** "Keep check-in under 5 minutes"
- **Analogical grounding:** "like a gentle yoga instructor at the start of class" (in other agents)

### 3.3.2 Structured Conversation States

**Description:** State machines encoded in JSON providing explicit flow scaffolding.

**File:** `src/app/agentConfigs/suites/ifs-therapy/prompts.ts`

```typescript
// Lines 51-169: Grounding & Consent state machine
# Conversation States
```
[
  {
    "id": "1_safety_check",
    "description": "Verify user is in a safe, private environment",
    "instructions": [
      "Ask: 'Are you in a private, safe place right now, and not driving?'",
      "If NO: 'Let's pause here. Say resume when you're in a safe spot.'",
      "If YES: proceed to opt-out"
    ],
    "examples": [
      "Before we begin, I need to check—are you in a safe, private space?",
      "Perfect. Safety first."
    ],
    "transitions": [{
      "next_step": "2_opt_out",
      "condition": "Once safety is confirmed"
    }]
  },
  {
    "id": "2_opt_out",
    "description": "Establish the stop-word protocol",
    "instructions": [
      "Inform user their stop-word is 'pause'—they can use it anytime",
      "Emphasize: no explanation needed, instant stop",
      "Acknowledge their control over the process"
    ],
    "examples": [
      "Your stop-word is 'pause.' If you say that, I'll stop immediately.",
      "You're in control here."
    ],
    "transitions": [{
      "next_step": "3_somatic_anchor",
      "condition": "After stop-word is established"
    }]
  },
  {
    "id": "3_somatic_anchor",
    "description": "Ground user in present-moment body awareness",
    "instructions": [
      "Guide: Feel your feet on the ground",
      "Guide: Gentle breath—in for 4, out for 6",
      "Guide: Notice 3 sounds, 3 sights, 3 sensations",
      "Speak slowly with pauses—give time for actual sensing"
    ],
    "examples": [
      "Let's ground together. Feel your feet... just notice them.",
      "Now a gentle breath. In for four... out for six."
    ],
    "transitions": [{
      "next_step": "4_capacity_check",
      "condition": "After grounding sequence"
    }]
  },
  {
    "id": "4_capacity_check",
    "description": "Assess user's capacity for today's session",
    "instructions": [
      "Ask: 'On a scale of 0 to 10, how resourced do you feel?'",
      "Listen for number and context",
      "If <4: suggest lighter work or resourcing",
      "If 4-6: moderate work possible",
      "If 7+: deeper work available"
    ],
    "examples": [
      "How resourced are you right now, zero to ten?",
      "A six? Okay, that gives us some room to work gently."
    ],
    "transitions": [
      {
        "next_step": "5_close_low_capacity",
        "condition": "If capacity <4"
      },
      {
        "next_step": "5_transition_to_session",
        "condition": "If capacity >=4"
      }
    ]
  }
]
```
```

**Key Implementation Details:**
- Each state: ID, description, step-wise instructions, examples, transition conditions
- Provides explicit scaffold while preserving generative flexibility
- Aligns with chain-of-thought prompting principles
- Used across IFS, Energy-Aligned Work, Flow Sprints, and other suites

### 3.3.3 Persona Engineering and Tone Calibration

**Description:** Multi-dimensional persona template ensuring consistent and differentiated agents.

**File:** `src/app/agentConfigs/docs/voiceAgentMetaprompt.txt`

```text
# Personality and Tone
## Identity
// Who or what the AI represents (e.g., friendly teacher, formal advisor). 
// Be detailed and include specific details about their character or backstory.

## Task
// At a high level, what is the agent expected to do?

## Demeanor
// Overall attitude or disposition (e.g., patient, upbeat, serious, empathetic)

## Tone
// Voice style (e.g., warm and conversational, polite and authoritative)

## Level of Enthusiasm
// Degree of energy in responses (e.g., highly enthusiastic vs. calm and measured)

## Level of Formality
// Casual vs. professional language

## Level of Emotion
// How emotionally expressive or neutral the AI should be

## Filler Words
// "um," "uh," "hm," etc. Options: none, occasionally, often, very often

## Pacing
// Rhythm and speed of delivery

## Other details
// Any other information that helps guide the personality or tone of the agent.
```

**Example Application (IFS Grounding Agent):**

```typescript
// Lines 8-40: Grounding guide persona
# Personality and Tone
## Identity
You are a grounding guide, like a gentle yoga instructor at the start of class. 
You help people arrive fully in the present moment and establish a safe container 
for inner work.

## Task
Orient the user to ensure they're in a safe environment, establish their capacity, 
teach the opt-out protocol, and ground them somatically.

## Demeanor
Calm, grounding, gently authoritative yet warm. You move slowly and deliberately.

## Tone
Warm and steady, like a trusted guide. Your voice should feel like an anchor.

## Level of Enthusiasm
Calm and measured. Think steady flame, not spark.

## Level of Formality
Casual but respectful. "Let's check in" not "We shall commence the assessment."

## Level of Emotion
Neutral to gently warm. You're emotionally stable—a grounding presence.

## Filler Words
Occasionally—just enough to feel human: "um," "let's see," "okay"

## Pacing
Slow and spacious. Pause between questions. 4-6 second pauses after somatic prompts.
```

**Contrasting Persona (Flow Sprints):**

**File:** `src/app/agentConfigs/suites/flow-sprints/prompts.ts`

```typescript
// Lines 3-46: Sprint Launcher - high-energy persona
You are the Sprint Launcher. You get users PUMPED and ready to dominate their task list. 
You're like a hype coach before a game.

SPEAKING STYLE: Energetic, motivating, confident. Like a sports coach mixed with a 
gaming announcer. Build excitement and urgency.

# Motivation Techniques

**Beat Your Record:**
"Your best 30-min sprint is 8 tasks. I bet you can hit 10 today. You feeling it?"

**Streak Building:**
"You've sprinted 3 days in a row. Let's keep that streak alive!"

**Energy Matching:**
- High energy: "You're fired up! Let's go for a personal best!"
- Medium energy: "Good energy - let's hit a solid 6-8 tasks"
- Low energy: "Lower energy today? Perfect time for quick admin wins!"
```

**Key Implementation Details:**
- Shared template ensures all dimensions are considered
- Produces **within-persona consistency** (same agent, different sessions)
- Produces **between-persona contrast** (different agents feel distinct)
- Examples: IFS = calm/steady; Flow Sprints = high-energy/competitive

---

## 3.4 Multi-Agent vs. Single Agent Voice

### 3.4.1 Suite Registry and Orchestration

**Description:** Central registry organizing all agent suites with discovery and validation.

**File:** `src/app/agentConfigs/index.ts`

```typescript
// Lines 1-66: Suite registry
// ============================================
// SUITE REGISTRY
// ============================================

import { AgentSuite, SuiteRegistry } from './types';
import { 
  getAllSuites,
  getSuiteById,
  getSuitesByCategory,
  getSuitesByTag,
  searchSuites,
} from './utils/suiteDiscovery';
import { registerSuiteManually } from './utils/manualRegistration';

// Import suites
import energyFocusSuite from './suites/energy-focus';
import satisfyingWorkSuite from './suites/satisfying-work';
import babyCareSuite from './suites/baby-care';
import ifsTherapySuite from './suites/ifs-therapy';
import flowSprintsSuite from './suites/flow-sprints';
import writingCompanionSuite from './suites/writing-companion';
import videoProductionSuite from './suites/video-production';
import deepWorkForgeSuite from './suites/deep-work-forge';
import emotionalRegulationSuite from './suites/emotional-regulation';
import evidenceBasedStudySuite from './suites/evidence-based-study';

const suiteRegistry: SuiteRegistry = {};

// Register suites
registerSuiteManually(suiteRegistry, energyFocusSuite);
registerSuiteManually(suiteRegistry, satisfyingWorkSuite);
registerSuiteManually(suiteRegistry, babyCareSuite);
registerSuiteManually(suiteRegistry, ifsTherapySuite);
registerSuiteManually(suiteRegistry, flowSprintsSuite);
registerSuiteManually(suiteRegistry, writingCompanionSuite);
registerSuiteManually(suiteRegistry, videoProductionSuite);
registerSuiteManually(suiteRegistry, deepWorkForgeSuite);
registerSuiteManually(suiteRegistry, emotionalRegulationSuite);
registerSuiteManually(suiteRegistry, evidenceBasedStudySuite);

console.log('📦 Registered suites:', Object.keys(suiteRegistry));

export function getAllAvailableSuites(): AgentSuite[] {
  return getAllSuites(suiteRegistry);
}

export function findSuiteById(id: string): AgentSuite | undefined {
  return getSuiteById(suiteRegistry, id);
}
```

**Manual Registration:**

**File:** `src/app/agentConfigs/utils/manualRegistration.ts`

```typescript
// Lines 10-33: Suite registration with validation
export function registerSuiteManually(
  registry: SuiteRegistry,
  suite: AgentSuite
): void {
  const suiteId = suite.id;
  
  // Validate suite
  if (!validateSuite(suite)) {
    throw new Error(`Cannot register invalid suite: ${suiteId}`);
  }
  
  // Check for duplicate ID
  if (registry[suite.id]) {
    console.warn(`⚠️  Overwriting existing suite: ${suite.id}`);
  }
  
  // Register suite
  registry[suite.id] = suite;
  
  console.log(`✅ Registered suite: ${suite.name} (${suite.id})`);
  console.log(`   - ${suite.agents.length} agents`);
  console.log(`   - Category: ${suite.category}`);
  console.log(`   - Tags: ${suite.tags.join(', ')}`);
}
```

**Key Implementation Details:**
- Central registry enables discovery by ID, category, or tag
- Each suite validated before registration
- Suites explicitly disabled in research build to reduce confounds

### 3.4.2 Connection and Handoff Logic

**Description:** Orchestrator routes turns to appropriate agent and announces handoffs.

**File:** `src/app/App.tsx`

```typescript
// Lines 466-515: Suite-based connection
const connectToRealtime = async () => {
  if (sessionStatus !== "DISCONNECTED") return;
  setSessionStatus("CONNECTING");

  try {
    const EPHEMERAL_KEY = await fetchEphemeralKey();
    if (!EPHEMERAL_KEY) return;

    let agents: RealtimeAgent[];
    let guardrails: any[];
    let suiteContext = {};

    // Try suite system first
    if (currentSuite) {
      console.log('🔌 Connecting to suite:', currentSuite.name);
      
      // Use suite agents
      agents = [...currentSuite.agents];
      
      // Ensure the selectedAgentName (root agent) is first
      const idx = agents.findIndex((a) => a.name === selectedAgentName);
      if (idx > 0) {
        const [agent] = agents.splice(idx, 1);
        agents.unshift(agent);
      }
      
      // Use suite guardrails
      guardrails = currentSuite.guardrails || 
        [createModerationGuardrail(currentSuite.name)];
      
      // Include suite context
      suiteContext = {
        suiteId: currentSuite.id,
        suiteName: currentSuite.name,
        ...currentSuite.initialContext,
      };
    }
    
    // Apply voice preferences to all agents
    agents = applyVoicePreferences(agents, voicePreferences);

    await connect({
      getEphemeralKey: async () => EPHEMERAL_KEY,
      initialAgents: agents,
      audioElement: audioRef.current!,
      extraContext: {
        workspaceInfo,
        ...suiteContext,
      },
      outputGuardrails: guardrails,
    });
    
    setSessionStatus("CONNECTED");
  } catch (error) {
    console.error("Connection failed:", error);
    setSessionStatus("DISCONNECTED");
  }
};
```

**Agent Handoff Detection:**

**File:** `src/app/hooks/useRealtimeSession.ts`

```typescript
// Lines 85-90: Handoff callback
const handleAgentHandoff = (item: any) => {
  const history = item.context.history;
  const lastMessage = history[history.length - 1];
  const agentName = lastMessage.name.split("transfer_to_")[1];
  callbacks.onAgentHandoff?.(agentName);
};
```

**Key Implementation Details:**
- Suite agents passed as array with root agent first
- Handoffs announced in user-facing language
- Context includes workspace state + suite-specific initial context
- Guardrails applied at suite level

### 3.4.3 Suite Structure (Multi-Agent Example)

**Description:** Energy-Aligned Work instantiates a sequential 3-agent pipeline.

**File:** `src/app/agentConfigs/suites/energy-focus/suite.config.ts`

```typescript
// Lines 1-72: Energy-Aligned Work suite configuration
import { SuiteConfig } from '@/app/agentConfigs/types';

export const energyFocusSuiteConfig: SuiteConfig = {
  id: 'energy-aligned-work',
  name: 'Energy Aligned Work',
  description: 'Start by understanding where you\'re at. Match tasks to actual energy.',
  icon: '⚡',
  category: 'productivity',
  disabled: false,
  tags: [
    'energy',
    'body-awareness',
    'capacity',
    'grounding',
    'starting-work',
    'adhd',
    'executive-function'
  ],
  
  suggestedUseCases: [
    'Beginning of work session',
    'Uncertain about where to start',
    'Need to match work to current energy',
    'Want to understand your state first',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 15,
  
  workspaceTemplates: [
    {
      name: 'Daily Check-In',
      type: 'markdown',
      content: `# Daily Check-In
## Energy Level (1-10)
___ / 10
## Body State
How does my body feel right now?
## Emotional State
What am I feeling?
## Today's Capacity
Given my current state, what feels realistic?
`,
      description: 'Track energy, body, and emotional state',
    },
    {
      name: 'Capacity Journal',
      type: 'csv',
      content: 'Date|Energy (1-10)|Planned Hours|Actual Hours|Notes\n',
      description: 'Track realistic capacity over time',
    },
    {
      name: 'Launch Log',
      type: 'csv',
      content: 'Date|First Task|How Started|Outcome|Notes\n',
      description: 'Track how you launched into work',
    },
  ],
  
  initialContext: {
    focusArea: 'energy-alignment',
    supportStyle: 'grounding',
    checkInFrequency: 'session-start',
  },
};
```

**Agent Instantiation:**

**File:** `src/app/agentConfigs/suites/energy-focus/agents/energyCoach.ts`

```typescript
// Lines 1-14: Grounding Guide agent definition
import { RealtimeAgent } from '@openai/agents/realtime';
import { advancedWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { groundingGuidePrompt } from '../prompts';

export const groundingGuideAgent = new RealtimeAgent({
  name: 'groundingGuide',
  voice: 'sage',
  instructions: groundingGuidePrompt,
  tools: advancedWorkspaceTools,
  handoffs: [], // wired up in index.ts to avoid circular dependencies
});
```

**Key Implementation Details:**
- **Grounding Guide:** Activation and state assessment
- **Capacity Mapper:** Planning and scoping
- **Launch Partner:** Action initiation
- Each agent has distinct role, voice, and handoff conditions
- Workspace templates pre-structure the artefact layer

### 3.4.4 Single-Agent Pattern (Flow Sprints)

**Description:** Where multi-voice adds overhead, collapse into single well-scaffolded agent.

**File:** `src/app/agentConfigs/suites/flow-sprints/prompts.ts`

```typescript
// Lines 115-238: Task Logger as single voice with rich state
You are the Task Logger. During a sprint, you're the voice in their ear celebrating 
every win and logging every completion in real-time.

SPEAKING STYLE: Fast, enthusiastic, celebratory. Like a gaming announcer calling plays.

# Your Role
- Log EVERY task completion to Sprint Log CSV (user requested this!)
- Celebrate each win immediately
- Keep energy high
- Track progress toward target
- Maintain urgency and focus

# During Sprint Protocol

**When user completes a task:**
1. Celebrate immediately: "BOOM! That's 1!" or "Nice! 2 down!"
2. **Auto-add to Sprint Log CSV** with timestamp
3. Show progress: "3/10 - you're 30% there!"
4. Keep them moving: "What's next?"

# Celebration Levels

**Every completion (1-5 tasks):**
- "Nice! 1 down!"
- "Boom! That's 2!"

**Building momentum (6-10 tasks):**
- "You're on FIRE! 6 done!"
- "CRUSHING IT! 7!"

**Personal best zone:**
- "PERSONAL BEST TERRITORY! 9!"
- "NEW RECORD! 10 tasks!"

# Time Check-Ins

**Halfway point:**
"Quick check: halfway through! You're at 5/10 - right on pace!"

**5 minutes left:**
"5 minutes left! You're at 7/10 - 3 more to hit target. Let's GO!"

**Time's up:**
"TIME! Sprint complete! You did [X] tasks in [Y] minutes!"
[Hand off to recordBreaker for analysis]

${TIMER_NOTIFICATION_GUIDELINES}
```

**Key Implementation Details:**
- Single high-energy voice handles framing, countdown, check-ins, and debrief
- Rich internal state and prompt scaffolding replace multi-agent coordination
- Avoids additional handoff overhead during time-sensitive sprints
- Still benefits from structured prompts and state machines

---

## 3.5 Safety & Guardrails

### 3.5.1 Scope Statements in System Prompts

**Description:** Explicit declarations anchoring agent role within appropriate boundaries.

**File:** `src/app/agentConfigs/suites/ifs-therapy/prompts.ts`

```typescript
// Lines 42-49: Grounding agent scope statement
# Instructions
- Follow the Conversation States closely
- If user provides a name or phone number, always repeat it back to confirm
- If the caller corrects any detail, acknowledge and confirm
- **This is NOT therapy—it's supportive guidance using IFS principles**
- Stop immediately if they say their stop-word
- Never proceed to deeper work if capacity is too low (<4/10)
```

```typescript
// Lines 206-213: Standard Parts agent scope
# Instructions
- Follow the 6F scaffold strictly—it's a proven sequence
- If Self energy is blocked, pause and unblend
- Always ask protector permission before any exile contact
- Use workspace tools to update Parts Map
- If caller corrects any detail, acknowledge and confirm
- **Never force—all contact is by invitation only**
```

**Key Implementation Details:**
- Repeats in every IFS agent prompt
- Reinforces throughout conversation (not just intro)
- Reduces probability of scope drift or clinical claims

### 3.5.2 Stop-Word Protocols

**Description:** User autonomy operationalised through immediate-halt mechanism.

**File:** `src/app/agentConfigs/suites/ifs-therapy/prompts.ts`

```typescript
// Lines 70-86: Stop-word establishment state
{
  "id": "2_opt_out",
  "description": "Establish the stop-word protocol",
  "instructions": [
    "Inform user their stop-word is 'pause'—they can use it anytime",
    "Emphasize: no explanation needed, instant stop",
    "Acknowledge their control over the process"
  ],
  "examples": [
    "Your stop-word is 'pause.' If you say that at any time, I'll stop immediately.",
    "No questions, no explanation needed. This is your process.",
    "You're in control here."
  ],
  "transitions": [{
    "next_step": "3_somatic_anchor",
    "condition": "After stop-word is established"
  }]
}
```

**Safety Protocol Template:**

**File:** `src/app/agentConfigs/suites/ifs-therapy/suite.config.ts`

```typescript
// Lines 192-228: Safety Protocol workspace template
{
  name: 'Safety Protocol',
  type: 'markdown',
  content: `# Safety Information

## Stop Word
**My chosen pause word:** "pause"
- Use this anytime to immediately stop the session
- No explanation needed

## Environment Check
Before each session:
- [ ] Private, safe location
- [ ] Not driving or operating equipment
- [ ] Phone/support available if needed

## Capacity Guidelines
- **0-3:** Crisis support only (SOS protocol)
- **4-6:** Light work (grounding, micro-practice, unblending)
- **7+:** Deeper work possible (exile witnessing, burden release)

## Crisis Contacts
**Therapist:** 
**Crisis Line:** 988 (US Suicide & Crisis Lifeline)
**Emergency:** 911

## Red Flags - Stop & Get Support
- Feeling unsafe or suicidal
- Completely overwhelmed/flooded
- Dissociation or losing present time
- Extreme part activation that won't settle

## Note
This is supportive guidance using IFS principles, NOT a substitute for therapy.
`,
  description: 'Safety protocols and emergency information',
}
```

**Key Implementation Details:**
- Established in first state of emotionally sensitive suites
- Protocol reinforced by transition agents
- User retains agency without justification requirement

### 3.5.3 Capacity Checks

**Description:** Gate preventing under-resourced users from entering destabilising territory.

**File:** `src/app/agentConfigs/suites/ifs-therapy/prompts.ts`

```typescript
// Lines 106-149: Capacity check state with branching
{
  "id": "4_capacity_check",
  "description": "Assess user's capacity for today's session",
  "instructions": [
    "Ask: 'On a scale of 0 to 10, how resourced do you feel right now?'",
    "Listen for number and context",
    "If <4: suggest lighter work (unblending, micro-practice) or resourcing",
    "If 4-6: moderate work possible",
    "If 7+: deeper work available"
  ],
  "examples": [
    "How resourced do you feel right now, on a scale of zero to ten?",
    "A six? Okay, that gives us some room to work gently today."
  ],
  "transitions": [
    {
      "next_step": "5_close_low_capacity",
      "condition": "If capacity <4"
    },
    {
      "next_step": "5_transition_to_session",
      "condition": "If capacity >=4"
    }
  ]
},
{
  "id": "5_close_low_capacity",
  "description": "Honor low capacity with resourcing",
  "instructions": [
    "Acknowledge they showed up even when depleted",
    "Offer simple resourcing: breath, kind touch, rest",
    "Suggest very light work or just ending with gentleness",
    "Maybe hand off to microPractice or flashSOS agents"
  ],
  "examples": [
    "I hear you're pretty depleted today. That's okay. You showed up, and that matters.",
    "Let's not push today. Would you like a brief check-in or would rest be better?",
    "I can transfer you to our Quick Check-in guide for five minutes, or we can close here."
  ],
  "transitions": [{
    "next_step": "handoff_or_end",
    "condition": "Based on user preference"
  }]
}
```

**Key Implementation Details:**
- 0-10 scale assessed before any deeper work
- <4: Crisis support only (Flash SOS)
- 4-6: Moderate work (grounding, unblending)
- 7+: Deeper work possible (exile witnessing, burden release)
- System pivots to resourcing or gentle close if threshold not met

### 3.5.4 Crisis Escalation via Flash SOS

**Description:** Specialised agent for acute stabilisation with narrow scope.

**File:** `src/app/agentConfigs/suites/ifs-therapy/prompts.ts`

```typescript
// Lines 1743-1784: Flash SOS persona and scope
export const flashSOSPrompt = `# Personality and Tone
## Identity
You are a crisis de-escalation specialist and acute grounding guide, like an ER 
triage nurse—fast, calm, competent. You help people in acute overwhelm regain stability 
through physiology, orientation, and containment. You do NOT open trauma content—you 
contain and stabilize ONLY.

## Task
Provide acute de-escalation for overwhelm, panic, or flashbacks using fast grounding 
techniques (5-4-3-2-1, physiology hacks, containment imagery). Get them stable, then 
assess if they need external support.

## Demeanor
Calm, direct, and competent. You're the steady voice in chaos.

## Tone
Clear, calm, and directive (but kind). "Do this now" energy—not harsh, just confident.

## Level of Enthusiasm
Very calm. Almost flat affect—you're the eye of the storm.

## Filler Words
None. This is crisis—be clear and direct.

## Pacing
Quick but not frantic. Clear, short instructions with pauses.

# Instructions
- This is 3-8 minute crisis protocol—fast and focused
- **Do NOT explore content—contain only**
- After stabilization, assess: can they end safely or need external support?
- **If they mention self-harm or danger, immediately provide crisis resources**
- This is supportive guidance, not therapy
```

**Crisis Resource Provision:**

```typescript
// Lines 1867-1915: Decision gate with crisis resources
{
  "id": "5_decision_gate",
  "description": "Assess stability and next steps",
  "instructions": [
    "Ask: 'Are you feeling more stable now, 0-10?'",
    "If <5: repeat physiology and containment, or provide crisis resources",
    "If >=5: ask if they want to end here or continue to light grounding",
    "Check for safety: 'Are you safe right now? Do you need to call someone?'"
  ],
  "examples": [
    "How stable do you feel now, zero to ten?",
    "[If low] Let's do more grounding, or I can give you crisis support numbers.",
    "[If stable] Good. Do you want to end here or try gentle grounding?",
    "You can also call 988 (US) if you need immediate support."
  ],
  "transitions": [
    {
      "next_step": "2_physiology",
      "condition": "If still unstable—repeat"
    },
    {
      "next_step": "6_external_support",
      "condition": "If needs crisis resources"
    },
    {
      "next_step": "7_gentle_close",
      "condition": "If stable and ready to end"
    }
  ]
},
{
  "id": "6_external_support",
  "description": "Provide crisis resources",
  "instructions": [
    "Give numbers: 988 (US Suicide & Crisis Lifeline), local crisis line",
    "Suggest calling therapist, trusted friend, or emergency services",
    "Stay calm and direct",
    "Emphasize: reaching out for help is strength"
  ],
  "examples": [
    "If you're feeling unsafe, please call 988—that's the Suicide and Crisis Lifeline.",
    "Or call your therapist, a trusted friend, or 911 if it's an emergency.",
    "Reaching out for help is brave. You don't have to do this alone."
  ],
  "transitions": [{
    "next_step": "end",
    "condition": "After providing resources"
  }]
}
```

**Key Implementation Details:**
- **Scope:** Stabilisation only, no exploratory work
- **Techniques:** 5-4-3-2-1 sensory grounding, physiology hacks, containment imagery
- **Escalation:** Immediate provision of 988 Suicide & Crisis Lifeline if self-harm mentioned
- **Duration:** 3-8 minutes, fast and focused
- **Handoff rules:** Flash SOS cannot transition to exile witnessing or burden release

### 3.5.5 Output Guardrails and Moderation Layer

**Description:** Real-time classification and correction of problematic model outputs.

**File:** `src/app/agentConfigs/guardrails/moderation.ts`

```typescript
// Lines 8-66: Guardrail classifier
export async function runGuardrailClassifier(
  message: string,
  companyName: string = 'newTelco',
): Promise<GuardrailOutput> {
  const messages = [
    {
      role: 'user',
      content: `You are an expert at classifying text according to moderation policies. 
      Consider the provided message, analyze potential classes, and output the best 
      classification. Keep your reasoning short, maximum 2 sentences.

      <info>
      - Company name: ${companyName}
      </info>

      <message>
      ${message}
      </message>

      <output_classes>
      - OFFENSIVE: Hate speech, discriminatory language, insults, slurs, or harassment.
      - OFF_BRAND: Discusses competitors in a disparaging way.
      - VIOLENCE: Explicit threats, incitement of harm, or graphic descriptions.
      - NONE: If no other classes are appropriate and the message is fine.
      </output_classes>
      `,
    },
  ];

  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: messages,
      text: { format: zodTextFormat(GuardrailOutputZod, 'output_format') },
    }),
  });

  if (!response.ok) {
    console.warn('Server returned an error:', response);
    return Promise.reject('Error with runGuardrailClassifier.');
  }

  const data = await response.json();
  return GuardrailOutputZod.parse(data.text);
}
```

```typescript
// Lines 80-100: Moderation guardrail factory
export function createModerationGuardrail(companyName: string) {
  return {
    name: 'moderation_guardrail',

    async execute({ agentOutput }: RealtimeOutputGuardrailArgs): 
      Promise<RealtimeOutputGuardrailResult> {
      try {
        const res = await runGuardrailClassifier(agentOutput, companyName);
        const triggered = res.moderationCategory !== 'NONE';
        return {
          tripwireTriggered: triggered,
          outputInfo: res,
        };
      } catch {
        return {
          tripwireTriggered: false,
          outputInfo: { error: 'guardrail_failed' },
        };
      }
    },
  } as const;
}
```

**Guardrail Activation in History Handler:**

**File:** `src/app/hooks/useHandleSessionHistory.ts`

```typescript
// Lines 101-110: Guardrail message detection
// If the guardrail has been tripped, this message gets sent to the assistant 
// to correct it, so we add it as a breadcrumb instead of a message.
const guardrailMessage = sketchilyDetectGuardrailMessage(text);
if (guardrailMessage) {
  const failureDetails = JSON.parse(guardrailMessage);
  addTranscriptBreadcrumb('Output Guardrail Active', { details: failureDetails });
} else {
  addTranscriptMessage(itemId, role, text);
}
```

**Key Implementation Details:**
- **Classification:** OFFENSIVE, OFF_BRAND, VIOLENCE, NONE
- **Correction:** When `tripwireTriggered`, model receives corrective signal
- **Logging:** Transcript captures category and rationale for review
- **Defence-in-depth:** Operates even if prompt injection bypasses instruction-level constraints
- **Suite-level:** Each suite instantiates with `createModerationGuardrail(suiteName)`

---

## Summary: Code-to-Section Mapping

| Section | Key Files | Primary Code Examples |
|---------|-----------|----------------------|
| **3.1 Development Journey** | `workspaceTools.ts`, `workJournalTools.ts`, `Timer.tsx`, `useRealtimeSession.ts`, `004_voice_sessions_and_transcripts.sql` | Workspace abstraction, work journal, timer intervals, WebRTC session, PostgreSQL schema |
| **3.2 Functional Goals** | `Timer.tsx`, `WorkspaceContext.tsx`, `ExperimentQuestionnaireModal.tsx`, `ExperimentOrchestrator.tsx` | Timer toggle (ON/OFF), notification preferences, embedded measurement, experiment flow |
| **3.3 Multi-Agent Design** | `prompts.ts` (energy-focus, ifs-therapy, flow-sprints), `voiceAgentMetaprompt.txt` | DETAIL framework, conversation states (JSON), persona templates, tone calibration |
| **3.4 Multi-Agent vs Single Agent** | `index.ts` (agentConfigs), `manualRegistration.ts`, `App.tsx`, `useRealtimeSession.ts`, suite configs | Suite registry, orchestration logic, handoff detection, multi-agent vs single-agent patterns |
| **3.5 Safety & Guardrails** | `prompts.ts` (ifs-therapy), `suite.config.ts` (ifs-therapy), `moderation.ts`, `useHandleSessionHistory.ts` | Scope statements, stop-word protocols, capacity checks, Flash SOS, output moderation |

---

## Usage Notes for Dissertation Appendices

1. **Citation Format:** Reference code snippets as "Appendix [X], Listing [Y]" with file path and line numbers.

2. **Selective Inclusion:** Not all code shown here should appear in the dissertation. Select the most illustrative 2-3 examples per section.

3. **Formatting:** Use syntax highlighting and ensure code blocks are readable at dissertation print size (10-12pt font).

4. **Narrative Integration:** Each code snippet should be introduced with a brief explanation of its role in the implementation and how it supports the claims in the main text.

5. **Complementary Materials:** Consider providing a companion GitHub repository link for readers who want to explore the full implementation.

---

**Generated:** December 3, 2025  
**Codebase Version:** Production (as of Dec 2025)  
**Total Snippets Documented:** 25+  
**Files Referenced:** 15+

