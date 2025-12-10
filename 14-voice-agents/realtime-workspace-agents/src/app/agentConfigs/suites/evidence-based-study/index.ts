import { AgentSuite } from '@/app/agentConfigs/types';
import { evidenceBasedStudySuiteConfig } from './suite.config';
import { studyStrategistAgent } from './agents/studyStrategist';
import { deepProcessorAgent } from './agents/deepProcessor';
import { activeRecallMetacognitionAgent } from './agents/activeRecallMetacognition';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire handoffs between agents
// All agents can reach each other for flexible study workflows

// Study Strategist can hand off to both learning agents
(studyStrategistAgent.handoffs as any).push(
  deepProcessorAgent,
  activeRecallMetacognitionAgent
);

// Deep Processor can hand off to strategist (for scheduling) or recall coach (for testing)
(deepProcessorAgent.handoffs as any).push(
  studyStrategistAgent,
  activeRecallMetacognitionAgent
);

// Active Recall & Metacognition can hand off to strategist (progress) or deep processor (understanding)
(activeRecallMetacognitionAgent.handoffs as any).push(
  studyStrategistAgent,
  deepProcessorAgent
);

// All agents
const agents = [
  studyStrategistAgent,
  deepProcessorAgent,
  activeRecallMetacognitionAgent,
];

// Export suite
const evidenceBasedStudySuite: AgentSuite = {
  ...evidenceBasedStudySuiteConfig,
  agents,
  rootAgent: studyStrategistAgent, // Start with strategist for planning
  guardrails: [
    createModerationGuardrail('Evidence-Based Study Companion'),
  ],
};

export default evidenceBasedStudySuite;


