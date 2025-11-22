import { AgentSuite } from '@/app/agentConfigs/types';
import { deepWorkForgeSuiteConfig } from './suite.config';
import { deepWorkCoach } from './agents/deepWorkCoach';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Simple single-agent setup
const agents = [deepWorkCoach];

// Export suite
const deepWorkForgeSuite: AgentSuite = {
  ...deepWorkForgeSuiteConfig,
  agents,
  rootAgent: deepWorkCoach,
  guardrails: [
    createModerationGuardrail('Deep Work Forge'),
  ],
};

export default deepWorkForgeSuite;

