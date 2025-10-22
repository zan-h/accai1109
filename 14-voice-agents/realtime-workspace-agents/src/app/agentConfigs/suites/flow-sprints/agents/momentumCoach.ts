import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { momentumCoachPrompt } from '../prompts';

export const momentumCoachAgent = new RealtimeAgent({
  name: 'momentumCoach',
  voice: 'sage', // Supportive, wise voice
  instructions: momentumCoachPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

