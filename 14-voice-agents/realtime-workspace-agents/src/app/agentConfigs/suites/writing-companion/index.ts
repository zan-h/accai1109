// src/app/agentConfigs/suites/writing-companion/index.ts

import { ideationAgent } from './agents/ideation';
import { freeWriterAgent } from './agents/freeWriter';
import { substantiveEditorAgent } from './agents/substantiveEditor';
import { lineEditorAgent } from './agents/lineEditor';
import { copyEditorAgent } from './agents/copyEditor';
import { proofreaderAgent } from './agents/proofreader';
import { writingCompanionSuite } from './suite.config';

// Wire handoffs between agents
// Each agent can hand off to relevant agents in the writing workflow

// Ideation can hand off to free-writing or structural editing
(ideationAgent.handoffs as any).push(freeWriterAgent, substantiveEditorAgent);

// Free-writer can hand off to ideation (explore more) or editors (polish what emerged)
(freeWriterAgent.handoffs as any).push(ideationAgent, substantiveEditorAgent, lineEditorAgent);

// Substantive editor can hand off to line editor (next stage) or back to ideation/free-writing (major rework)
(substantiveEditorAgent.handoffs as any).push(lineEditorAgent, ideationAgent, freeWriterAgent);

// Line editor can hand off to copyeditor (next stage) or back to substantive editor (structural issues found)
(lineEditorAgent.handoffs as any).push(copyEditorAgent, substantiveEditorAgent);

// Copyeditor can hand off to proofreader (final stage) or back to line editor (style issues found)
(copyEditorAgent.handoffs as any).push(proofreaderAgent, lineEditorAgent);

// Proofreader can hand off back to any editor if issues found, or declare done
(proofreaderAgent.handoffs as any).push(copyEditorAgent, lineEditorAgent, substantiveEditorAgent);

export const writingCompanionAgents = [
  ideationAgent,
  freeWriterAgent,
  substantiveEditorAgent,
  lineEditorAgent,
  copyEditorAgent,
  proofreaderAgent,
];

export { writingCompanionSuite };

