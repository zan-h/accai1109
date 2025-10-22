import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { weeklyReviewerPrompt } from '../prompts';

export const weeklyReviewerAgent = new RealtimeAgent({
  name: 'weeklyReviewer',
  voice: 'verse', // Reflective, thorough voice
  instructions: weeklyReviewerPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

