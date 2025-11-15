# Intention Canvas + Progress Arc Implementation Guide

Purpose: give build-ready guidance and point collaborating agents to the right markdown specs to keep UX, engineering, and research views in sync.

## 1. Feature Surfaces
- **Intention Canvas** (fixed strip above session transcript)
- **Progress Arc HUD** (stage timeline with avatars + continuous progress bar)
- **Shared Session Context** (stores ritual metadata, timers, agent stage, intention text)
- **Instrumentation + Analytics hooks** for RQ1/RQ3 tracking

## 2. UI Build Steps
1. **Create `IntentionCanvas` component**
   - File target: `components/session/IntentionCanvas.tsx`
   - Inputs: `initialIntention`, `onUpdate`, `locked` state.
   - States: editing vs locked pill, highlight on agent edit (prop `lastUpdatedBy`).
   - Pull copy guidance from `.cursor/GAMIFIED_TIMER_AGENT_SUITE.md:23-39`.
2. **Add `ProgressArcHUD` component**
   - File target: `components/session/ProgressArcHUD.tsx`
   - Props: `stages` array (`{id, label, agentAvatar, durationPercent}`), `activeStageId`, `overallPercent`, timers per stage.
   - Visual: segmented capsule + thin progress bar along bottom; stage hover shows tooltip text.
   - Microcopy spec at `.cursor/GAMIFIED_TIMER_AGENT_SUITE.md:34-45`.
3. **Integrate into Session Layout**
   - Update `pages/session/[id].tsx` (or equivalent) to render Canvas + HUD above transcript content.
   - Ensure responsive behavior; consult `.cursor/UX_DESIGN_ANALYSIS.md` for spacing tokens.
4. **Tie to Timer Store**
   - Extend `hooks/useRitualTimer.ts` to expose `currentStage`, `stageElapsed`, `totalPercent`.
   - Publish events for handoffs so HUD animates; spec references in `.cursor/GAMIFIED_TIMER_AGENT_SUITE.md:79-83`.

## 3. State & Data Flow
- **Session Context Expansion**
  - File: `context/SessionContext.tsx`.
  - New fields: `intentionText`, `winCondition`, `rewardNote`, `stageProgress`, `agentHandoffHistory`.
  - Methods: `setIntention`, `lockIntention`, `acknowledgeAgentUpdate`.
- **Server/DB**
  - Add `intention` columns to `ritualSessions` table; log `stage_events`.
  - Document schema change in `docs/data/SCHEMA_NOTES.md`.
- **Agent Access**
  - Update agent prompt templates (see `AGENT_SUITE_QUICK_TEMPLATE.md`) to include:
    ```
    Intention canvas: {{intention_text}}
    Current stage: {{stage_label}}
    ```

## 4. Instrumentation
- Define telemetry spec in `.cursor/IMPLEMENTATION_PLAN.md` under Metrics section.
- Log events:
  - `intention.updated` (actor = user/agent, before/after)
  - `stage.transition` (from, to, timestamp)
  - `progress.overall_percent`
- Store subjective check-ins linked to stage (tie into Energy/Emotion dials later).

## 5. Documentation/Hand-off Checklist
| Markdown file | Update Needed | Owner |
| --- | --- | --- |
| `.cursor/GAMIFIED_TIMER_AGENT_SUITE.md` | Already includes concept spec; add screenshots/wireframes once ready | UX |
| `.cursor/UX_DESIGN_ANALYSIS.md` | Document layout decisions (spacing, responsive behavior) | Product Design |
| `.cursor/AGENT_SUITE_ARCHITECTURE.md` | Describe new `sessionContext` fields + timer event bus for agent prompts | Systems |
| `.cursor/IMPLEMENTATION_PLAN.md` | Add engineering tasks + telemetry requirements | Eng Lead |
| `.cursor/INTENTION_PROGRESS_IMPLEMENTATION.md` (this file) | Keep build notes updated as work progresses | Tech Writer |

## 6. Next Actions for Assigned Agent
1. Review Canvas/HUD behavior spec (`.cursor/GAMIFIED_TIMER_AGENT_SUITE.md:23-45`).
2. Draft wireframe snippets in `.cursor/UX_DESIGN_ANALYSIS.md`.
3. Implement components + state as per steps above.
4. Update schema + telemetry docs.
5. Hand back outcomes + open questions in daily log.
