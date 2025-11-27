import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { integrationCoachPrompt } from '../prompts';

export const integrationCoachAgent = new RealtimeAgent({
  name: 'integrationCoach',
  voice: 'shimmer', // Soft, gentle, closing
  instructions: integrationCoachPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

