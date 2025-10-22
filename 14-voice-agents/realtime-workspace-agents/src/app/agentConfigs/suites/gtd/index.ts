import { AgentSuite } from '@/app/agentConfigs/types';
import { gtdSuiteConfig } from './suite.config';
import { captureCoachAgent } from './agents/captureCoach';
import { clarifierAgent } from './agents/clarifier';
import { organizerAgent } from './agents/organizer';
import { contextGuideAgent } from './agents/contextGuide';
import { weeklyReviewerAgent } from './agents/weeklyReviewer';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up handoffs - all agents can reach each other for flexible GTD workflow
const agents = [
  captureCoachAgent,
  clarifierAgent,
  organizerAgent,
  contextGuideAgent,
  weeklyReviewerAgent,
];

// Each agent can handoff to any other agent
agents.forEach(agent => {
  const otherAgents = agents.filter(a => a !== agent);
  (agent.handoffs as any).push(...otherAgents);
});

// Export suite
const gtdSuite: AgentSuite = {
  ...gtdSuiteConfig,
  agents,
  rootAgent: captureCoachAgent, // Start with capture (most common entry point)
  guardrails: [
    createModerationGuardrail('GTD Capture & Organize'),
  ],
};

export default gtdSuite;

