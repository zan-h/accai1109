import { RealtimeAgent } from '@openai/agents/realtime';
import { advancedWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { embodiedWorkGuidePrompt } from '../prompts';

export const embodiedWorkGuideAgent = new RealtimeAgent({
  name: 'embodiedWorkGuide',
  voice: 'shimmer',
  instructions: embodiedWorkGuidePrompt,
  tools: advancedWorkspaceTools,
  handoffs: [], // Single agent suite - no handoffs needed
});

