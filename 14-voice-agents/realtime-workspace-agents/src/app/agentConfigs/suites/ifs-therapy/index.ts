import { AgentSuite } from '@/app/agentConfigs/types';
import { ifsTherapySuiteConfig } from './suite.config';

// Import all agents
import { groundingConsentAgent } from './agents/groundingConsent';
import { standardPartsAgent } from './agents/standardParts';
import { unblendingAgent } from './agents/unblending';
import { protectorNegotiationAgent } from './agents/protectorNegotiation';
import { exileWitnessingAgent } from './agents/exileWitnessing';
import { polarizationAgent } from './agents/polarization';
import { burdenReleaseAgent } from './agents/burdenRelease';
import { integrationAgent } from './agents/integration';
import { urgeProtocolAgent } from './agents/urgeProtocol';
import { flashSOSAgent } from './agents/flashSOS';
import { microPracticeAgent } from './agents/microPractice';
import { valuesIntentAgent } from './agents/valuesIntent';

import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Organize agents by category for easier handoff logic
const coreAgents = [
  groundingConsentAgent,
  standardPartsAgent,
  unblendingAgent,
  protectorNegotiationAgent,
  exileWitnessingAgent,
  polarizationAgent,
  burdenReleaseAgent,
  integrationAgent,
];

const appliedAgents = [
  urgeProtocolAgent,
  flashSOSAgent,
  microPracticeAgent,
  valuesIntentAgent,
];

const allAgents = [...coreAgents, ...appliedAgents];

// Set up strategic handoffs based on IFS protocol flow
// Each agent can handoff to relevant agents based on session needs

// Grounding can go to any session type
(groundingConsentAgent.handoffs as any).push(
  standardPartsAgent,
  unblendingAgent,
  urgeProtocolAgent,
  flashSOSAgent,
  microPracticeAgent,
  valuesIntentAgent
);

// Standard Parts can go to unblending, protector negotiation, or integration
(standardPartsAgent.handoffs as any).push(
  unblendingAgent,
  protectorNegotiationAgent,
  integrationAgent
);

// Unblending can return to standard parts or go to integration
(unblendingAgent.handoffs as any).push(
  standardPartsAgent,
  protectorNegotiationAgent,
  urgeProtocolAgent,
  valuesIntentAgent,
  integrationAgent
);

// Protector Negotiation can go to exile witnessing, polarization, or integration
(protectorNegotiationAgent.handoffs as any).push(
  exileWitnessingAgent,
  polarizationAgent,
  burdenReleaseAgent,
  integrationAgent
);

// Exile Witnessing can go to burden release, back to protector negotiation, or integration
(exileWitnessingAgent.handoffs as any).push(
  protectorNegotiationAgent,
  burdenReleaseAgent,
  integrationAgent
);

// Polarization can go to integration
(polarizationAgent.handoffs as any).push(
  integrationAgent
);

// Burden Release can go to integration
(burdenReleaseAgent.handoffs as any).push(
  integrationAgent
);

// Integration can go back to any session or end
(integrationAgent.handoffs as any).push(
  standardPartsAgent,
  microPracticeAgent,
  valuesIntentAgent
);

// Urge Protocol can go to unblending, protector negotiation, or integration
(urgeProtocolAgent.handoffs as any).push(
  unblendingAgent,
  protectorNegotiationAgent,
  integrationAgent
);

// Flash SOS can go to grounding, unblending, or micro-practice for stabilization
(flashSOSAgent.handoffs as any).push(
  groundingConsentAgent,
  unblendingAgent,
  microPracticeAgent
);

// Micro Practice can go to standard parts, unblending, or integration
(microPracticeAgent.handoffs as any).push(
  standardPartsAgent,
  unblendingAgent,
  integrationAgent
);

// Values/Intent can go to protector negotiation, polarization, or integration
(valuesIntentAgent.handoffs as any).push(
  unblendingAgent,
  protectorNegotiationAgent,
  polarizationAgent,
  integrationAgent
);

// Export suite
const ifsTherapySuite: AgentSuite = {
  ...ifsTherapySuiteConfig,
  agents: allAgents,
  rootAgent: groundingConsentAgent, // Always start with grounding & consent check
  guardrails: [
    createModerationGuardrail('IFS Therapy Companion'),
  ],
};

export default ifsTherapySuite;


