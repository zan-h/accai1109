// src/app/agentConfigs/suites/energy-focus/index.ts

import { AgentSuite } from '@/app/agentConfigs/types';
import { energyFocusSuiteConfig } from './suite.config';
import { energyCoachAgent } from './agents/energyCoach';
import { taskStrategistAgent } from './agents/taskStrategist';
import { bodyDoublingAgent } from './agents/bodyDoubling';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up handoffs (mutual connections)
(energyCoachAgent.handoffs as any).push(taskStrategistAgent, bodyDoublingAgent);
(taskStrategistAgent.handoffs as any).push(bodyDoublingAgent, energyCoachAgent);
(bodyDoublingAgent.handoffs as any).push(energyCoachAgent, taskStrategistAgent);

// Export suite
const energyFocusSuite: AgentSuite = {
  ...energyFocusSuiteConfig,
  agents: [energyCoachAgent, taskStrategistAgent, bodyDoublingAgent],
  rootAgent: energyCoachAgent,
  guardrails: [
    createModerationGuardrail('Energy & Focus Suite'),
  ],
};

export default energyFocusSuite;



