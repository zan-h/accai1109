import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { launchCoachPrompt } from '../prompts';

export const launchCoachAgent = new RealtimeAgent({
  name: 'launchCoach',
  voice: 'echo', // Strategic, data-informed, encouraging
  instructions: launchCoachPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

