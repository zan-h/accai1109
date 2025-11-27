import { AgentSuite } from '@/app/agentConfigs/types';
import { emotionalRegulationSuite } from './suite.config';

// Import all agents
import { emotionIdentifierAgent } from './agents/emotionIdentifier';
import { partsDialogueAgent } from './agents/partsDialogue';
import { integrationCoachAgent } from './agents/integrationCoach';

import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// All agents
const agents = [
  emotionIdentifierAgent,
  partsDialogueAgent,
  integrationCoachAgent,
];

// Set up handoffs - simple mesh network where all agents can reach each other
// This gives flexibility for users to navigate based on where they are

// Emotion Identifier can go to Parts Dialogue or Integration
(emotionIdentifierAgent.handoffs as any).push(partsDialogueAgent, integrationCoachAgent);

// Parts Dialogue can go to Integration (most common) or back to Emotion Identifier
(partsDialogueAgent.handoffs as any).push(integrationCoachAgent, emotionIdentifierAgent);

// Integration can go to any agent if user wants to continue working
(integrationCoachAgent.handoffs as any).push(emotionIdentifierAgent, partsDialogueAgent);

// Export complete suite
const emotionalRegulationSuiteComplete: AgentSuite = {
  ...emotionalRegulationSuite,
  agents,
  rootAgent: emotionIdentifierAgent, // Start here - identify what's present
  guardrails: [
    createModerationGuardrail('Emotional Regulation - Parts Work'),
  ],
};

export default emotionalRegulationSuiteComplete;

