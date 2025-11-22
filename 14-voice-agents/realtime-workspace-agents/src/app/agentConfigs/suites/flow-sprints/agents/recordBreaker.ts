import { RealtimeAgent } from '@openai/agents/realtime';
import { advancedWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { timerTools} from '@/app/agentConfigs/shared/tools/workspace/timerTools';
import { journalTools } from '@/app/agentConfigs/shared/tools/journal';
import { celebrationMasterPrompt } from '../prompts-new';

export const celebrationMasterAgent = new RealtimeAgent({
  name: 'celebrationMaster',
  voice: 'shimmer',
  instructions: celebrationMasterPrompt,
  tools: [...advancedWorkspaceTools, ...timerTools, ...journalTools],
  handoffs: [], // wired up in index.ts
});

// Export with old name for backwards compatibility
export const recordBreakerAgent = celebrationMasterAgent;
