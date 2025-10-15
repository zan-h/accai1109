import { AgentSuite } from '@/app/agentConfigs/types';
import { babyCareSuiteConfig } from './suite.config';
import { feedingCoachAgent } from './agents/feedingCoach';
import { sleepSpecialistAgent } from './agents/sleepSpecialist';
import { developmentTrackerAgent } from './agents/developmentTracker';
import { healthMonitorAgent } from './agents/healthMonitor';
import { calmingCoachAgent } from './agents/calmingCoach';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up handoffs - all agents can reach each other
const agents = [
  feedingCoachAgent,
  sleepSpecialistAgent,
  developmentTrackerAgent,
  healthMonitorAgent,
  calmingCoachAgent,
];

// Each agent can handoff to any other agent
agents.forEach(agent => {
  const otherAgents = agents.filter(a => a !== agent);
  (agent.handoffs as any).push(...otherAgents);
});

// Export suite
const babyCareSuite: AgentSuite = {
  ...babyCareSuiteConfig,
  agents,
  rootAgent: feedingCoachAgent, // Start with feeding as it's most frequent
  guardrails: [
    createModerationGuardrail('Baby Care Companion'),
  ],
};

export default babyCareSuite;

