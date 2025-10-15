import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { sleepSpecialistPrompt } from '../prompts';

export const sleepSpecialistAgent = new RealtimeAgent({
  name: 'sleepSpecialist',
  voice: 'alloy', // Calm, soothing voice
  instructions: sleepSpecialistPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

