import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { clarifierPrompt } from '../prompts';

export const clarifierAgent = new RealtimeAgent({
  name: 'clarifier',
  voice: 'sage', // Patient, methodical voice
  instructions: clarifierPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

