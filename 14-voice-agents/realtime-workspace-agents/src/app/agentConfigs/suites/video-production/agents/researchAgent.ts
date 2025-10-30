import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { researchAgentPrompt } from '../prompts';

export const researchAgent = new RealtimeAgent({
  name: 'researchAgent',
  voice: 'sage', // Thoughtful, analytical, curious
  instructions: researchAgentPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

