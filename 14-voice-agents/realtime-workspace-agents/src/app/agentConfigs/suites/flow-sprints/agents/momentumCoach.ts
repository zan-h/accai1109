import { RealtimeAgent } from '@openai/agents/realtime';
import { advancedWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';
import { journalTools } from '@/app/agentConfigs/shared/tools/journal';
import { avoidancePusherPrompt } from '../prompts-new';

export const avoidancePusherAgent = new RealtimeAgent({
  name: 'avoidancePusher',
  voice: 'echo',
  instructions: avoidancePusherPrompt,
  tools: [...advancedWorkspaceTools, ...timerTools, ...journalTools],
  handoffs: [], // wired up in index.ts
});

// Export with old name for backwards compatibility
export const momentumCoachAgent = avoidancePusherAgent;
