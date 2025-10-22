// src/app/agentConfigs/suites/joe-hudson/index.ts

import { AgentSuite } from '@/app/agentConfigs/types';
import { joeHudsonSuiteConfig } from './suite.config';
import { simpleOrchestratorAgent } from './agents/simpleOrchestrator';
import { decisionMiniAgent } from './agents/decisionMini';
import { somaticCheckAgent } from './agents/somaticCheck';
import { taskShardingAgent } from './agents/taskSharding';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up handoffs
// Simple Orchestrator can handoff to all support agents
(simpleOrchestratorAgent.handoffs as any).push(
  decisionMiniAgent,
  somaticCheckAgent,
  taskShardingAgent
);

// All support agents handoff back to Simple Orchestrator
(decisionMiniAgent.handoffs as any).push(simpleOrchestratorAgent);
(somaticCheckAgent.handoffs as any).push(simpleOrchestratorAgent);
(taskShardingAgent.handoffs as any).push(simpleOrchestratorAgent);

// Support agents can also handoff to each other if needed
(somaticCheckAgent.handoffs as any).push(taskShardingAgent);
(taskShardingAgent.handoffs as any).push(somaticCheckAgent);

// Export suite
const joeHudsonSuite: AgentSuite = {
  ...joeHudsonSuiteConfig,
  agents: [
    simpleOrchestratorAgent,
    decisionMiniAgent,
    somaticCheckAgent,
    taskShardingAgent,
  ],
  rootAgent: simpleOrchestratorAgent,
  guardrails: [
    createModerationGuardrail('Joe Hudson Work Flow'),
  ],
};

export default joeHudsonSuite;




