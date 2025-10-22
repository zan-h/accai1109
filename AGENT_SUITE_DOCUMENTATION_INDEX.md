# Agent Suite Documentation Index
## Complete Guide to Creating Voice Agent Suites

**Last Updated:** October 20, 2025

---

## 📚 Documentation Overview

This repository contains comprehensive documentation for creating sophisticated, empathetic voice agent suites using the OpenAI Realtime API and our custom orchestration framework.

### Three Core Documents

1. **[AGENT_SUITE_CREATION_PROTOCOL.md](./AGENT_SUITE_CREATION_PROTOCOL.md)** ⭐ **START HERE**
   - **Purpose:** Comprehensive guide with all context, theory, and best practices
   - **Length:** ~20,000 words
   - **Best For:** 
     - Understanding the system architecture deeply
     - Learning design principles and patterns
     - Seeing detailed examples and analyses
     - First-time suite creators
   - **Contents:**
     - Architecture overview
     - Complete design templates
     - Code structure reference
     - Design principles
     - Example suite analyses (Baby Care, IFS Therapy)
     - Full implementation checklist

2. **[AGENT_SUITE_QUICK_TEMPLATE.md](./AGENT_SUITE_QUICK_TEMPLATE.md)** ⚡ **FOR RAPID CREATION**
   - **Purpose:** Condensed, fillable template for fast suite design
   - **Length:** ~3,000 words
   - **Best For:**
     - Quick suite planning
     - Experienced creators who know the system
     - Rapid prototyping
     - Team workshopping
   - **Contents:**
     - Fillable design sections
     - Code templates
     - Quick reference checklist
     - Common pitfalls

3. **[CREATING_NEW_SUITES.md](./14-voice-agents/realtime-workspace-agents/CREATING_NEW_SUITES.md)** 📖 **WORKING EXAMPLE**
   - **Purpose:** Step-by-step walkthrough of creating Baby Care Suite
   - **Length:** ~6,000 words
   - **Best For:**
     - Learning by example
     - Following along with real implementation
     - Understanding file structure
     - Seeing working code
   - **Contents:**
     - Baby Care Suite case study
     - Phase-by-phase implementation
     - Complete code examples
     - Testing procedures

---

## 🎯 Quick Start Guide

### If You're New to Agent Suites

**Follow this path:**

1. **Read:** Start with [AGENT_SUITE_CREATION_PROTOCOL.md](./AGENT_SUITE_CREATION_PROTOCOL.md)
   - Read sections 1-2: Architecture & Pre-Planning (30 min)
   - Skim section 9: Example Suite Analyses (15 min)
   - Bookmark section 8: Design Principles for reference

2. **Study:** Review [CREATING_NEW_SUITES.md](./14-voice-agents/realtime-workspace-agents/CREATING_NEW_SUITES.md)
   - Follow the Baby Care Suite example end-to-end (45 min)
   - Note the file structure and code patterns

3. **Explore:** Check existing suites in the codebase
   ```bash
   cd 14-voice-agents/realtime-workspace-agents/src/app/agentConfigs/suites/
   # Examine: baby-care/, ifs-therapy/, energy-focus/, joe-hudson/
   ```

4. **Design:** Use [AGENT_SUITE_QUICK_TEMPLATE.md](./AGENT_SUITE_QUICK_TEMPLATE.md)
   - Fill in all sections completely before coding (2-4 hours)
   - Get feedback from team

5. **Implement:** Follow Implementation Checklist in PROTOCOL doc
   - Create file structure
   - Write code using templates
   - Test thoroughly

### If You're Experienced

**Fast track:**

1. **Use:** [AGENT_SUITE_QUICK_TEMPLATE.md](./AGENT_SUITE_QUICK_TEMPLATE.md) as your design doc
2. **Reference:** Code templates in section 7 of PROTOCOL doc
3. **Copy:** Existing suite structure from `/suites/` folder
4. **Implement:** Follow your established patterns
5. **Review:** Design Principles checklist before deploying

---

## 📋 Key Concepts

### Agent Suite Architecture

```
Suite
├── Configuration (metadata, tags, category)
├── Agents (3-5 specialized voice agents)
│   ├── Each with unique personality & role
│   └── Connected via handoff logic
├── Workspace (3-9 persistent tabs)
│   ├── CSV logs (time-series tracking)
│   └── Markdown docs (reference, checklists)
├── Tools (workspace manipulation, computation)
└── Guardrails (safety, moderation)
```

### Design Philosophy

1. **Specialization:** Each agent = ONE clear domain
2. **Personality:** Each agent = Distinct voice and character
3. **Empathy:** Lead with validation and support
4. **Safety:** Clear boundaries and escalation
5. **Action:** Concrete, specific guidance
6. **Continuity:** Build relationships over time

### Technology Stack

- **Framework:** OpenAI Realtime API
- **Voices:** OpenAI TTS (alloy, echo, sage, shimmer, verse)
- **Workspace:** Multi-tab UI (Markdown/CSV)
- **Storage:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **Frontend:** Next.js + React + TypeScript

---

## 🗂️ File Structure

```
src/app/agentConfigs/
├── types.ts                    # TypeScript definitions
├── index.ts                    # Suite registry
├── shared/                     # Shared resources
│   ├── tools/                  # Workspace tools, computation, web
│   ├── guardrails/             # Moderation, safety
│   └── prompts/                # Reusable prompt fragments
└── suites/                     # Agent suites
    ├── baby-care/              # Example: Baby Care Companion
    │   ├── suite.config.ts     # Metadata & workspace templates
    │   ├── prompts.ts          # Agent system prompts
    │   ├── index.ts            # Suite export & handoff wiring
    │   └── agents/             # Individual agent files
    │       ├── feedingCoach.ts
    │       ├── sleepSpecialist.ts
    │       └── ...
    ├── ifs-therapy/            # Example: IFS Therapy Companion
    ├── energy-focus/           # Example: Energy & Focus Suite
    └── joe-hudson/             # Example: Joe Hudson Suite
```

---

## 🎨 Design Process

### Phase 1: Discovery (1-2 hours)

**Questions to Answer:**
- What problem does this suite solve?
- Who is the target user?
- What are the 3-5 sub-domains?
- What data needs tracking?
- What's the typical user journey?

**Outputs:**
- Problem statement
- User profile
- Domain breakdown
- Journey map

### Phase 2: Agent Design (2-4 hours)

**For Each Agent:**
- Define singular focus and expertise
- Design personality (voice, tone, energy)
- Specify conversation patterns
- Identify handoff triggers
- Document safety boundaries

**Outputs:**
- 3-5 complete Agent Specification Documents
- Personality profiles
- Conversation architectures

### Phase 3: Workspace Design (1-2 hours)

**For Each Tab:**
- Choose type (CSV or Markdown)
- Design structure (columns or sections)
- Create pre-populated examples
- Assign primary agent ownership

**Outputs:**
- 3-9 workspace template designs
- Example content for each tab

### Phase 4: Flow Mapping (1 hour)

**Diagrams:**
- Entry point (which agent starts?)
- Primary flow (most common path)
- Alternative flows (branches)
- Handoff matrix (agent connections)

**Outputs:**
- Conversation flow diagrams
- Handoff trigger specifications

### Phase 5: Implementation (4-8 hours)

**Code Creation:**
- suite.config.ts
- prompts.ts
- agents/*.ts
- index.ts
- Registration

**Outputs:**
- Working suite code
- All files properly wired

### Phase 6: Testing (2-4 hours)

**Test Categories:**
- Build and deployment
- Suite selection UI
- Workspace initialization
- Agent functionality
- Handoff logic
- Edge cases and safety

**Outputs:**
- Test report
- Bug list
- Refinement tasks

### Phase 7: Refinement (2-4 hours)

**Polish:**
- Personality tuning
- Prompt adjustments
- Workspace improvements
- Documentation

**Outputs:**
- Production-ready suite
- README with usage guide

---

## 📊 Example Suites

### Simple Suite: Energy & Focus

- **Agents:** 3
- **Complexity:** Low
- **Use Case:** Quick productivity sessions
- **Session Length:** 15-30 minutes
- **Best For:** Beginners learning the pattern

### Medium Suite: Baby Care Companion

- **Agents:** 5
- **Complexity:** Medium
- **Use Case:** Temporary infant caregiving
- **Session Length:** 5-45 minutes (variable)
- **Best For:** Understanding domain specialization

### Complex Suite: IFS Therapy Companion

- **Agents:** 12 (tiered)
- **Complexity:** High
- **Use Case:** Deep therapeutic work
- **Session Length:** 5-90 minutes (multiple types)
- **Best For:** Advanced patterns, structured protocols

---

## 🛠️ Implementation Checklist

### Pre-Implementation

- [ ] Complete design using Quick Template
- [ ] Review with team/stakeholders
- [ ] Check for domain overlap with existing suites
- [ ] Verify all safety boundaries documented

### File Creation

```bash
cd src/app/agentConfigs/suites
mkdir -p [suite-name]/agents
touch [suite-name]/suite.config.ts
touch [suite-name]/prompts.ts
touch [suite-name]/index.ts
touch [suite-name]/agents/[agent1].ts
# ... etc
```

### Code Implementation

- [ ] suite.config.ts with all metadata and templates
- [ ] prompts.ts with system prompts for each agent
- [ ] agents/*.ts files (one per agent)
- [ ] index.ts with handoff wiring
- [ ] Registration in agentConfigs/index.ts

### Testing

- [ ] `npm run build` succeeds
- [ ] Suite visible in selector
- [ ] Workspace tabs initialize
- [ ] Each agent connects and responds
- [ ] Handoffs work smoothly
- [ ] Workspace read/write functions
- [ ] Safety triggers respond correctly
- [ ] Personalities feel distinct

### Polish

- [ ] Adjust prompts for tone
- [ ] Refine handoff transitions
- [ ] Improve workspace templates
- [ ] Add README.md

---

## ⚠️ Common Pitfalls

### Design Phase

❌ **Too many agents** → Causes confusion  
✅ **Keep to 3-5 agents** with clear roles

❌ **Overlapping responsibilities** → Unclear handoffs  
✅ **One domain per agent** with distinct boundaries

❌ **Generic personalities** → All agents sound same  
✅ **Unique voice for each** agent (tone, pacing, energy)

### Implementation Phase

❌ **Forgetting to register suite** → Won't appear in app  
✅ **Add to agentConfigs/index.ts** after creating suite

❌ **Empty handoffs array** → Can't transfer  
✅ **Wire in index.ts** after agent creation

❌ **No example data in workspace** → User confusion  
✅ **Pre-populate templates** with realistic examples

### Testing Phase

❌ **Only testing happy path** → Miss edge cases  
✅ **Test all handoffs** and edge scenarios

❌ **Skipping safety testing** → Risk to users  
✅ **Verify all red flags** trigger appropriate responses

---

## 🎓 Learning Resources

### In This Repository

1. **Documentation** (this folder)
   - AGENT_SUITE_CREATION_PROTOCOL.md
   - AGENT_SUITE_QUICK_TEMPLATE.md
   - CREATING_NEW_SUITES.md

2. **Example Suites** (`src/app/agentConfigs/suites/`)
   - baby-care/ - Medium complexity, 5 agents
   - ifs-therapy/ - High complexity, 12 agents
   - energy-focus/ - Simple, 3 agents
   - joe-hudson/ - Custom patterns

3. **Type Definitions** (`src/app/agentConfigs/types.ts`)
   - SuiteConfig interface
   - AgentSuite interface
   - WorkspaceTemplate interface

### External Resources

- **OpenAI Realtime API:** [OpenAI Docs](https://platform.openai.com/docs/guides/realtime)
- **IFS Therapy:** (for understanding therapeutic protocols)
- **Voice UX Design:** Best practices for conversational AI
- **Personality Design:** Character and voice design patterns

---

## 🤝 Contributing

### Creating a New Suite

1. **Design first** using AGENT_SUITE_QUICK_TEMPLATE.md
2. **Get review** from team before coding
3. **Implement** following PROTOCOL doc
4. **Test thoroughly** using checklist
5. **Submit PR** with:
   - Suite code
   - README.md in suite folder
   - Test results
   - Usage examples

### Improving Documentation

- Found an error? Submit issue or PR
- Missing a pattern? Document it
- Better example? Add it
- Clearer explanation? Update it

---

## 📞 Support

### Questions?

1. **Read the docs** (start with PROTOCOL)
2. **Check existing suites** for patterns
3. **Ask the team** in Slack/Discord
4. **Open an issue** for bugs or unclear docs

### Feedback

We want these docs to be excellent. Please share:
- What was confusing?
- What was helpful?
- What's missing?
- What examples would help?

---

## 🗺️ Roadmap

### Planned Documentation

- [ ] Video walkthrough of suite creation
- [ ] Interactive tutorial
- [ ] More domain-specific examples
- [ ] Testing framework guide
- [ ] Performance optimization guide
- [ ] Voice personality guide

### Planned Features

- [ ] Suite templates for common domains
- [ ] Agent personality presets
- [ ] Workspace template library
- [ ] Automated testing tools
- [ ] Suite analytics dashboard

---

## 📝 Version History

- **v1.0** (2025-10-20): Initial documentation release
  - AGENT_SUITE_CREATION_PROTOCOL.md
  - AGENT_SUITE_QUICK_TEMPLATE.md
  - AGENT_SUITE_DOCUMENTATION_INDEX.md (this file)

---

## 📄 Document Quick Reference

| Document | When to Use | Time Investment |
|----------|-------------|-----------------|
| **PROTOCOL.md** | Learning system deeply, first suite | 2-3 hours read |
| **QUICK_TEMPLATE.md** | Designing any suite, rapid prototyping | 30 min read, 2-4 hours fill |
| **CREATING_NEW_SUITES.md** | Following example implementation | 1 hour read/follow |
| **This Index** | Navigation, quick reference | 10 min read |

---

**Maintained by:** Behavior Health Voice Agent Team  
**Last Updated:** October 20, 2025  
**Questions?** Open an issue or ask in team channels



