import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { flashSOSPrompt } from '../prompts';

export const flashSOSAgent = new RealtimeAgent({
  name: 'flashSOS',
  voice: 'onyx', // Clear, direct, calm voice for crisis
  instructions: flashSOSPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Will be populated in index.ts
});


