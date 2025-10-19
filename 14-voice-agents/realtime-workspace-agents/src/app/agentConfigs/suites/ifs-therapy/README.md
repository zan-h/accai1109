# IFS Therapy Suite

A comprehensive Internal Family Systems (IFS) voice agent suite for guided self-therapy and parts work.

## Overview

The IFS Therapy Suite provides 12 specialized agents that guide users through various IFS protocols, from basic grounding to deep healing work with exiles and burden release. Each agent follows trauma-informed, protector-respecting principles and uses state machines based on proven IFS methodology.

## Suite Structure

### Core Agents (8 Session Types)

1. **Grounding & Consent Check** (`groundingConsent`)
   - Duration: 2-4 minutes
   - Establishes safety, consent, and capacity
   - Always starts here to ensure readiness

2. **Standard Parts Session** (`standardParts`)
   - Duration: 20-45 minutes
   - 6F scaffold: Find, Focus, Flesh Out, Feel Toward, Befriend, Fears/Needs
   - Main parts-work protocol

3. **Unblending Protocol** (`unblending`)
   - Duration: 5-12 minutes
   - Creates space between Self and blended part
   - Increases Self energy

4. **Protector Negotiation** (`protectorNegotiation`)
   - Duration: 10-25 minutes
   - Earns protector trust and permission
   - Co-designs safety conditions

5. **Exile Witnessing & Caring** (`exileWitnessing`)
   - Duration: 15-40 minutes
   - ONLY with protector permission
   - Provides Self presence to wounded parts

6. **Polarization Mediation** (`polarization`)
   - Duration: 15-35 minutes
   - Mediates conflicts between parts
   - Finds common ground and creates agreements

7. **Burden Release** (`burdenRelease`)
   - Duration: 10-25 minutes
   - Releases beliefs/emotions that aren't essence
   - Uses imaginal rituals

8. **Integration & Re-entry** (`integration`)
   - Duration: 3-6 minutes
   - Closes sessions with gratitude and grounding
   - Provides gentle next steps

### Applied Agents (4 Specialized Protocols)

9. **Urge Protocol** (`urgeProtocol`)
   - Duration: 8-20 minutes
   - Surfs addictive urges and compulsions
   - Meets firefighter parts with respect

10. **Flash Activation "SOS"** (`flashSOS`)
    - Duration: 3-8 minutes
    - Acute de-escalation for overwhelm
    - Stabilization only—no deep work

11. **Daily Micro-Practice** (`microPractice`)
    - Duration: 5-10 minutes
    - Brief daily check-ins with parts
    - Builds relationship continuity

12. **Values/Intent Session** (`valuesIntent`)
    - Duration: 10-20 minutes
    - Self-led planning with protector buy-in
    - Sets gentle intentions and experiments

## Workspace Templates

The suite provides 9 workspace templates for tracking IFS work:

1. **Parts Map** - Track all parts, their roles, and relationships
2. **Session Log** - Record session outcomes and insights
3. **Burdens Released** - Document burden releases and shifts
4. **Protector Contracts** - Honor protector boundaries
5. **Polarization Work** - Mediate internal conflicts
6. **Daily Micro-Practice Log** - Track brief check-ins
7. **Urge Tracking** - Monitor compulsions and alternatives
8. **Safety Protocol** - Emergency info and guidelines
9. **Self-Led Intentions** - Plan from Self with protector consent

## Handoff Flow

The suite uses strategic handoffs based on IFS protocol:

### Common Flows

**Starter Session (25 min):**
```
Grounding → Unblending → Standard Parts (protector only) → Integration
```

**Deeper Work (45 min):**
```
Grounding → Protector Negotiation → Exile Witnessing → Integration
```

**Behavior Work (20 min):**
```
Grounding → Polarization Mediation → Values/Intent → Integration
```

**Crisis-Safe (10 min):**
```
Flash SOS → Unblending Lite → Micro-Practice → Close
```

### Key Handoff Rules

- **Always** start with Grounding & Consent Check
- **Never** go to Exile Witnessing without Protector Negotiation first
- **Always** end with Integration agent for proper closure
- Flash SOS is for acute stabilization only

## Voice Agent Design

Each agent follows the metaprompt.md guidelines with:
- Distinct personality and tone
- Trauma-informed approach
- State machines for structured flow
- Somatic grounding techniques
- Protector-respecting boundaries

### Voice Assignments

- **Grounding, Unblending, Urge, Integration:** `alloy` (calm, steady)
- **Standard Parts, Protector, Polarization, Micro-Practice, Values:** `echo` (warm, therapeutic)
- **Exile Witnessing, Burden Release:** `shimmer` (soft, gentle)
- **Flash SOS:** `onyx` (clear, direct, crisis-stable)

## Safety Guidelines

⚠️ **Important:**
- This is supportive guidance using IFS principles, NOT therapy
- Always respect capacity levels (0-10 scale)
- Stop immediately if user says their stop-word ("pause")
- Never force deeper work if protectors object
- Provide crisis resources (988 in US) if needed

### Capacity Guidelines
- **0-3:** Crisis support only (SOS protocol)
- **4-6:** Light work (grounding, micro-practice, unblending)
- **7+:** Deeper work possible (exile witnessing, burden release)

## Development Notes

- Each agent has a dedicated prompt file in `prompts.ts`
- All agents use `basicWorkspaceTools` for file operations
- Handoffs are configured in `index.ts`
- Suite config includes 9 workspace templates
- All state machines use JSON format for voice-agent compatibility

## Usage

Users select the IFS Therapy Suite from the suite selector. They always begin with the Grounding & Consent Check agent, which assesses their capacity and guides them to the appropriate session type based on their needs.

The suite is designed for:
- Daily emotional regulation (5-10 min micro-practices)
- Processing difficult emotions and triggers
- Understanding protective patterns
- Healing childhood wounds
- Managing internal conflicts
- Navigating urges and compulsions
- Setting Self-led intentions

## References

Based on Internal Family Systems (IFS) therapy developed by Dr. Richard Schwartz. This implementation follows core IFS principles while adapting for voice-based self-guidance.


