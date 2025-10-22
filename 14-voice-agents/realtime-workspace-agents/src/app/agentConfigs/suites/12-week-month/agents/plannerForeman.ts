import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { plannerForemanPrompt } from '../prompts';

export const plannerForemanAgent = new RealtimeAgent({
  name: 'plannerForeman',
  voice: 'alloy', // Practical, no-nonsense voice
  instructions: plannerForemanPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

