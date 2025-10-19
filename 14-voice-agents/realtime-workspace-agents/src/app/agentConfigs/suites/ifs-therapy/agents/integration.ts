import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { integrationPrompt } from '../prompts';

export const integrationAgent = new RealtimeAgent({
  name: 'integration',
  voice: 'alloy', // Warm, grounding voice
  instructions: integrationPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Will be populated in index.ts
});


