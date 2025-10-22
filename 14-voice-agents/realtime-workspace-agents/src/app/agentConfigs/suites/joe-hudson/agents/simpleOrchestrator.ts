// src/app/agentConfigs/suites/joe-hudson/agents/simpleOrchestrator.ts

import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { simpleOrchestratorPrompt } from '../prompts';

export const simpleOrchestratorAgent = new RealtimeAgent({
  name: 'simpleOrchestrator',
  voice: 'sage',
  instructions: simpleOrchestratorPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

