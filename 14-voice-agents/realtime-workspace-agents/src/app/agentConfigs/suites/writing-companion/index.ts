// src/app/agentConfigs/suites/writing-companion/index.ts

import { AgentSuite } from '@/app/agentConfigs/types';
import { writingCompanionSuite } from './suite.config';
import { ideationAgent } from './agents/ideation';
import { freeWriterAgent } from './agents/freeWriter';
import { researchAssistantAgent } from './agents/researchAssistant';
import { substantiveEditorAgent } from './agents/substantiveEditor';
import { lineEditorAgent } from './agents/lineEditor';
import { copyEditorAgent } from './agents/copyEditor';
import { proofreaderAgent } from './agents/proofreader';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire handoffs between agents
// Each agent can hand off to relevant agents in the writing workflow

// Ideation can hand off to free-writing, research, or structural editing
(ideationAgent.handoffs as any).push(freeWriterAgent, researchAssistantAgent, substantiveEditorAgent);

// Free-writer can hand off to ideation (explore more), research (verify ideas), or editors (polish what emerged)
(freeWriterAgent.handoffs as any).push(ideationAgent, researchAssistantAgent, substantiveEditorAgent, lineEditorAgent);

// Research assistant can hand off to any agent based on what writer needs
(researchAssistantAgent.handoffs as any).push(ideationAgent, freeWriterAgent, substantiveEditorAgent, lineEditorAgent, copyEditorAgent);

// Substantive editor can hand off to research (verify claims), line editor (next stage), or back to ideation/free-writing (major rework)
(substantiveEditorAgent.handoffs as any).push(researchAssistantAgent, lineEditorAgent, ideationAgent, freeWriterAgent);

// Line editor can hand off to research (fact-check), copyeditor (next stage), or back to substantive editor (structural issues found)
(lineEditorAgent.handoffs as any).push(researchAssistantAgent, copyEditorAgent, substantiveEditorAgent);

// Copyeditor can hand off to research (verify facts), proofreader (final stage), or back to line editor (style issues found)
(copyEditorAgent.handoffs as any).push(researchAssistantAgent, proofreaderAgent, lineEditorAgent);

// Proofreader can hand off to research (last-minute fact check) or back to any editor if issues found
(proofreaderAgent.handoffs as any).push(researchAssistantAgent, copyEditorAgent, lineEditorAgent, substantiveEditorAgent);

// All agents
const agents = [
  ideationAgent,
  freeWriterAgent,
  researchAssistantAgent,
  substantiveEditorAgent,
  lineEditorAgent,
  copyEditorAgent,
  proofreaderAgent,
];

// Export suite
const writingCompanionSuiteComplete: AgentSuite = {
  ...writingCompanionSuite,
  agents,
  rootAgent: ideationAgent, // Start with ideation by default
  guardrails: [
    createModerationGuardrail('Writing Companion'),
  ],
};

export default writingCompanionSuiteComplete;

