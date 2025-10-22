# Agent Suite Quick-Start Template
## Rapid Design & Implementation Guide

**Use this template to quickly design a new agent suite. Fill in all sections before coding.**

---

## 1. Suite Overview

### Basic Info
```yaml
Suite ID: [kebab-case-name]
Suite Name: [Display Name]
Icon: [Emoji]
Category: [productivity|mental-health|planning|coaching|learning|creativity]
User Level: [beginner|intermediate|advanced]
Session Length: [X minutes]
```

### One-Liner
**[10-15 words describing what this suite does and for whom]**

### Full Description (2-3 sentences)
[Explain the problem, who it's for, and what value it provides]

### Tags (5-10 keywords)
- 
- 
- 
- 
- 

### Suggested Use Cases (3-5)
1. 
2. 
3. 
4. 
5. 

---

## 2. Agent Portfolio

**Design 3-5 agents with clear, non-overlapping roles.**

### Agent 1: [Agent Name]

| Attribute | Value |
|-----------|-------|
| **Programmatic Name** | `[camelCaseName]` |
| **Display Title** | [User-facing name] |
| **Voice** | [alloy, echo, sage, shimmer, verse] |
| **Personality** | [3-5 adjectives] |
| **Role** | [One sentence] |
| **Primary Domain** | [What this agent knows] |
| **Primary Workspace Tab** | [Main tab used] |
| **Speaking Style** | [Formal/casual, fast/slow, warm/neutral] |
| **Handoff Triggers** | → Agent X if [trigger]<br>→ Agent Y if [trigger] |

**Key Conversation Patterns:**
1. **[Pattern Name]**: [When and how used]
2. **[Pattern Name]**: [When and how used]

**System Prompt Outline:**
```
You are [role description with analogy].

Your Role:
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

Approach:
- [Guideline 1]
- [Guideline 2]

When to Hand Off:
- [Trigger] → [Target Agent]
- [Trigger] → [Target Agent]

Safety/Boundaries:
- [Red flag 1]: [Action]
- [Red flag 2]: [Action]
```

---

### Agent 2: [Agent Name]

[Repeat same structure as Agent 1]

---

### Agent 3: [Agent Name]

[Repeat same structure]

---

### Agent 4 (if needed): [Agent Name]

[Repeat same structure]

---

### Agent 5 (if needed): [Agent Name]

[Repeat same structure]

---

## 3. Workspace Design

**Design 3-9 tabs (mix of CSV logs and Markdown docs).**

### Tab 1: [Tab Name]

| Attribute | Value |
|-----------|-------|
| **Type** | CSV or Markdown |
| **Purpose** | [What does this track/store?] |
| **Primary Agent** | [Which agent uses this most?] |
| **Update Frequency** | [Every session / Daily / As needed / Reference only] |
| **User Editable** | Yes / No |

**Template Structure:**

**If CSV:**
```csv
Column1|Column2|Column3|Notes
[Example row]
[Example row]
```

**If Markdown:**
```markdown
# [Title]

## Section 1
[Content structure]

## Section 2
[Content structure]
```

---

### Tab 2: [Tab Name]

[Repeat structure]

---

### Tab 3: [Tab Name]

[Repeat structure]

---

[Continue for all tabs...]

---

## 4. Conversation Flow Map

**Sketch the typical user journey through agents.**

### Entry Point
**Starting Agent:** [Agent Name]  
**Why:** [Reason this agent is first]

### Primary Flow
```
[Starting Agent]
  ↓
[What happens typically]
  ↓
[Next agent or action]
  ↓
[Outcome]
```

### Alternative Flows

**Flow 1: [Scenario]**
```
[Agent] → [Condition] → [Target Agent] → [Outcome]
```

**Flow 2: [Scenario]**
```
[Agent] → [Condition] → [Target Agent] → [Outcome]
```

### Handoff Matrix

|           | Agent 1 | Agent 2 | Agent 3 | Agent 4 | Agent 5 |
|-----------|---------|---------|---------|---------|---------|
| **Agent 1** | -       | ✓/✗     | ✓/✗     | ✓/✗     | ✓/✗     |
| **Agent 2** | ✓/✗     | -       | ✓/✗     | ✓/✗     | ✓/✗     |
| **Agent 3** | ✓/✗     | ✓/✗     | -       | ✓/✗     | ✓/✗     |
| **Agent 4** | ✓/✗     | ✓/✗     | ✓/✗     | -       | ✓/✗     |
| **Agent 5** | ✓/✗     | ✓/✗     | ✓/✗     | ✓/✗     | -       |

---

## 5. Safety & Boundaries

### Red Flags (Require Professional Help)

**Situation 1:** [Description]  
**Agent Response:** [What to say/do]  
**Escalation:** [Who to refer to - professional, emergency, etc.]

**Situation 2:** [Description]  
**Agent Response:** [What to say/do]  
**Escalation:** [Who to refer to]

[Continue for all critical situations...]

### Out of Scope Topics

| Topic | Agent Response Template |
|-------|-------------------------|
| [Topic] | "I'm not equipped for [X], but here's what you can do..." |
| [Topic] | [Response template] |

### Required Disclaimers
```
[Disclaimer text to include in prompts or initial messages]
```

---

## 6. Implementation Checklist

**Complete before coding:**

- [ ] All agents defined with clear roles
- [ ] All workspace tabs designed with example content
- [ ] Conversation flows mapped
- [ ] Handoff triggers specified
- [ ] Safety boundaries documented
- [ ] Personality profiles complete for each agent

**File creation:**

```bash
cd src/app/agentConfigs/suites
mkdir -p [suite-name]/agents

touch [suite-name]/suite.config.ts
touch [suite-name]/prompts.ts
touch [suite-name]/index.ts
touch [suite-name]/agents/[agent1].ts
touch [suite-name]/agents/[agent2].ts
touch [suite-name]/agents/[agent3].ts
# ... etc
```

**Code implementation:**

- [ ] suite.config.ts - Suite metadata & workspace templates
- [ ] prompts.ts - System prompts for all agents
- [ ] agents/[name].ts - Agent definitions (one per agent)
- [ ] index.ts - Wire handoffs and export suite
- [ ] Register suite in agentConfigs/index.ts

**Testing:**

- [ ] Build succeeds (`npm run build`)
- [ ] Suite appears in selector
- [ ] All tabs create correctly
- [ ] Each agent connects and responds
- [ ] Handoffs work between all connected agents
- [ ] Workspace tools work (read/write tabs)
- [ ] Safety triggers respond appropriately
- [ ] Voice/personality feels right for each agent

**Refinement:**

- [ ] Adjust prompts for tone/personality
- [ ] Fix any handoff awkwardness
- [ ] Clean up workspace templates
- [ ] Add README.md with usage notes

---

## 7. Quick Reference: Code Templates

### suite.config.ts
```typescript
import { SuiteConfig } from '@/app/agentConfigs/types';

export const [name]SuiteConfig: SuiteConfig = {
  id: '[suite-id]',
  name: '[Display Name]',
  description: '[Description]',
  icon: '[Emoji]',
  category: '[category]',
  tags: ['tag1', 'tag2'],
  suggestedUseCases: [
    'Use case 1',
    'Use case 2',
  ],
  userLevel: '[level]',
  estimatedSessionLength: [number],
  workspaceTemplates: [
    {
      name: '[Tab Name]',
      type: 'csv',
      content: `Column1|Column2|Column3
Example|Data|Here`,
      description: '[Tab purpose]',
    },
    // ... more templates
  ],
  initialContext: {
    // Optional config
  },
};
```

### prompts.ts
```typescript
export const [agent]Prompt = `
You are [description].

# Your Role
- [Responsibility]

# Approach
- [Guideline]

# When to Hand Off
- [Trigger] → Transfer to [agent]
`;
```

### agents/[name].ts
```typescript
import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { [agent]Prompt } from '../prompts';

export const [agent]Agent = new RealtimeAgent({
  name: '[agentName]',
  voice: '[voice]',
  instructions: [agent]Prompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});
```

### index.ts
```typescript
import { AgentSuite } from '@/app/agentConfigs/types';
import { [suite]SuiteConfig } from './suite.config';
import { [agent1]Agent } from './agents/[agent1]';
// ... import all agents
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

const agents = [[agent1]Agent, [agent2]Agent, /* ... */];

// Wire handoffs (all-to-all)
agents.forEach(agent => {
  const otherAgents = agents.filter(a => a !== agent);
  (agent.handoffs as any).push(...otherAgents);
});

const [suite]Suite: AgentSuite = {
  ...[suite]SuiteConfig,
  agents,
  rootAgent: [agent1]Agent,
  guardrails: [createModerationGuardrail('[Suite Name]')],
};

export default [suite]Suite;
```

---

## 8. Design Principles Checklist

**Before submitting design, verify:**

- [ ] **Clear Specialization** - Each agent has ONE distinct domain
- [ ] **Personality Distinctiveness** - Each agent feels like a different person
- [ ] **Empathy First** - Agents lead with validation and support
- [ ] **Safety Prioritized** - Clear escalation for medical/crisis/legal topics
- [ ] **Actionable Guidance** - Specific steps, not vague advice
- [ ] **Graceful Handoffs** - Transfers feel natural and helpful
- [ ] **Workspace Integration** - Agents actively use tabs, not just talk
- [ ] **Appropriate Session Length** - Design matches expected usage
- [ ] **Continuity Built In** - Agents reference past work and build relationships
- [ ] **Realistic & Sustainable** - Users can actually adopt this into their lives

---

## 9. Common Pitfalls to Avoid

❌ **Too many agents** (5+ gets confusing)  
✅ Keep to 3-5 agents with clear roles

❌ **Overlapping agent responsibilities**  
✅ Each agent has ONE distinct domain

❌ **No clear handoff triggers**  
✅ Specify exact keywords/situations that trigger transfers

❌ **Empty or useless workspace templates**  
✅ Every tab should have clear purpose and examples

❌ **Forgetting to register suite**  
✅ Add to agentConfigs/index.ts

❌ **Not testing handoffs**  
✅ Test every possible agent-to-agent path

❌ **Prompts that are too long**  
✅ Keep under 500 words; focus on core guidance

❌ **Missing safety disclaimers**  
✅ Include for medical, legal, mental health domains

❌ **Generic personalities**  
✅ Each agent should feel unique (voice, tone, energy)

❌ **Vague guidance**  
✅ Provide specific, actionable next steps

---

## 10. Next Steps

1. **Complete this template** (fill in all sections above)
2. **Review with team** (get feedback before coding)
3. **Create file structure** (use bash commands in checklist)
4. **Implement code** (use templates in section 7)
5. **Test thoroughly** (use testing checklist)
6. **Iterate** (refine based on actual usage)
7. **Document** (add README.md with usage examples)
8. **Deploy** (merge to main after QA)

---

**Template Version:** 1.0 (2025-10-20)  
**Companion Document:** See `AGENT_SUITE_CREATION_PROTOCOL.md` for comprehensive guide  
**Questions?** Check existing suites in `/src/app/agentConfigs/suites/` for examples



