// src/app/agentConfigs/suites/satisfying-work/index.ts

import { AgentSuite } from '@/app/agentConfigs/types';
import { satisfyingWorkSuiteConfig } from './suite.config';
import { embodiedWorkGuideAgent } from './agents/embodiedWorkGuide';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Single agent suite - no handoffs needed

// Export suite
const satisfyingWorkSuite: AgentSuite = {
  ...satisfyingWorkSuiteConfig,
  agents: [embodiedWorkGuideAgent],
  rootAgent: embodiedWorkGuideAgent,
  guardrails: [
    createModerationGuardrail('Satisfying Work Suite'),
  ],
};

export default satisfyingWorkSuite;

