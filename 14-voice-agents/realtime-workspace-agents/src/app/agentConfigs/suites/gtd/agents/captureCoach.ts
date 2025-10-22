import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { captureCoachPrompt } from '../prompts';

export const captureCoachAgent = new RealtimeAgent({
  name: 'captureCoach',
  voice: 'alloy', // Fast, efficient voice
  instructions: captureCoachPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

