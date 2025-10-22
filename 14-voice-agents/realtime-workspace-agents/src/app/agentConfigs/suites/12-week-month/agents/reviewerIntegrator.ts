import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { reviewerIntegratorPrompt } from '../prompts';

export const reviewerIntegratorAgent = new RealtimeAgent({
  name: 'reviewerIntegrator',
  voice: 'verse', // Reflective, encouraging voice
  instructions: reviewerIntegratorPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

