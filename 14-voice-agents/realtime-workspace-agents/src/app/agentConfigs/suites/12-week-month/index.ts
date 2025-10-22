import { AgentSuite } from '@/app/agentConfigs/types';
import { twelveWeekMonthSuiteConfig } from './suite.config';
import { visionArchitectAgent } from './agents/visionArchitect';
import { plannerForemanAgent } from './agents/plannerForeman';
import { executionCoachAgent } from './agents/executionCoach';
import { decisionArchitectAgent } from './agents/decisionArchitect';
import { reviewerIntegratorAgent } from './agents/reviewerIntegrator';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up handoffs - all agents can reach each other for flexible workflow
const agents = [
  visionArchitectAgent,
  plannerForemanAgent,
  executionCoachAgent,
  decisionArchitectAgent,
  reviewerIntegratorAgent,
];

// Each agent can handoff to any other agent
agents.forEach(agent => {
  const otherAgents = agents.filter(a => a !== agent);
  (agent.handoffs as any).push(...otherAgents);
});

// Export suite
const twelveWeekMonthSuite: AgentSuite = {
  ...twelveWeekMonthSuiteConfig,
  agents,
  rootAgent: visionArchitectAgent, // Start with vision setting
  guardrails: [
    createModerationGuardrail('12‑Week Month Coach'),
  ],
};

export default twelveWeekMonthSuite;

