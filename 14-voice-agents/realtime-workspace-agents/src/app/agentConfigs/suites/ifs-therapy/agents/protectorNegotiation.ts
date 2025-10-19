import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { protectorNegotiationPrompt } from '../prompts';

export const protectorNegotiationAgent = new RealtimeAgent({
  name: 'protectorNegotiation',
  voice: 'echo', // Warm but professional voice
  instructions: protectorNegotiationPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Will be populated in index.ts
});


