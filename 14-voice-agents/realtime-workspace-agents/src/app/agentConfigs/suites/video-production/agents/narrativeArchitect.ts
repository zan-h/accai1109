import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { narrativeArchitectPrompt } from '../prompts';

export const narrativeArchitectAgent = new RealtimeAgent({
  name: 'narrativeArchitect',
  voice: 'alloy', // Calm, thoughtful, encouraging
  instructions: narrativeArchitectPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

