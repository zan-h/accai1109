import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { productionPartnerPrompt } from '../prompts';

export const productionPartnerAgent = new RealtimeAgent({
  name: 'productionPartner',
  voice: 'verse', // Energetic, action-oriented, clear commands
  instructions: productionPartnerPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

