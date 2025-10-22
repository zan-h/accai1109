import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { taskLoggerPrompt } from '../prompts';

export const taskLoggerAgent = new RealtimeAgent({
  name: 'taskLogger',
  voice: 'alloy', // Fast, enthusiastic voice
  instructions: taskLoggerPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

