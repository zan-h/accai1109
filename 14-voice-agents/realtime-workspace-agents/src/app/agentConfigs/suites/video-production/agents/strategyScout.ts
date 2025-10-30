import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { strategyScoutPrompt } from '../prompts';

export const strategyScoutAgent = new RealtimeAgent({
  name: 'strategyScout',
  voice: 'shimmer', // Engaging, optimistic, curious
  instructions: strategyScoutPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

