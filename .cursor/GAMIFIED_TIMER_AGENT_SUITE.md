# 🎮 Gamified Timer-Based Multi-Voice Rituals

Scaffolds for a voice-first agency companion grounded in ADHD intervention literature (body-doubling, implementation intentions, implementation intentions, episodic future thinking, micro-rewards). Each ritual combines explicit timers, distinct agent personas, and measurable outcomes aligned with the dissertation research questions.

---

## Design Pillars
1. **Timer as Stage Manager** – visible countdowns anchor attention, lower time horizon, and provide natural handoffs.
2. **Multi-Voice Agency Loop** – different agents own Prepare → Launch → Sustain → Close arcs, keeping novelty without cognitive overload.
3. **Gamified Feedback** – points, streaks, mood badges, and narrative callbacks convert progress into dopamine hits.
4. **Micro-Intervention Hooks** – embed proven tactics (body-doubling, imaginal rehearsal, IFS-informed check-ins, mindfulness resets).
5. **Measurable Outcomes** – every ritual logs start/end, intention, completion score, subjective affect, and optional screen-time/task data for evaluation.

Agent archetypes reused across rituals:
- `Anchor` – soothing systems voice, checks readiness and stress/energy.
- `Spark` – hype voice for goal-setting + implementation intentions.
- `Guide` – steady co-worker voice for mid-session accountability (body-doubling).
- `Trickster` – playful/game host voice for challenges and humorous reframe.
- `Archivist` – reflective closer logging wins, insights, risks.

---

## Intention Canvas + Progress Arc System

**Goal:** Externalize motivation, show where the user sits inside the agent sequence, and keep the voice prompts grounded to a persistent visual scaffold.

### Intention Canvas (pre-stage module)
- **Inputs:** `Why am I doing this?`, `Win condition for this block`, optional `Reward / next anchor`.
- **Placement:** Fixed strip above the transcript/session area. Editable field turns into pill once locked; agents can pin edits (“Archivist updated win condition after scoping convo”).
- **Behavior:** 
  - `Spark` references the canvas verbatim when launching (“You committed to ‘Finish outline paragraph 2.’ Ready to forge?”).
  - Mid-session edits trigger subtle highlight + chime so the user notices when an agent reframes goals.
  - Canvas state persists across rituals until user clears it, creating continuity for multi-block quests.

### Progress Arc HUD
- **Structure:** Horizontal capsule divided into four stages (Prepare, Launch, Sustain, Close) with agent avatars sitting atop each segment.
- **Interaction:** When a stage becomes active, its segment fills (animated gradient) and avatar pulses; future segments show ghost outlines.
- **Timer Integration:** Each segment contains its sub-timer; hovering reveals upcoming cue (“Guide takes over in 2 min for Sustain”).
- **Progress Bar Overlay:** A slim progress bar runs along the bottom of the HUD representing total ritual completion, regardless of agent stage. It advances continuously with stage weights (e.g., Deep Work: Prep 5%, Launch 10%, Sustain 75%, Close 10%).
- **Agency Messaging:** At stage transitions the UI flashes micro-copy (“Handoff → Guide”); the voice agent mirrors the same language to reinforce predictability.

### Implementation Notes
- Use a shared `sessionContext` object so both Intent Canvas and Progress Arc can be read/written by agent scripts and UI.
- Allow rituals to customize Arc layouts (e.g., Closing Loops might have Prep, Relay, Prioritize). The progress bar recalculates total percent automatically from stage durations.
- Analytics: log each time the user edits the intention, abandons a stage, or pauses mid-arc to correlate with outcome metrics in RQ1/RQ3.

---

## Ritual 1: **Deep Work Forge** (60-minute immersion)
- **Use case:** Commit to a single meaningful task for one hour.
- **Timer:** 5-min primer + 50-min focus + 5-min cooldown. Timer visible + audible cues.
- **Flow:**
  1. `Anchor` runs a 90-second somatic check (breath, distraction inventory) and ensures barriers removed.
  2. `Spark` helps craft an “if-then” intention (“If timer hits 0:55, I start outlining paragraph 2”) and logs expected output.
  3. `Guide` co-works during the 50-min block with quiet ambient presence + optional 8-min cadence nudges; can trigger micro breaks if heart rate variability (optional hardware) dips.
  4. `Trickster` injects randomized “forge events” (mini side-quests: “banish social media for next 10 min to earn +5 focus ore”).
  5. `Archivist` runs cooldown: rating focus, noting blockers, prepping next action; exports summary to task manager.
- **Gamification:** Earn “ingots” per uninterrupted 10-min streak; forging bar visual; streak bonuses for consecutive days.
- **Metrics:** Task completion flag, subjective focus rating, optional RescueTime category for block.

---

## Ritual 2: **Closing Loops Relay** (15-minute triage sprint)
- **Use case:** Reduce overwhelm by clearing sub-15-minute tasks + braindump.
- **Timer:** 3-min mind dump + 10-min relay + 2-min prioritization.
- **Flow:**
  1. `Trickster` runs a rapid-fire “inventory storm” to verbalize all nagging tasks (recorded + tagged).
  2. `Spark` helps classify items (Do <15 min / Delegate / Schedule) and chooses 3 quick wins.
  3. `Guide` body-doubles for the 10-min relay, giving countdown per task, cheering when completed.
  4. `Anchor` checks emotional load mid-sprint (“Need to shake out tension? Stand + stretch 30 sec for bonus”).
  5. `Archivist` surfaces what’s left, pushes larger tasks into Deep Work backlog, and celebrates cleared loops.
- **Gamification:** Relay baton animation; each cleared loop fills a “calm meter.” Bonus if user logs future plan for any >15-min item.
- **Metrics:** Count of tasks cleared, subjective overwhelm delta (before/after), follow-up tasks scheduled.

---

## Ritual 3: **Heroic Questline** (narrative arc)
- **Use case:** Turn a multi-step work session into a story-driven quest to maintain intrinsic motivation.
- **Timer:** Flexible; each quest stage (Act I Setup, Act II Trials, Act III Resolution) has its own timer (e.g., 20/25/15 min).
- **Flow:**
  1. `Spark` frames the “quest briefing” with stakes, allies, and rewards; user names their protagonist traits.
  2. `Guide` plays the role of party companion; offers “ability cards” (e.g., “Focus Shield” = noise-cancelling, “Momentum Potion” = 4-min music burst).
  3. `Trickster` introduces narrative curveballs (“A distraction goblin appears—roll a d6 by picking a coping move”).
  4. `Anchor` ensures pacing—if affect spikes, triggers reflection pause and reframes failure as plot twist.
  5. `Archivist` closes with hero’s log entry + XP payouts that unlock future cosmetic upgrades (voice filters, music stingers).
- **Gamification:** XP, loot drops (stickers, sound cues), campaign arcs over a week with macro goals.
- **Metrics:** Stage completion, self-efficacy rating, qualitative notes on agency shifts captured for RQ3 themes.

---

## Ritual 4: **Boss Rush Score Attack** (race mechanics)
- **Use case:** Gamify throughput—complete as many tasks as possible versus the clock.
- **Timer:** User selects window (e.g., 30 min). Internal sub-timer slices (e.g., 5-min rounds) to encourage batching.
- **Flow:**
  1. `Spark` defines scoring system (easy task = 100 pts, medium = 250, bonus for streaks). Tasks pulled from backlog filtered by duration tags.
  2. `Guide` acts as announcer, calling out “Bosses” (task clusters) and tracking scoreboard.
  3. `Trickster` issues combo challenges (“Complete two admin tasks back-to-back for a multiplier”).
  4. `Anchor` ensures user doesn’t push into dysregulation; after each round, quick RPE (rate of perceived effort) check to avoid burnout.
  5. `Archivist` publishes scoreboard snapshot, compares to past sessions, nudges sustainable reflection (“What made Round 3 flow?”).
- **Gamification:** Leaderboard vs self (no social pressure), badges for personal bests, optional shareable “Stat Card.”
- **Metrics:** Number of tasks completed, accumulated score, energy rating, any adverse flags (fatigue, anxiety) logged.

---

## Timer + Agent Orchestration Notes
- **Timer Engine:** Central service emitting stage events (`T-5`, `Halfway`, `Complete`) consumed by each agent persona. Enables deterministic handoffs and synchronized audio cues.
- **Voice Switching:** Use tagged prompts referencing shared memory (`session_intent`, `timer_stage`, `user_state`). Keep voices distinct via tone + sonic branding but consistent vocabulary for handoffs (“Passing mic to Guide for the focus block.”).
- **Data Logging:** For each ritual, store `intent`, `start/end`, `timer_stage_events`, `agent_interventions`, `self-reported metrics`, and `outcome`. Supports RQ1 (behavior change) + RQ3 (qual themes).
- **Safety & Ethics:** Provide exit phrase (“Abort mission”), cool-down agent for decompression, and optional text transcripts for review. Limit competitive framing for users with rejection sensitivity—default to self-compassion metrics.

---

## Implementation Next Steps
1. **Prototype Scripts:** Create prompt libraries per agent + stage with references to timers and gamified mechanics. Test via text chat before full voice deployment.
2. **Timer UI:** Build reusable countdown widget with color-coded stage states + celebratory animations triggered by event bus.
3. **Instrumentation:** Decide on metrics schema (e.g., `ritualSessions` table) so future research queries can track adherence, completion, and qualitative notes.
4. **User Testing:** Run 5 moderated sessions per ritual, collect diary entries about agency shifts, watch for overwhelm due to gamification intensity.
5. **Iterate Personas:** Adjust voice tone + script lengths to maintain novelty while minimizing cognitive load; consider user-selectable difficulty/energy modes.
