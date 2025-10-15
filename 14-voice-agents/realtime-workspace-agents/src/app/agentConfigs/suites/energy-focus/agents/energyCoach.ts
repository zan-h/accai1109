import { RealtimeAgent } from '@openai/agents/realtime';
import { advancedWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { energyCoachPrompt2 } from '../../../scenarios/workspaceBuilder/prompts';

export const energyCoachAgent = new RealtimeAgent({
  name: 'energyCoach',
  voice: 'sage',
  instructions: energyCoachPrompt2,
  tools: advancedWorkspaceTools,
  handoffs: [], // wired up in index.ts to avoid circular dependencies
});



