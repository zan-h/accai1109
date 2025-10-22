import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';
import { executionCoachPrompt } from '../prompts';

export const executionCoachAgent = new RealtimeAgent({
  name: 'executionCoach',
  voice: 'shimmer', // Energetic, supportive voice
  instructions: executionCoachPrompt,
  tools: [...basicWorkspaceTools, ...timerTools],
  handoffs: [], // Wired in index.ts
});

