import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { feedingCoachPrompt } from '../prompts';

export const feedingCoachAgent = new RealtimeAgent({
  name: 'feedingCoach',
  voice: 'sage', // Warm, nurturing voice
  instructions: feedingCoachPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

