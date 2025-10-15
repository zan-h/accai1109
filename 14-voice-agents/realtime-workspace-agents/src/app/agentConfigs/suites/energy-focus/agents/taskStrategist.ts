import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { taskStrategistPrompt2 } from '../../../scenarios/workspaceBuilder/prompts';

export const taskStrategistAgent = new RealtimeAgent({
  name: 'taskStrategist',
  voice: 'alloy',
  instructions: taskStrategistPrompt2,
  tools: basicWorkspaceTools,
  handoffs: [], // wired up in index.ts to avoid circular dependencies
});



