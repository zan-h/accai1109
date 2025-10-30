import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { producerPrompt } from '../prompts';

export const producerAgent = new RealtimeAgent({
  name: 'producer',
  voice: 'echo', // Authoritative but warm, professional
  instructions: producerPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

