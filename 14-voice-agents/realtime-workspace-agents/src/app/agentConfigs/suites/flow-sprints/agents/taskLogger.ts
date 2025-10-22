import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';
import { taskLoggerPrompt } from '../prompts';

export const taskLoggerAgent = new RealtimeAgent({
  name: 'taskLogger',
  voice: 'alloy', // Fast, enthusiastic voice
  instructions: taskLoggerPrompt,
  tools: [...basicWorkspaceTools, ...timerTools],
  handoffs: [], // Wired in index.ts
});

