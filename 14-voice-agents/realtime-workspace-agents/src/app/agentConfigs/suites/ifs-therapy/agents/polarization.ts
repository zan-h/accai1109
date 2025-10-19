import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { polarizationPrompt } from '../prompts';

export const polarizationAgent = new RealtimeAgent({
  name: 'polarization',
  voice: 'echo', // Balanced, diplomatic voice
  instructions: polarizationPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Will be populated in index.ts
});


