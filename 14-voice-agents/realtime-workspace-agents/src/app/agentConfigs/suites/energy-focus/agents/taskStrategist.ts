import { RealtimeAgent } from '@openai/agents/realtime';
import { advancedWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { capacityMapperPrompt } from '../prompts';

export const capacityMapperAgent = new RealtimeAgent({
  name: 'capacityMapper',
  voice: 'echo',
  instructions: capacityMapperPrompt,
  tools: advancedWorkspaceTools,
  handoffs: [], // wired up in index.ts to avoid circular dependencies
});

// Export with old name for backwards compatibility during transition
export const taskStrategistAgent = capacityMapperAgent;



