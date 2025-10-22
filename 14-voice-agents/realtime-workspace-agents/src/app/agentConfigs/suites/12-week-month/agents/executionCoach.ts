import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { executionCoachPrompt } from '../prompts';

export const executionCoachAgent = new RealtimeAgent({
  name: 'executionCoach',
  voice: 'shimmer', // Energetic, supportive voice
  instructions: executionCoachPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

