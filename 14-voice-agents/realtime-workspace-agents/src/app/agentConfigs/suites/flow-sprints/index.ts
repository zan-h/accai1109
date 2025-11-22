import { AgentSuite } from '@/app/agentConfigs/types';
import { flowSprintsSuiteConfig } from './suite.config';
import { loopCloserAgent } from './agents/sprintLauncher';
import { avoidancePusherAgent } from './agents/momentumCoach';
import { celebrationMasterAgent } from './agents/recordBreaker';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up handoffs - linear flow: Loop Closer → Avoidance Pusher → Celebration Master
(loopCloserAgent.handoffs as any).push(avoidancePusherAgent);
(avoidancePusherAgent.handoffs as any).push(celebrationMasterAgent);
(celebrationMasterAgent.handoffs as any).push(loopCloserAgent); // Can start new sprint

// Export suite
const taskSprintSuite: AgentSuite = {
  ...flowSprintsSuiteConfig,
  agents: [loopCloserAgent, avoidancePusherAgent, celebrationMasterAgent],
  rootAgent: loopCloserAgent,
  guardrails: [
    createModerationGuardrail('Task Sprint Suite'),
  ],
};

export default taskSprintSuite;

