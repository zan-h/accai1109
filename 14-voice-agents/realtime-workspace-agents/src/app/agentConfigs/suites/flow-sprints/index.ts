import { AgentSuite } from '@/app/agentConfigs/types';
import { flowSprintsSuiteConfig } from './suite.config';
import { sprintLauncherAgent } from './agents/sprintLauncher';
import { taskLoggerAgent } from './agents/taskLogger';
import { recordBreakerAgent } from './agents/recordBreaker';
import { momentumCoachAgent } from './agents/momentumCoach';
import { challengeMasterAgent } from './agents/challengeMaster';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up handoffs - all agents can reach each other for flexible flow
const agents = [
  sprintLauncherAgent,
  taskLoggerAgent,
  recordBreakerAgent,
  momentumCoachAgent,
  challengeMasterAgent,
];

// Each agent can handoff to any other agent
agents.forEach(agent => {
  const otherAgents = agents.filter(a => a !== agent);
  (agent.handoffs as any).push(...otherAgents);
});

// Export suite
const flowSprintsSuite: AgentSuite = {
  ...flowSprintsSuiteConfig,
  agents,
  rootAgent: sprintLauncherAgent, // Start with launching a sprint
  guardrails: [
    createModerationGuardrail('Flow Sprints Challenge'),
  ],
};

export default flowSprintsSuite;

