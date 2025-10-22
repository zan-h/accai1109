import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { recordBreakerPrompt } from '../prompts';

export const recordBreakerAgent = new RealtimeAgent({
  name: 'recordBreaker',
  voice: 'echo', // Analytical but celebratory voice
  instructions: recordBreakerPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

