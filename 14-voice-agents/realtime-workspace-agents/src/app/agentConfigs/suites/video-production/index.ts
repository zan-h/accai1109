import { AgentSuite } from '@/app/agentConfigs/types';
import { videoProductionSuiteConfig } from './suite.config';
import { producerAgent } from './agents/producer';
import { researchAgent } from './agents/researchAgent';
import { strategyScoutAgent } from './agents/strategyScout';
import { narrativeArchitectAgent } from './agents/narrativeArchitect';
import { productionPartnerAgent } from './agents/productionPartner';
import { launchCoachAgent } from './agents/launchCoach';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// All 6 agents
const agents = [
  producerAgent,
  researchAgent,
  strategyScoutAgent,
  narrativeArchitectAgent,
  productionPartnerAgent,
  launchCoachAgent,
];

// Wire all-to-all handoffs (NO GATES - flexible iteration)
// Every agent can transfer to every other agent
agents.forEach(agent => {
  const otherAgents = agents.filter(a => a !== agent);
  (agent.handoffs as any).push(...otherAgents);
});

// Export complete suite
const videoProductionSuite: AgentSuite = {
  ...videoProductionSuiteConfig,
  agents,
  rootAgent: producerAgent, // Producer starts - oversees workspace and guides next steps
  guardrails: [
    createModerationGuardrail('Video Production Companion'),
  ],
};

export default videoProductionSuite;

