import { AgentSuite } from '@/app/agentConfigs/types';
import { deepWorkForgeSuiteConfig } from './suite.config';
import { anchorAgent } from './agents/anchorAgent';
import { guideAgent } from './agents/guideAgent';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up handoffs - Anchor sets up, then hands to Guide
(anchorAgent.handoffs as any).push(guideAgent);
// Guide can return to Anchor if user wants to start a new session
(guideAgent.handoffs as any).push(anchorAgent);

// Export suite
const deepFocusSuite: AgentSuite = {
  ...deepWorkForgeSuiteConfig,
  agents: [anchorAgent, guideAgent],
  rootAgent: anchorAgent,
  guardrails: [
    createModerationGuardrail('Deep Focus Suite'),
  ],
};

export default deepFocusSuite;

