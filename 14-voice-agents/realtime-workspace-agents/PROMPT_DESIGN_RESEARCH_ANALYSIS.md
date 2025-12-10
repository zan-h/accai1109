# Research-Based System Prompt Design Analysis
## How Voice Agent Prompts Were Implemented Using Evidence-Based Principles

*Last Updated: December 2025*

---

## Executive Summary

This document analyzes the system prompts used in the Voice Agent Experiment platform, demonstrating how their design aligns with—and in some cases anticipates—the latest research in prompt engineering, conversational AI design, therapeutic AI interactions, and learning science. The prompts across 10+ specialized suites represent a sophisticated implementation of research-backed principles including structured conversation states, persona consistency, adaptive specificity, and multi-agent orchestration.

---

## Table of Contents

1. [Prompt Specificity & The DETAIL Framework](#1-prompt-specificity--the-detail-framework)
2. [Structured Conversation States](#2-structured-conversation-states)
3. [Persona Engineering & Tone Calibration](#3-persona-engineering--tone-calibration)
4. [Multi-Agent Orchestration](#4-multi-agent-orchestration)
5. [Evidence-Based Learning Science Integration](#5-evidence-based-learning-science-integration)
6. [Therapeutic Protocol Implementation](#6-therapeutic-protocol-implementation)
7. [Gamification & Behavioral Design](#7-gamification--behavioral-design)
8. [Voice-First Design Considerations](#8-voice-first-design-considerations)
9. [Safety & Guardrail Architecture](#9-safety--guardrail-architecture)
10. [Key Research Principles Applied](#10-key-research-principles-applied)

---

## 1. Prompt Specificity & The DETAIL Framework

### Research Foundation

The **DETAIL framework** (Kim, 2025) demonstrates that prompt specificity significantly impacts LLM reasoning performance. Key findings:
- More detailed prompts improve accuracy, especially for procedural tasks
- Smaller models benefit more from increased specificity
- Adaptive prompting strategies outperform static approaches

### Implementation in Our Prompts

Our agent prompts exemplify high-specificity design through multi-layered instruction architecture:

**Example: Emotion Identifier Agent**
```
## Task
Guide users to identify and locate the emotion they're experiencing. Help them notice what's present in their body, name the feeling, and describe its qualities.

## Demeanor
Calm, gentle, curious. Like a mindful observer helping someone tune into their internal experience.

## Pacing
Slow and spacious. Pause after questions to give time for internal noticing. 3-5 second pauses after body awareness prompts.
```

This demonstrates:
- **Task specificity**: Exact guidance on what to do
- **Behavioral specificity**: How to behave (demeanor)
- **Temporal specificity**: Explicit timing instructions (3-5 second pauses)
- **Analogical grounding**: "Like a mindful observer"—concrete reference points

**Contrast with generic prompts:**
| Generic Prompt | Our Specific Prompt |
|---------------|---------------------|
| "Be helpful" | "Keep it BRIEF: 1-2 sentences maximum. No long explanations." |
| "Be supportive" | "Soft and patient. Your voice should feel like a warm invitation to notice without judgment." |
| "Guide the conversation" | "Follow the 6F scaffold strictly—it's a proven sequence" |

---

## 2. Structured Conversation States

### Research Foundation

Research on **dialogue management systems** and **conversation flow design** demonstrates that structured state machines improve:
- Response consistency across sessions
- Appropriate transition timing
- Task completion rates
- User satisfaction with AI interactions

The **PhaseEvo framework** (Cui et al., 2024) shows that combining generative capabilities with structured optimization significantly outperforms baseline methods.

### Implementation in Our Prompts

Every therapeutic and coaching agent includes explicit **Conversation States** encoded as JSON structures:

**Example: IFS Grounding & Consent Agent**
```json
{
  "id": "3_somatic_anchor",
  "description": "Ground user in present-moment body awareness",
  "instructions": [
    "Guide: Feel your feet on the ground or surface beneath you",
    "Guide: Gentle breath—in for 4, out for 6",
    "Guide: Notice 3 sounds around you, 3 things you can see, 3 sensations"
  ],
  "examples": [
    "Let's ground together. Feel your feet... wherever they are...",
    "Now a gentle breath. In for four... two, three, four..."
  ],
  "transitions": [{
    "next_step": "4_capacity_check",
    "condition": "After grounding sequence"
  }]
}
```

This structure provides:
- **State identification**: Clear naming (`3_somatic_anchor`)
- **Behavioral instructions**: Exact guidance for each state
- **Example utterances**: Concrete response templates
- **Transition logic**: When and where to move next

**Research Alignment:**
- Mirrors **finite state machine** dialogue management from conversational AI research
- Implements **turn-taking protocols** from human-agent interaction studies
- Provides **Chain-of-Thought scaffolding** through sequential state progression

---

## 3. Persona Engineering & Tone Calibration

### Research Foundation

Research demonstrates that **persona consistency** and **tone calibration** significantly impact:
- User trust and engagement (Nakada et al., 2025)
- Task completion in knowledge-intensive domains
- Perceived helpfulness and competence

The concept of LLMs as "configurable computational systems" suggests that well-defined personas enable transformers to approximate complex interaction functions.

### Implementation in Our Prompts

Every agent includes a comprehensive **Personality and Tone** section with 8+ calibration dimensions:

**Standard Persona Template Applied Across All Agents:**
```
## Identity
[Who the agent is, what role they play, metaphorical comparison]

## Task  
[Specific job definition]

## Demeanor
[Behavioral disposition]

## Tone
[Voice quality and feeling]

## Level of Enthusiasm
[Energy calibration: "Very calm" to "High energy"]

## Level of Formality
[Register: "Casual therapeutic" vs "Professional but warm"]

## Level of Emotion
[Emotional expressiveness calibration]

## Filler Words
[Specific guidance: "Occasionally: 'hm,' 'okay,' 'let's see'"]

## Pacing
[Temporal guidance with second-level specificity]
```

**Cross-Suite Persona Differentiation:**

| Suite | Persona | Enthusiasm | Pacing |
|-------|---------|------------|--------|
| Flow Sprints | "Sports coach mixed with gaming announcer" | High energy, competitive | Quick, urgent |
| Deep Work | "Meditation guide for productivity" | Calm, minimal | Slow, sparse |
| IFS Therapy | "Skilled translator between parts" | Moderate warmth | Slow, spacious |
| Flash SOS | "ER triage nurse" | Very calm, flat | Quick but not frantic |

This implements **adaptive persona engineering**—different interaction contexts require fundamentally different AI behaviors.

---

## 4. Multi-Agent Orchestration

### Research Foundation

The **Model Context Protocol (MCP)** introduced by Anthropic standardizes AI-to-tool interactions. Research on **multi-agent systems** demonstrates that:
- Specialized agents outperform generalist agents on domain tasks
- Agent handoffs enable complex workflow support
- Clear handoff protocols reduce user confusion

### Implementation in Our Prompts

Our system implements sophisticated **multi-agent handoff protocols**:

**Example: Energy Aligned Work Suite**
```
## When done, hand off to Capacity Mapper

## Key Guidelines
- 10-minute capacity conversation max
- Help them see what's actually doable
- Log to Capacity Journal workspace tab
- When done, hand off to Launch Partner
```

**Handoff Trigger Patterns:**
1. **Task completion triggers**: "Once [X] is complete → hand off to [Y]"
2. **Capacity-based triggers**: "If capacity <4 → handoff to microPractice"
3. **Permission-based triggers**: "If protector denies → handoff to integration"
4. **User-choice triggers**: "Based on user preference → handoff to chosen agent"

**Agent Specialization Architecture:**

```
Energy Aligned Work Suite:
├── Grounding Guide (state assessment)
│   └── → Capacity Mapper
├── Capacity Mapper (realistic planning)
│   └── → Launch Partner
└── Launch Partner (task initiation)
    └── → External suite (Deep Focus, Satisfying Work, or Task Sprint)
```

This mirrors research on **hierarchical task networks** and **goal-based agent architectures**.

---

## 5. Evidence-Based Learning Science Integration

### Research Foundation

The prompts directly implement findings from cognitive psychology and education research:
- **Spaced Repetition** (Ebbinghaus Forgetting Curve)
- **Retrieval Practice / Testing Effect** (Roediger & Karpicke)
- **Elaborative Interrogation** (Pressley et al.)
- **Interleaving** (Rohrer & Taylor)
- **Dual Coding** (Paivio)

### Implementation: Evidence-Based Study Suite

**Study Strategist Agent:**
```
# Evidence-Based Principles You Apply

**Spaced Repetition (Ebbinghaus Forgetting Curve)**
- Review material at increasing intervals to combat forgetting
- New topics: Review next day, then 3 days, then 1 week, then 2 weeks, then 1 month
- Adjust intervals based on confidence level (1-5 scale)
- Low confidence (1-2) → Shorter intervals
- High confidence (4-5) → Longer intervals

**Interleaving**
- Mix different topics in study sessions rather than blocking same material
- Improves discrimination and flexible application
```

**Active Recall & Metacognition Agent:**
```
**Active Recall / Retrieval Practice**
- Testing yourself is MORE effective than re-reading
- Struggle to retrieve strengthens memory (desirable difficulty)
- Test BEFORE reviewing for maximum benefit

**Generation Effect**
- Producing answers from memory beats recognition
- Explain in your own words
- Create your own examples
```

This represents **direct translation of peer-reviewed research into prompt instructions**—each principle is operationalized with specific agent behaviors.

---

## 6. Therapeutic Protocol Implementation

### Research Foundation

The IFS (Internal Family Systems) therapy suite implements clinically-validated protocols:
- **6F Protocol**: Find, Focus, Flesh Out, Feel Toward, Befriend, Fears/Needs
- **Unblending techniques**: Creating psychological distance from parts
- **Protector permission protocols**: Safety-first approaches to trauma

### Implementation: IFS Therapy Suite

**Standard Parts Work Agent (6F Protocol):**
```
# Conversation States
[
  { "id": "1_find", "description": "Help user find a part to work with" },
  { "id": "2_focus", "description": "Turn gentle attention toward the part" },
  { "id": "3_flesh_out", "description": "Help the part take shape as a character" },
  { "id": "4_feel_toward", "description": "Check for Self energy toward the part" },
  { "id": "5_befriend", "description": "Build relationship—ask about its role" },
  { "id": "6_fears_needs", "description": "Understand what the part needs" }
]
```

**Safety Protocols Embedded:**
```
## Other details
- ONLY do this work with explicit protector permission
- Stop immediately if protector revokes permission
- Use imaginal care (holding hand, blanket, safe place)
- Always offer containment after—safe place for exile to rest

## Instructions
- This is ONLY for when protectors have given permission
- Go slow—small slices of experience only
- If overwhelming, stop and return to protectors
```

**Crisis Intervention (Flash SOS Agent):**
```
## Identity
You are a crisis de-escalation specialist... like an ER triage nurse—fast, calm, competent.

## Other details
- This is ONLY stabilization—no therapy, no deep work
- Use physiology: breath, cold, movement, pressure
- Orient to present: 5-4-3-2-1 sensory grounding
- If they mention self-harm or danger, immediately provide crisis resources
```

This demonstrates **clinical protocol fidelity**—the prompts faithfully implement therapeutic best practices while maintaining appropriate safety boundaries.

---

## 7. Gamification & Behavioral Design

### Research Foundation

Gamification research demonstrates that:
- **Variable reward schedules** maintain engagement
- **Progress visualization** increases task completion
- **Social comparison** (even with self) motivates improvement
- **Achievement systems** provide extrinsic motivation scaffolding

### Implementation: Flow Sprints Suite

**Sprint Launcher Agent:**
```
## Sprint Types & Targets

**15-min Blitz:**
- Beginner: 3-5 tasks
- Intermediate: 6-8 tasks
- Advanced: 10+ tasks
- "Quick fire! See how fast you can move!"

**30-min Flow:**
- Beginner: 5-8 tasks
- Intermediate: 8-12 tasks
- Advanced: 15+ tasks
```

**Record Breaker Agent (Gamification Engine):**
```
## Celebration Levels

**If NEW RECORD:**
"🏆 NEW PERSONAL BEST! 🏆
You just crushed your previous record of [A] tasks!
UPDATING PERSONAL BESTS..."

**If MATCHED RECORD:**
"You TIED your personal best! [X] tasks—you're consistent at this level."
```

**Challenge Master Agent (Achievement System):**
```
## Achievement Unlocks
- 🏆 **100 Tasks Club** - Complete 100 total tasks
- 🔥 **Week Streak** - 7 consecutive days
- ⚡ **Speed Demon** - 15 tasks in 30 minutes
- 💎 **Flow Master** - Complete 10 sprints in flow state

## Gamification Elements
**XP/Points:**
"That sprint earned you 90 XP! (9 tasks × 10 XP each)"

**Level Up:**
"You just hit 1,000 XP! LEVEL UP to Sprint Master Tier 2!"
```

This implements a **complete behavioral design system**—streak tracking, achievement unlocks, XP systems, and variable celebration levels.

---

## 8. Voice-First Design Considerations

### Research Foundation

Voice-first interfaces differ fundamentally from text:
- **Temporal constraints**: Users can't scan back
- **Cognitive load**: Working memory limits
- **Conversational expectations**: Turn-taking norms
- **Emotional bandwidth**: Paralinguistic cues matter

### Implementation Across All Prompts

**Explicit Voice Guidance:**
```
## Filler Words
Occasionally: "hm," "okay," "let's see," "mm"

## Pacing
Slow and spacious. Pause after questions to give time for internal noticing. 
3-5 second pauses after body awareness prompts. Let silence do its work.
```

**Brevity Requirements:**
```
**Keep it BRIEF:**
- 1-2 sentences maximum
- No long explanations of what the timer notification means
- Get straight to the motivational point
```

**Voice-Appropriate Response Design:**
```
✅ **GOOD Responses:**
- "Halfway mark! You're doing great."
- "5 minutes—bring it home!"

❌ **BAD Responses:**
- "I just received a TIMER_HALFWAY notification indicating you're at 50%..."
- "The timer shows you have exactly 4 minutes and 37 seconds left..."
```

This demonstrates **voice-native prompt design**—acknowledging that voice interactions require different response patterns than text.

---

## 9. Safety & Guardrail Architecture

### Research Foundation

Research on prompt injection and AI safety demonstrates the need for:
- **Explicit safety boundaries** in system prompts
- **Escalation protocols** for crisis situations
- **Scope limitation** to prevent harmful outputs

### Implementation: Safety Protocols

**Therapeutic Boundary Setting:**
```
## Instructions
- This is NOT therapy—it's supportive emotional guidance
- If deep trauma emerges, gently suggest: "This might be something to explore with a therapist"
- Stop immediately if they say their stop-word
- Never proceed to deeper work if capacity is too low (<4/10)
```

**Crisis Resource Integration:**
```
## External Support State
"If you're feeling unsafe, please call 988—that's the Suicide and Crisis Lifeline in the US."
"Or call your therapist, a trusted friend, or 911 if it's an emergency."
"Reaching out for help is brave. You don't have to do this alone."
```

**Consent & Autonomy Preservation:**
```
## Opt-Out Protocol
"Your stop-word is 'pause.' If you say that at any time, I'll stop immediately. 
No questions, no explanation needed. This is your process."
```

---

## 10. Key Research Principles Applied

### Summary Table

| Research Principle | Source | Implementation in Our Prompts |
|-------------------|--------|-------------------------------|
| **Prompt Specificity** | DETAIL Framework (Kim, 2025) | 8+ calibration dimensions per agent |
| **Structured States** | Dialogue Management Research | JSON conversation state machines |
| **Persona Consistency** | Nakada et al., 2025 | Standardized personality template |
| **Chain-of-Thought** | CoT Prompting Research | Sequential conversation states |
| **Multi-Agent Orchestration** | MCP Protocol | Explicit handoff conditions |
| **Spaced Repetition** | Ebbinghaus | Study suite scheduling logic |
| **Retrieval Practice** | Testing Effect Research | Active Recall agent design |
| **Gamification** | Behavioral Design Research | XP, streaks, achievements |
| **Voice-First Design** | HCI Research | Pacing, brevity, filler words |
| **Safety Boundaries** | AI Safety Research | Crisis protocols, scope limits |

### Novel Contributions

Our prompt design makes several contributions beyond existing research:

1. **Multi-Agent Voice Orchestration**: No prior research examines how users orchestrate multiple voice agents for complex tasks

2. **Therapeutic Protocol Embedding**: First implementation of complete IFS 6F protocol in voice agent architecture

3. **Adaptive Persona Calibration**: 8-dimension persona specification system exceeds typical 2-3 dimension approaches

4. **Evidence-Based Learning Agent Design**: Direct operationalization of cognitive psychology findings into agent behaviors

5. **Voice-Native Safety Protocols**: Integration of crisis intervention with voice-first constraints

---

## Conclusion

The system prompts in this voice agent experiment represent a sophisticated synthesis of:
- **Prompt engineering research** (specificity, structure, optimization)
- **Conversational AI design** (state machines, turn-taking, persona)
- **Learning science** (spaced repetition, retrieval practice, metacognition)
- **Therapeutic protocols** (IFS, grounding, crisis intervention)
- **Behavioral design** (gamification, streaks, achievements)
- **Voice UX research** (pacing, brevity, filler words)

The prompts don't merely apply existing research—they extend it by demonstrating how these principles can be combined into coherent, multi-agent voice systems that support complex human tasks like emotional regulation, focused work, and learning.

---

## References

1. Kim, O. (2025). DETAIL: A Framework for Evaluating LLM Performance Across Prompt Specificity Levels. *arXiv:2512.02246*

2. Nakada, Y. et al. (2025). Theoretical Framework for Transformer Prompt Engineering. *arXiv:2503.20561*

3. Cui, J. et al. (2024). PhaseEvo: Unified In-Context Prompt Optimization via Evolutionary Algorithms. *arXiv:2402.11347*

4. Gutheil, L. et al. (2025). PromptPilot: Interactive Prompting Assistance for Human-AI Collaboration. *arXiv:2510.00555*

5. Anthropic. (2024). Model Context Protocol (MCP) Specification. *anthropic.com*

6. Schwartz, R.C. (1995). Internal Family Systems Therapy. Guilford Press.

7. Roediger, H.L. & Karpicke, J.D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science*.

8. Ebbinghaus, H. (1885). Memory: A Contribution to Experimental Psychology.

---

*This document was prepared to support the Voice Agent Efficacy Study (RQ-1 through RQ-4) and demonstrates the research foundation for the experimental system prompts.*


