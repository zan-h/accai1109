import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { unblendingPrompt } from '../prompts';

export const unblendingAgent = new RealtimeAgent({
  name: 'unblending',
  voice: 'alloy', // Calm, spacious voice
  instructions: unblendingPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Will be populated in index.ts
});


