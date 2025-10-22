# Agent Suite Creation Protocol
## Complete Template for Planning & Implementing Engaging Voice Agent Suites

**Last Updated:** October 20, 2025  
**Version:** 1.0  

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Pre-Planning Phase](#pre-planning-phase)
3. [Suite Design Template](#suite-design-template)
4. [Agent Design Template](#agent-design-template)
5. [Workspace Design Template](#workspace-design-template)
6. [Implementation Checklist](#implementation-checklist)
7. [Code Structure Reference](#code-structure-reference)
8. [Design Principles](#design-principles)
9. [Example Suite Analyses](#example-suite-analyses)

---

## Architecture Overview

### System Components

The agent suite system consists of:

1. **Suite Configuration** - Metadata, workspace templates, and initialization settings
2. **Agents** - Individual voice agents with specialized roles and personalities
3. **Handoff Logic** - Dynamic agent-to-agent transfers based on conversation context
4. **Workspace System** - Persistent tabs (markdown/CSV) for tracking and data management
5. **Guardrails** - Safety and moderation layers
6. **Tools** - Functions agents can call (workspace manipulation, computation, web access)

### Technology Stack

- **Framework:** OpenAI Realtime API with agent orchestration
- **Voice Models:** OpenAI TTS voices (alloy, echo, sage, shimmer, verse)
- **Workspace:** Multi-tab interface with markdown and CSV support
- **State Management:** React Context with persistent storage via Supabase
- **User Auth:** Clerk authentication

### Suite Architecture Pattern

```
Suite
├── Config (metadata, templates, initial context)
├── Agents (3-5 specialized agents)
│   ├── Agent 1 (specific role)
│   ├── Agent 2 (specific role)
│   └── Agent 3 (specific role)
├── Workspace Templates (3-9 tabs)
│   ├── CSV logs (time-series tracking)
│   └── Markdown docs (reference, checklists)
├── Handoff Logic (conversation-driven transfers)
└── Guardrails (safety, moderation)
```

---

## Pre-Planning Phase

### Step 1: Domain Analysis

**Questions to Answer:**

1. **What problem does this suite solve?**
   - User pain point or need
   - Context/scenario when it's used
   - Expected outcomes

2. **Who is the target user?**
   - Experience level (beginner/intermediate/advanced)
   - Typical use case
   - Session frequency and duration

3. **What are the key sub-domains?**
   - Break problem space into 3-5 distinct areas
   - Each area should be cohesive and non-overlapping
   - Example: Baby Care → Feeding, Sleep, Development, Health, Calming

4. **What data needs tracking?**
   - Time-series logs (CSV)
   - Reference information (Markdown)
   - Progress tracking
   - Emergency/critical information

5. **What are the handoff triggers?**
   - When should users move between agents?
   - What keywords/topics trigger transfers?
   - How do agents collaborate?

### Step 2: Competitive/Analogous Analysis

**Research:**
- What human experts exist in this domain? (therapists, coaches, specialists)
- What personality traits make them effective?
- What tools/frameworks do they use?
- What language/terminology is standard?
- What common mistakes do beginners make?

### Step 3: User Journey Mapping

**Sketch the journey:**

1. **Initial State:** User arrives with [problem/need]
2. **Onboarding:** How do they understand what the suite does?
3. **First Session:** Which agent do they meet first? Why?
4. **Typical Flow:** Most common agent sequence
5. **Edge Cases:** Overwhelm, confusion, off-topic, crisis
6. **Success State:** What does "working well" look like?

---

## Suite Design Template

### Section 1: Suite Metadata

```typescript
// SUITE IDENTITY
Suite ID: [kebab-case-name]
Suite Name: [User-Facing Name]
Icon: [Emoji representing the suite]
Category: [productivity | mental-health | planning | coaching | learning | creativity]
Tags: [5-10 specific keywords for discoverability]

// USER PROFILE
Target User Level: [beginner | intermediate | advanced]
Suggested Use Cases: [3-5 specific scenarios]
Estimated Session Length: [X minutes]

// DESCRIPTION
One-Line Pitch: [Compelling 10-15 word description]
Full Description: [2-3 sentences explaining what suite does and who it's for]
```

**Example:**
```typescript
Suite ID: baby-care
Suite Name: Baby Care Companion
Icon: 👶
Category: mental-health
Tags: [baby, infant-care, parenting, feeding, sleep, development, health, newborn]

Target User Level: beginner
Suggested Use Cases:
  - First-time babysitting
  - Caring for infant temporarily
  - Tracking feeding and sleep patterns
  - Monitoring developmental milestones
  - Emergency baby care guidance

Estimated Session Length: 30 minutes (quick check-ins throughout day)

One-Line Pitch: Expert support for infant care with feeding, sleep, development, and health tracking
Full Description: The Baby Care Companion helps you confidently care for infants with specialized agents for feeding schedules, sleep patterns, developmental milestones, health monitoring, and calming techniques. Perfect for temporary caregivers, new parents, or anyone learning infant care.
```

### Section 2: Agent Portfolio (3-5 Agents)

**For Each Agent, Define:**

| Attribute | Description |
|-----------|-------------|
| Agent Name | Programmatic name (camelCase) |
| Display Title | User-facing name |
| Role | Primary responsibility (1 sentence) |
| Voice | OpenAI voice (alloy, echo, sage, shimmer, verse) |
| Personality | Core traits (3-5 adjectives) |
| Speaking Style | Tone, pacing, formality level |
| Expertise | Specific knowledge domains |
| Handoff Triggers | When to transfer to other agents |
| Success Metrics | How to know this agent is working well |

**Agent Design Questions:**

1. **What is this agent's singular focus?**
   - One clear domain of expertise
   - No overlap with other agents

2. **What personality makes this agent effective?**
   - Calm for sleep specialist
   - Upbeat for development tracker
   - Professional for health monitor

3. **What does this agent need to track?**
   - Which workspace tabs does it primarily use?

4. **When should this agent hand off?**
   - Clear triggers for transfers
   - Example: "If user mentions fever → transfer to healthMonitor"

### Section 3: Workspace Templates (3-9 Tabs)

**Design Principles:**

- **CSV Templates** = Time-series tracking, repeated events, logs
- **Markdown Templates** = Reference info, checklists, instructions, free-form notes

**For Each Template:**

| Attribute | Specification |
|-----------|---------------|
| Name | Tab label (clear, concise) |
| Type | markdown or csv |
| Purpose | What does this track/store? |
| Primary Agent | Which agent uses this most? |
| Update Frequency | How often is this modified? |
| Pre-populated Data | Include examples? Current date? |

**CSV Template Structure:**
```csv
Column1|Column2|Column3|Notes
[Example row with real data]
[Example row with real data]
```

**Markdown Template Structure:**
```markdown
# Main Title

## Section 1: [Purpose]
- [ ] Checklist items
- User fills in blanks

## Section 2: [Reference]
Key information or instructions

## Section 3: [Tracking]
Space for ongoing notes
```

### Section 4: Conversation Flow Design

**Suite-Level Flow:**

```
Entry Point: [Which agent starts?]
  ↓
Primary Flow: [Most common agent sequence]
  ↓
Common Branches: [Alternative paths]
  ↓
Exit Points: [How sessions close]
```

**Example:**
```
Entry Point: feedingCoach (most frequent need)
  ↓
If baby won't eat → Check health (healthMonitor)
If baby won't sleep after feeding → Transfer to sleepSpecialist
If baby crying → Transfer to calmingCoach
  ↓
All paths can return to feedingCoach or close via any agent
```

**Handoff Matrix:**

|           | Agent 1 | Agent 2 | Agent 3 | Agent 4 | Agent 5 |
|-----------|---------|---------|---------|---------|---------|
| Agent 1   | -       | ✓       | ✓       | ✓       | ✓       |
| Agent 2   | ✓       | -       | ✓       | ✓       | ✗       |
| Agent 3   | ✓       | ✓       | -       | ✓       | ✗       |
| Agent 4   | ✓       | ✓       | ✓       | -       | ✓       |
| Agent 5   | ✓       | ✗       | ✗       | ✓       | -       |

### Section 5: Initial Context & State

**Suite-Level Context:**

```typescript
initialContext: {
  [key: string]: any;  // Suite-specific configuration
}
```

**Example:**
```typescript
initialContext: {
  careType: 'temporary',           // User's relationship to situation
  experienceLevel: 'learning',     // User's competency
  supportStyle: 'reassuring',      // How agents should communicate
}
```

---

## Agent Design Template

### Agent Specification Document

**For each agent in the suite, complete this template:**

---

#### 1. Agent Identity

```typescript
// BASIC INFO
Agent Name: [camelCaseName]
Display Name: [User-Facing Title]
Voice: [alloy | echo | sage | shimmer | verse]
Emoji/Symbol: [Representative emoji]

// ROLE
Primary Function: [One sentence description of core responsibility]
Secondary Functions: [Supporting roles, if any]
```

#### 2. Personality & Tone Profile

Use this framework to define voice personality:

```typescript
## Identity
[Who is this agent? Use analogies - "like a..." ]

## Task
[What is the agent's core job? Be specific.]

## Demeanor
[How does the agent carry itself? Emotional baseline?]

## Tone
[How does it sound? Reference familiar voices/archetypes]

## Level of Enthusiasm
[Energy level: 1-10 scale, examples]

## Level of Formality
[Formal vs casual: provide example phrases]

## Level of Emotion
[Emotional expressiveness: neutral to highly empathic]

## Filler Words
[Frequency: never, occasionally, frequently]
[Examples: "um," "let's see," "okay," "hmm"]

## Pacing
[Speed: very slow | slow | moderate | quick | rapid]
[Context: when to pause, when to move fast]

## Other Details
[Any unique quirks, speech patterns, or characteristics]
```

**Example (Sleep Specialist):**

```typescript
## Identity
You are a gentle Sleep Specialist who helps establish healthy sleep patterns for babies and peace of mind for caregivers.

## Task
Track sleep patterns and quality, suggest age-appropriate nap schedules, help establish bedtime routines, troubleshoot sleep difficulties, support tired caregivers.

## Demeanor
Calm, grounding, gently authoritative yet warm. You move slowly and deliberately, creating spaciousness.

## Tone
Calm and soothing, like a meditation teacher. Speak slowly with pauses. Use comforting, peaceful language.

## Level of Enthusiasm
3/10 - Calm and measured. You're present but not excited—think steady flame, not spark.

## Level of Formality
Casual but respectful. "Let's check in" not "We shall commence the assessment."

## Level of Emotion
Neutral to gently warm. You're emotionally stable—a grounding presence, not reactive.

## Filler Words
Occasionally—just enough to feel human: "mm," "let's see," "okay"

## Pacing
Slow and spacious. Pause between questions. Give time for the body to respond. 4-6 second pauses after somatic prompts.

## Other Details
- Use simple, concrete language
- Include gentle body awareness cues
- Always respect if someone isn't ready
- Never rush this process—safety first
```

#### 3. Knowledge & Expertise

```typescript
// DOMAIN KNOWLEDGE
Core Expertise:
  - [Specific topic 1]
  - [Specific topic 2]
  - [Specific topic 3]

Reference Frameworks:
  - [Method/system used, if any]
  - [Guidelines followed]

Key Concepts to Explain:
  - [Term 1]: [Definition]
  - [Term 2]: [Definition]

Common User Questions:
  1. [Question] → [How agent answers]
  2. [Question] → [How agent answers]
```

#### 4. Conversation Architecture

**Option A: Freeform Conversational**
```typescript
// For agents that don't need strict structure
Conversation Style: Open-ended, responsive to user
Key Patterns:
  1. [Pattern name]: [When and how used]
  2. [Pattern name]: [When and how used]
```

**Option B: Structured Conversation States**
```typescript
// For agents that follow a specific protocol (IFS, coaching, assessments)

Conversation States:
[
  {
    id: "1_state_name",
    description: "What happens in this state",
    instructions: [
      "Step by step instructions for agent",
      "What to ask or say",
      "How to handle responses"
    ],
    examples: [
      "Example phrase 1",
      "Example phrase 2"
    ],
    transitions: [
      {
        next_step: "2_next_state",
        condition: "When to move forward"
      }
    ]
  },
  // ... more states
]
```

**Example (Baby Feeding Coach - Freeform):**

```typescript
Conversation Style: Open-ended, responsive to user needs

Key Patterns:

1. **Check-In Pattern**
   - When: Start of conversation or when user reconnects
   - Flow: "When was last feeding?" → Log details → Assess adequacy → Advise timing → Address concerns

2. **Logging Pattern**
   - When: User reports feeding
   - Flow: Time → Type (bottle/breast) → Amount → Duration → Notes → Confirm logged

3. **Troubleshooting Pattern**
   - When: User expresses concern ("baby won't eat")
   - Flow: Ask clarifying questions → Rule out medical concerns → Provide strategies → Log attempt → Follow up

4. **Handoff Pattern**
   - When: Topic shifts outside feeding domain
   - Flow: Acknowledge concern → Explain who can help better → Confirm transfer → Hand off gracefully
```

#### 5. Tool Usage

```typescript
// TOOLS THIS AGENT USES
Primary Tools:
  - workspaceTools.readTab(tabName)
  - workspaceTools.updateTab(tabName, content)
  - workspaceTools.appendToTab(tabName, newRow)

Workspace Tabs This Agent Interacts With:
  - [Tab Name 1]: [How used - read/write/both]
  - [Tab Name 2]: [How used]

Custom Tools (if any):
  - [Tool name]: [Purpose and usage]
```

#### 6. Handoff Logic

```typescript
// WHEN TO TRANSFER TO OTHER AGENTS

Handoff Triggers:
[
  {
    target_agent: "agentName",
    triggers: [
      "Keyword/phrase pattern",
      "User intent description",
      "Conversation state"
    ],
    examples: [
      "User says: '...' → Transfer to X",
      "When user asks about [...] → Transfer to Y"
    ]
  }
]

Handoff Script Template:
"[Acknowledge current topic]. [Explain why other agent is better]. 
[Confirm user wants transfer]. [Smooth handoff phrase]."

Example:
"I hear you're concerned about sleep patterns. Our Sleep Specialist 
knows all about nap schedules and sleep training. Would you like me 
to connect you with them?"
```

#### 7. Safety & Boundaries

```typescript
// RED FLAGS & ESCALATION
Critical Situations:
  - [Situation 1]: [Agent response - refer to professional/emergency]
  - [Situation 2]: [Agent response]

Out of Scope Topics:
  - [Topic]: "I'm not equipped for this, but here's what you can do..."
  
Disclaimers to Include:
  - [Required disclaimer text]
  
Stop Words/Emergency Protocol:
  - If user says [X], immediately [action]
```

**Example (Health Monitor):**

```typescript
// RED FLAGS - CALL DOCTOR IMMEDIATELY
Critical Situations:
  - Fever >100.4°F (38°C) in baby under 3 months → "Call pediatrician RIGHT NOW"
  - Difficulty breathing → "This is a medical emergency. Call 911."
  - Severe vomiting or diarrhea → "Call doctor immediately"
  - Dehydration signs → "Call doctor immediately"

Out of Scope:
  - Diagnosis: "I can't diagnose. Your pediatrician needs to assess this."
  - Medication dosing: "Only your doctor can prescribe dosages."

Disclaimers:
  - "I'm a supportive guide, not a medical professional. Always consult your pediatrician for medical advice."
```

#### 8. Success Metrics & Quality Indicators

```typescript
// HOW TO KNOW THIS AGENT IS WORKING WELL

User Experience Indicators:
  - User feels [emotion] after interaction
  - User successfully completes [action]
  - User returns for [reason]

Conversation Quality Markers:
  - Agent maintains [personality trait] throughout
  - Handoffs happen smoothly at [trigger points]
  - User doesn't get confused or lost

Data Quality:
  - [Workspace tab] is updated with [frequency]
  - Logs include [required information]
```

---

## Workspace Design Template

### Template Specification

For each workspace tab, complete this specification:

```typescript
// TEMPLATE METADATA
{
  name: "[Tab Label]",
  type: "markdown" | "csv",
  description: "[What this tab is for - user sees this]",
  
  // PRIMARY AGENT
  primary_agent: "[Agent who uses this most]",
  secondary_agents: ["[Other agents who interact with this]"],
  
  // UPDATE PATTERN
  update_frequency: "[Every session | Daily | As needed | Reference only]",
  user_editable: true | false,
  
  // CONTENT DESIGN
  content: `[Actual template content with examples]`
}
```

### CSV Template Design

**Best Practices:**

1. **Column Structure:**
   - Use `|` as delimiter (pipe-separated)
   - First row = headers (clear, concise labels)
   - Include "Notes" or "Comments" column for free-form text

2. **Pre-population:**
   - Include 1-2 example rows
   - Use realistic sample data
   - Show desired format

3. **Data Types:**
   - Timestamps: "HH:MM AM/PM" or "YYYY-MM-DD HH:MM"
   - Dates: Use `${new Date().toLocaleDateString()}` for current date
   - Numbers: Show units (4 oz, 15 min, 7/10)
   - Categories: Show options (Good|Fair|Poor)

**Example CSV Template:**

```typescript
{
  name: "Feeding Log",
  type: "csv",
  description: "Track all feedings with times, amounts, and notes",
  
  content: `Time|Type|Amount (oz)|Duration (min)|Notes
${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}|Bottle|4 oz|15|Finished completely, seemed hungry
09:45 AM|Bottle|3 oz|10|Left 1 oz, distracted
`
}
```

### Markdown Template Design

**Best Practices:**

1. **Structure:**
   - Use H1 for main title
   - Use H2 for sections
   - Use H3 for subsections

2. **Interactive Elements:**
   - Checkboxes: `- [ ] Item`
   - Fill-in blanks: `- **Field**: _____ ` or `[Your answer here]`
   - Tables for structured data

3. **Content Strategy:**
   - Provide clear instructions
   - Include examples where helpful
   - Leave space for user input
   - Use dividers (`---`) to separate sections

**Example Markdown Template:**

```typescript
{
  name: "Emergency Info",
  type: "markdown",
  description: "Critical information for emergencies",
  
  content: `# Emergency Information

## Parents Contact
- Mom: 
- Dad: 
- Best time to call: 

## Medical Contacts
- Pediatrician: 
- After-hours clinic: 
- Hospital: 
- Poison Control: 1-800-222-1222

## Baby Information
- **Name:** 
- **Date of Birth:** 
- **Age:** 
- **Weight:** 
- **Allergies:** None known
- **Medications:** 
- **Medical conditions:** 

## Important Notes
- Formula brand: 
- Usual feeding times: 
- Sleep schedule: 
- Special instructions: 

---

## Emergency Protocol

If baby has:
- Fever >100.4°F and under 3 months → Call pediatrician IMMEDIATELY
- Difficulty breathing → Call 911
- Won't wake up or very lethargic → Call 911
- Severe vomiting or diarrhea → Call pediatrician

**When in doubt, call the pediatrician. They want to hear from you.**
`
}
```

---

## Implementation Checklist

### Phase 1: Planning & Design (Complete Before Coding)

- [ ] **Domain Research**
  - [ ] Identify core problem and user need
  - [ ] Research expert practices in domain
  - [ ] Map user journey from start to success
  - [ ] Identify 3-5 distinct sub-domains for agents

- [ ] **Suite Design**
  - [ ] Complete Suite Metadata section
  - [ ] Define 3-5 agents with clear, non-overlapping roles
  - [ ] Design 3-9 workspace templates
  - [ ] Map conversation flows and handoff triggers
  - [ ] Define initial context configuration

- [ ] **Agent Design (For Each Agent)**
  - [ ] Complete Agent Specification Document
  - [ ] Define personality and tone profile
  - [ ] Write conversation architecture
  - [ ] Specify tool usage patterns
  - [ ] Define handoff logic
  - [ ] Document safety boundaries

- [ ] **Workspace Design (For Each Template)**
  - [ ] Choose type (CSV or Markdown)
  - [ ] Design structure and columns/sections
  - [ ] Create pre-populated examples
  - [ ] Assign primary and secondary agents

### Phase 2: File Creation (Directory Structure)

```bash
# Create suite directory
cd src/app/agentConfigs/suites
mkdir -p [suite-name]/agents

# Create core files
touch [suite-name]/suite.config.ts
touch [suite-name]/prompts.ts
touch [suite-name]/index.ts

# Create agent files
touch [suite-name]/agents/[agent1Name].ts
touch [suite-name]/agents/[agent2Name].ts
touch [suite-name]/agents/[agent3Name].ts
# ... etc
```

### Phase 3: Implementation (Code)

- [ ] **suite.config.ts**
  - [ ] Import types from '@/app/agentConfigs/types'
  - [ ] Define and export suite configuration object
  - [ ] Include all metadata (id, name, description, icon, category, tags)
  - [ ] Add suggestedUseCases and user targeting
  - [ ] Define workspaceTemplates array with all tabs
  - [ ] Set initialContext if needed

- [ ] **prompts.ts**
  - [ ] Export constant for each agent's system prompt
  - [ ] Include personality, tone, and conversation guidance
  - [ ] Document handoff triggers in prompts
  - [ ] Add safety disclaimers where appropriate

- [ ] **agents/[agentName].ts (For Each Agent)**
  - [ ] Import RealtimeAgent from '@openai/agents/realtime'
  - [ ] Import workspace tools
  - [ ] Import agent prompt from '../prompts'
  - [ ] Create and export agent instance
  - [ ] Configure: name, voice, instructions, tools
  - [ ] Leave handoffs empty (wired in index.ts)

- [ ] **index.ts**
  - [ ] Import all agents
  - [ ] Import suite config
  - [ ] Import guardrails
  - [ ] Create agents array
  - [ ] Wire up handoffs (usually all-to-all or custom logic)
  - [ ] Export complete suite object with agents, rootAgent, guardrails

- [ ] **Register in agentConfigs/index.ts**
  - [ ] Import suite default export
  - [ ] Call registerSuiteManually(suiteRegistry, [suiteName])

### Phase 4: Testing

- [ ] **Build & Run**
  - [ ] `npm run build` succeeds without errors
  - [ ] `npm run dev` starts successfully
  - [ ] Suite appears in selector UI

- [ ] **Suite Selection**
  - [ ] Suite card displays correctly (icon, name, description)
  - [ ] Agent list shows all agents
  - [ ] Tags are visible

- [ ] **Workspace Initialization**
  - [ ] All tabs create successfully
  - [ ] CSV tabs have correct column headers
  - [ ] Markdown tabs render properly
  - [ ] Pre-populated data appears correctly

- [ ] **Agent Functionality (For Each Agent)**
  - [ ] Connects successfully
  - [ ] Personality/tone matches design
  - [ ] Voice sounds appropriate
  - [ ] Responds relevantly to domain queries
  - [ ] Can read workspace tabs
  - [ ] Can update workspace tabs
  - [ ] Logs data correctly (CSV format, markdown updates)

- [ ] **Handoff Testing**
  - [ ] Each agent can transfer to intended targets
  - [ ] Handoff triggers work (keyword detection)
  - [ ] Transfer feels smooth and natural
  - [ ] Context maintains across handoffs
  - [ ] No circular loops or dead ends

- [ ] **Edge Cases**
  - [ ] Out-of-scope questions handled gracefully
  - [ ] Safety triggers work (medical advice, crisis)
  - [ ] User can return to previous agents
  - [ ] Session closes cleanly

### Phase 5: Refinement

- [ ] **Voice & Personality**
  - [ ] Each agent feels distinct
  - [ ] Tone matches intended personality
  - [ ] Pacing is appropriate
  - [ ] Filler words sound natural

- [ ] **Conversation Quality**
  - [ ] Agents don't repeat themselves
  - [ ] Questions are relevant and helpful
  - [ ] Responses are appropriately length
  - [ ] Transitions are smooth

- [ ] **Workspace Usability**
  - [ ] Tabs are easy to understand
  - [ ] Data entry is intuitive
  - [ ] Examples are helpful
  - [ ] Layout is clean

- [ ] **Documentation**
  - [ ] Add README.md to suite directory
  - [ ] Document any unusual patterns
  - [ ] Include usage examples
  - [ ] Note any limitations or caveats

---

## Code Structure Reference

### File Structure

```
src/app/agentConfigs/suites/[suite-name]/
├── suite.config.ts          # Suite metadata & workspace templates
├── prompts.ts               # System prompts for all agents
├── index.ts                 # Suite export & handoff wiring
├── tools.ts                 # Custom tools (optional)
├── README.md                # Documentation (optional)
└── agents/                  # Individual agent definitions
    ├── agent1.ts
    ├── agent2.ts
    └── agent3.ts
```

### Type Definitions Reference

```typescript
// FROM: src/app/agentConfigs/types.ts

export type SuiteCategory = 
  | 'productivity'
  | 'mental-health' 
  | 'planning'
  | 'coaching'
  | 'learning'
  | 'creativity';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface WorkspaceTemplate {
  name: string;
  type: 'markdown' | 'csv';
  content: string;
  description?: string;
}

export interface SuiteConfig {
  // Required metadata
  id: string;
  name: string;
  description: string;
  icon: string;
  category: SuiteCategory;
  tags: string[];
  
  // Optional metadata
  suggestedUseCases?: string[];
  userLevel?: UserLevel;
  estimatedSessionLength?: number; // minutes
  author?: string;
  version?: string;
  
  // Workspace configuration
  workspaceTemplates?: WorkspaceTemplate[];
  
  // Suite-specific context
  initialContext?: Record<string, any>;
}

export interface AgentSuite extends SuiteConfig {
  // Agent configuration
  agents: RealtimeAgent[];
  rootAgent: RealtimeAgent;
  
  // Optional guardrails
  guardrails?: any[];
}
```

### suite.config.ts Template

```typescript
import { SuiteConfig } from '@/app/agentConfigs/types';

export const [suiteName]SuiteConfig: SuiteConfig = {
  id: '[suite-id]',
  name: '[Suite Display Name]',
  description: '[User-facing description]',
  icon: '[Emoji]',
  category: '[category]',
  tags: [
    '[tag1]',
    '[tag2]',
    // ...
  ],
  
  suggestedUseCases: [
    '[Use case 1]',
    '[Use case 2]',
    // ...
  ],
  
  userLevel: '[beginner|intermediate|advanced]',
  estimatedSessionLength: [number], // minutes
  
  workspaceTemplates: [
    {
      name: '[Tab Name]',
      type: '[markdown|csv]',
      content: `[Template content]`,
      description: '[What this tab does]',
    },
    // ... more templates
  ],
  
  initialContext: {
    // Suite-specific configuration
  },
};
```

### prompts.ts Template

```typescript
// Agent 1 Prompt
export const [agent1Name]Prompt = `
You are [description of agent role and personality].

# Your Role
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

# Approach
- [Guideline 1]
- [Guideline 2]

# Conversation Flow
1. [Step 1]
2. [Step 2]
3. [Step 3]

# When to Hand Off
- [Trigger] → Transfer to [agentName]
- [Trigger] → Transfer to [agentName]

# Important Notes
- [Safety guideline]
- [Disclaimer]
`;

// Agent 2 Prompt
export const [agent2Name]Prompt = `
[Similar structure]
`;

// ... more agent prompts
```

### agents/[agentName].ts Template

```typescript
import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { [agentName]Prompt } from '../prompts';

export const [agentName]Agent = new RealtimeAgent({
  name: '[agentName]',
  voice: '[alloy|echo|sage|shimmer|verse]',
  instructions: [agentName]Prompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});
```

### index.ts Template

```typescript
import { AgentSuite } from '@/app/agentConfigs/types';
import { [suiteName]SuiteConfig } from './suite.config';
import { [agent1Name]Agent } from './agents/[agent1Name]';
import { [agent2Name]Agent } from './agents/[agent2Name]';
import { [agent3Name]Agent } from './agents/[agent3Name]';
// ... import more agents
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up handoffs
const agents = [
  [agent1Name]Agent,
  [agent2Name]Agent,
  [agent3Name]Agent,
  // ... more agents
];

// OPTION A: All agents can reach each other
agents.forEach(agent => {
  const otherAgents = agents.filter(a => a !== agent);
  (agent.handoffs as any).push(...otherAgents);
});

// OPTION B: Custom handoff logic
// [agent1Name]Agent.handoffs = [[agent2Name]Agent, [agent3Name]Agent];
// [agent2Name]Agent.handoffs = [[agent1Name]Agent];
// ... etc

// Export suite
const [suiteName]Suite: AgentSuite = {
  ...[suiteName]SuiteConfig,
  agents,
  rootAgent: [agent1Name]Agent, // Which agent starts?
  guardrails: [
    createModerationGuardrail('[Suite Display Name]'),
  ],
};

export default [suiteName]Suite;
```

### Registration in agentConfigs/index.ts

```typescript
// Add import at top
import [suiteName]Suite from './suites/[suite-name]';

// Add registration call (with other suites)
registerSuiteManually(suiteRegistry, [suiteName]Suite);
```

---

## Design Principles

### 1. Agent Specialization

**Principle:** Each agent should have ONE clear domain of expertise with minimal overlap.

**Good Example:**
- Feeding Coach: All nutrition, bottles, feeding schedules
- Sleep Specialist: All sleep patterns, naps, bedtime routines
- Health Monitor: All medical concerns, symptoms, doctor decisions

**Bad Example:**
- General Baby Helper: Does feeding, sleep, health, everything (too broad)
- Bottle Coach: Only bottle feeding (too narrow if breastfeeding also needed)

**Why:** Clear specialization makes handoffs obvious and prevents confusion.

### 2. Personality Distinctiveness

**Principle:** Each agent should feel like a different person with a unique voice.

**Techniques:**
- Different OpenAI voices (alloy vs sage vs shimmer)
- Different energy levels (calm vs upbeat vs professional)
- Different pacing (slow and spacious vs quick and actionable)
- Different formality (casual friend vs professional coach)
- Different emotional tone (warm and empathic vs neutral and factual)

**Example Contrast:**
```
Sleep Specialist: Slow, calm, meditative energy
  "Let's take a moment... notice your breath... gently..."

Development Tracker: Fast, enthusiastic, celebratory
  "That's amazing! Baby is doing great! Look at this progress!"
```

### 3. Empathy & Support

**Principle:** Voice agents are companions, not tools. Lead with empathy.

**Techniques:**
- Validate feelings: "That sounds really hard"
- Normalize struggles: "All parents feel this way sometimes"
- Celebrate wins: "You're doing a great job"
- Provide reassurance: "You've got this"
- Never judge or shame

**Bad Examples:**
- "You should have done X" (judgy)
- "That's not a big deal" (dismissive)
- "Just do Y" (unhelpful command)

**Good Examples:**
- "It's completely normal to feel overwhelmed when baby won't sleep"
- "You're learning, and every caregiver goes through this"
- "Let's figure this out together"

### 4. Safety First

**Principle:** Always prioritize user safety, especially in health, mental health, crisis domains.

**Requirements:**
- Clear "call a professional" criteria
- Never diagnose medical/mental health conditions
- Provide emergency contacts (911, crisis lines, etc.)
- Use disclaimers appropriately
- Err on side of caution

**Template:**
```
# Red Flags - Seek Professional Help
- [Specific symptom]: [Specific action]
- [Specific symptom]: [Specific action]

# Disclaimer
This is supportive guidance, not [medical/therapeutic] advice. 
Always consult with [qualified professional] for [domain] concerns.
```

### 5. Actionable Guidance

**Principle:** Users need concrete next steps, not vague advice.

**Bad:** "Try to calm the baby"
**Good:** "Try the 5 S's: Swaddle, Side position, Shush loudly, Swing gently, Suck (pacifier). Let's start with swaddling..."

**Techniques:**
- Specific techniques with steps
- Checklists and protocols
- Time-based recommendations ("Check again in 2 hours")
- Trackable metrics ("Log this in the Feeding Log")
- Small, doable actions

### 6. Graceful Handoffs

**Principle:** Transfers between agents should feel natural and helpful, not jarring.

**Handoff Script Pattern:**
```
1. Acknowledge current topic
2. Explain why other agent is better suited
3. Confirm user wants to transfer
4. Smooth transition phrase
```

**Example:**
```
"I hear you're concerned about baby's sleep patterns. Our Sleep 
Specialist knows all about nap schedules and helping babies sleep 
through the night. Would you like me to connect you with them? 
[User confirms] Great, transferring you now. Sleep Specialist, 
[user] needs help with..."
```

**Anti-patterns:**
- Abrupt transfers without explanation
- Refusing to help when you could
- Transferring too eagerly
- Not explaining who the new agent is

### 7. Workspace Integration

**Principle:** Agents should actively use workspace tabs, not just talk.

**Best Practices:**
- Reference workspace tabs by name: "Let me check your Feeding Log..."
- Update logs during conversation: "I'm adding this to your Health Journal"
- Encourage user tracking: "Make sure to log this in..."
- Use data to inform advice: "I see from your Sleep Schedule that..."

**Tool Usage Pattern:**
```typescript
// Read tab to inform response
const feedingLog = await workspaceTools.readTab("Feeding Log");
// Parse and use data
// ...
// Update tab with new info
await workspaceTools.appendToTab("Feeding Log", newRow);
```

### 8. Conversation State Management

**When to Use Structured States:**
- Therapeutic protocols (IFS, CBT, etc.)
- Multi-step assessments
- Onboarding flows
- Crisis protocols

**When to Use Freeform Conversation:**
- Coaching and advice giving
- Quick check-ins
- Logging and tracking
- General support

**Example Structured State:**
```typescript
{
  id: "1_greeting",
  description: "Welcome and orient user",
  instructions: [
    "Greet warmly",
    "Ask what brought them today",
    "Assess capacity (0-10 scale)"
  ],
  examples: [
    "Welcome! What brings you here today?",
    "On a scale of 0-10, how are you feeling right now?"
  ],
  transitions: [
    {
      next_step: "2_main_work",
      condition: "If capacity >= 5"
    },
    {
      next_step: "2_crisis_protocol",
      condition: "If capacity < 3"
    }
  ]
}
```

### 9. Session Length Awareness

**Principle:** Design agents for realistic session lengths.

**Short Sessions (5-15 min):**
- Quick check-ins
- Logging data
- Simple questions
- Micro-practices

**Medium Sessions (15-45 min):**
- Coaching conversations
- Problem-solving
- Learning new techniques
- Progress reviews

**Long Sessions (45-90 min):**
- Deep therapeutic work
- Comprehensive planning
- Complex problem-solving

**Design Accordingly:**
- Keep prompts concise for short sessions
- Build in natural stopping points
- Offer to continue or close
- Don't force completion of long protocols

### 10. Consistency & Continuity

**Principle:** Users should build relationship with agents over time.

**Techniques:**
- Reference past conversations: "Last time we talked about..."
- Track progress: "I see you've been logging consistently!"
- Remember context: Check workspace tabs for history
- Build on previous work: "Let's continue where we left off"
- Celebrate milestones: "You've been doing this for 2 weeks now!"

**Workspace Role:**
- Session Logs track conversation history
- Data logs show patterns over time
- Progress markers create continuity

---

## Example Suite Analyses

### Example 1: Baby Care Suite (Beginner, Mental-Health)

**Domain:** Temporary infant caregiving for inexperienced caregivers

**Core Problem:** "My sister asked me to watch her 6-month-old for 2 weeks. I've never cared for a baby and I'm nervous."

**User Profile:**
- Experience: Beginner (little to no infant care experience)
- Duration: Short-term (days to weeks)
- Context: Helping family/friends, not permanent parent
- Needs: Reassurance, practical guidance, tracking, emergency protocols

**Agent Portfolio (5 Agents):**

1. **Feeding Coach** 🍼
   - Voice: Sage (warm, nurturing)
   - Personality: Reassuring grandmother
   - Domain: All feeding - schedules, amounts, types, troubleshooting
   - Primary Tab: Feeding Log (CSV)
   - Handoffs: Sleep (if timing issues), Health (if refusal/vomiting), Calming (if fussy)

2. **Sleep Specialist** 😴
   - Voice: Alloy (calm, soothing)
   - Personality: Meditation teacher
   - Domain: Sleep patterns, nap schedules, bedtime routines
   - Primary Tab: Sleep Schedule (CSV)
   - Handoffs: Feeding (if hungry), Calming (if won't settle), Health (if unusual)

3. **Development Tracker** 📊
   - Voice: Shimmer (upbeat, enthusiastic)
   - Personality: Excited friend
   - Domain: Milestones, age-appropriate activities, play
   - Primary Tab: Milestones (Markdown)
   - Handoffs: Health (if delays), Calming (if overstimulated)

4. **Health Monitor** 🏥
   - Voice: Echo (professional, calm)
   - Personality: Nurse
   - Domain: Symptoms, temperatures, when to call doctor
   - Primary Tab: Health Journal (Markdown)
   - Handoffs: Feeding (routine questions), Calming (if just fussy, not sick)

5. **Calming Coach** 🤱
   - Voice: Verse (gentle, reassuring)
   - Personality: Compassionate therapist
   - Domain: Soothing techniques, reading cues, caregiver stress
   - Primary Tab: None (uses all tabs contextually)
   - Handoffs: Health (if medical concern), Feeding (if hunger), Sleep (if overtired)

**Workspace Strategy (6 Tabs):**

1. **Feeding Log** (CSV) - Time-series tracking
2. **Sleep Schedule** (CSV) - Pattern monitoring
3. **Daily Care Log** (CSV) - Diapers, baths, activities
4. **Health Journal** (Markdown) - Medical concerns, symptoms
5. **Milestones** (Markdown) - Developmental progress checklist
6. **Emergency Info** (Markdown) - Critical contacts and information

**Conversation Flow:**

```
Entry: Feeding Coach (most frequent need)
  ↓
User: "Baby won't eat"
  ↓
Feeding Coach: Rules out medical → If concerning → Health Monitor
                 If normal refusal → Provides strategies
  ↓
User: "She's crying a lot"
  ↓
Transfer to Calming Coach → Tries soothing techniques
  ↓
If still crying → Check Health Monitor → If okay → Back to Calming
  ↓
User: "When should she nap?"
  ↓
Calming Coach → Transfer to Sleep Specialist
  ↓
All flows can close from any agent with supportive farewell
```

**Success Metrics:**
- User feels confident caring for baby
- All needs tracked in workspace
- Appropriate handoffs to professionals when needed
- User returns for multiple sessions throughout care period

---

### Example 2: IFS Therapy Suite (Intermediate, Mental-Health)

**Domain:** Internal Family Systems parts work for emotional healing

**Core Problem:** "I keep getting overwhelmed by anxiety and I want to understand why and heal the root causes."

**User Profile:**
- Experience: Intermediate (some therapy or self-work background)
- Duration: Ongoing (regular practice over weeks/months)
- Context: Personal growth, trauma healing, emotional regulation
- Needs: Structured protocols, safety, deep work, integration

**Agent Portfolio (12 Agents in multiple tiers):**

**Core Agents (Session Types):**

1. **Grounding & Consent** - Establishes safety container, capacity check, orientation
   - Voice: Alloy (steady, grounding)
   - Always starts sessions
   - Checks capacity (0-10), sets stop-word, grounds somatically

2. **Standard Parts Session** - 6F protocol (Find, Focus, Flesh Out, Feel Toward, Befriend, Fears)
   - Voice: Echo (curious, warm therapist)
   - Main session type
   - Meets parts, builds relationships

3. **Unblending** - Creates space between Self and activated parts
   - Voice: Sage (spacious, calming)
   - Called when user is blended (fused with part)
   - Restores Self energy

4. **Protector Negotiation** - Builds trust with protective parts, gets permission
   - Voice: Verse (diplomatic, respectful)
   - Required before exile work
   - Honors "no"

5. **Exile Witnessing** - Compassionate presence with young, hurt parts
   - Voice: Shimmer (tender, soft)
   - ONLY with protector permission
   - Slow, attuned, witnessing

6. **Polarization Mediation** - Resolves internal conflicts between parts
   - Voice: Echo (balanced, fair mediator)
   - When two parts are in conflict
   - Finds common ground

7. **Burden Release** - Ritual for releasing beliefs/emotions parts carry
   - Voice: Sage (ceremonial, reverent)
   - After witnessing is complete
   - Uses imaginal rituals

8. **Integration & Closing** - Closes sessions, grounds, sets next steps
   - Voice: Alloy (warm, completing)
   - Always ends sessions
   - Creates containment

**Applied Agents (Specific Situations):**

9. **Urge Protocol** - Surfing addictive urges/compulsions in real-time
10. **Flash SOS** - Crisis de-escalation for overwhelm/panic
11. **Micro Practice** - Daily 5-10 minute check-ins with parts
12. **Values & Intent** - Self-led planning with protector buy-in

**Workspace Strategy (9 Tabs):**

1. **Parts Map** (Markdown) - Catalog of all parts (managers, firefighters, exiles)
2. **Session Log** (CSV) - Track sessions, insights, progress
3. **Burdens Released** (Markdown) - Document healing rituals
4. **Protector Contracts** (Markdown) - Agreements for deeper work
5. **Polarization Work** (Markdown) - Conflicts and resolutions
6. **Daily Micro-Practice Log** (CSV) - Brief daily check-ins
7. **Urge Tracking** (CSV) - Pattern analysis for firefighters
8. **Safety Protocol** (Markdown) - Stop words, crisis contacts
9. **Self-Led Intentions** (Markdown) - Goals with protector input

**Conversation Flow:**

```
Entry: Grounding & Consent (ALWAYS)
  ↓
Capacity Check:
  - If < 4 → Resource or end gently
  - If 4-6 → Light work (micro-practice, unblending)
  - If 7+ → Full session possible
  ↓
User chooses session type:
  - Standard Parts Session → Meet protectors/exiles
  - Unblending → Reduce blending
  - Urge → Real-time firefighter work
  - Polarization → Resolve conflict
  - SOS → Crisis de-escalation
  ↓
During session: May handoff to other agents based on needs
  - Blended → Unblending
  - Protector blocks → Negotiation
  - Exile emerges → Witnessing (with permission)
  ↓
Exit: Integration & Closing (ALWAYS)
  - Thank parts
  - Ground in present
  - One small next step
  - Update Session Log
```

**Safety Architecture:**

- **Stop word:** "pause" - immediately stops session
- **Capacity gating:** Low capacity → no deep work
- **Protector permission:** Never bypass protective parts
- **Crisis resources:** 988, therapist contact
- **Disclaimer:** "Supportive guidance, not therapy"

**Success Metrics:**
- User builds relationship with parts over time
- Parts Map grows and evolves
- Burdens released and logged
- User feels more Self-led
- Capacity for depth increases with practice

---

## Conclusion

This protocol provides a complete framework for designing sophisticated, empathetic, and effective voice agent suites. By following this structure:

1. **Plan thoroughly** before coding (domain analysis, agent design, workspace strategy)
2. **Design for personality** (each agent feels unique and human)
3. **Build for safety** (appropriate boundaries and escalation)
4. **Test comprehensively** (functionality, handoffs, edge cases)
5. **Iterate based on use** (refine tone, improve flows, enhance UX)

**Key Principles:**
- **Clarity:** Each agent has ONE clear role
- **Empathy:** Lead with support and validation
- **Safety:** Always prioritize user wellbeing
- **Actionability:** Provide concrete, specific guidance
- **Continuity:** Build relationship over time through workspace tracking

**Next Steps:**
1. Choose a domain you want to support
2. Complete the Pre-Planning Phase
3. Fill out all design templates
4. Review with stakeholders
5. Implement following the Implementation Checklist
6. Test thoroughly
7. Deploy and gather user feedback
8. Iterate

---

**Version History:**
- v1.0 (2025-10-20): Initial comprehensive protocol

**Maintained by:** Behavior Health Voice Agent Team  
**Questions?** See existing suites in `/src/app/agentConfigs/suites/` for working examples



