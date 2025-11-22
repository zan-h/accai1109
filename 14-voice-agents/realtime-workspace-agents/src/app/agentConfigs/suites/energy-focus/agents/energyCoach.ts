import { RealtimeAgent } from '@openai/agents/realtime';
import { advancedWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { groundingGuidePrompt } from '../prompts';

export const groundingGuideAgent = new RealtimeAgent({
  name: 'groundingGuide',
  voice: 'sage',
  instructions: groundingGuidePrompt,
  tools: advancedWorkspaceTools,
  handoffs: [], // wired up in index.ts to avoid circular dependencies
});

// Export with old name for backwards compatibility during transition
export const energyCoachAgent = groundingGuideAgent;



