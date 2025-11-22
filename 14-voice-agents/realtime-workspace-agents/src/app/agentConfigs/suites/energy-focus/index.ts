// src/app/agentConfigs/suites/energy-focus/index.ts

import { AgentSuite } from '@/app/agentConfigs/types';
import { energyFocusSuiteConfig } from './suite.config';
import { groundingGuideAgent } from './agents/energyCoach';
import { capacityMapperAgent } from './agents/taskStrategist';
import { launchPartnerAgent } from './agents/bodyDoubling';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up handoffs - linear flow: Grounding → Capacity → Launch
(groundingGuideAgent.handoffs as any).push(capacityMapperAgent);
(capacityMapperAgent.handoffs as any).push(launchPartnerAgent);
(launchPartnerAgent.handoffs as any).push(groundingGuideAgent); // Can return to start

// Export suite
const energyAlignedWorkSuite: AgentSuite = {
  ...energyFocusSuiteConfig,
  agents: [groundingGuideAgent, capacityMapperAgent, launchPartnerAgent],
  rootAgent: groundingGuideAgent,
  guardrails: [
    createModerationGuardrail('Energy Aligned Work Suite'),
  ],
};

export default energyAlignedWorkSuite;



