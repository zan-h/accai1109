import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { deepProcessorPrompt } from '../prompts';

export const deepProcessorAgent = new RealtimeAgent({
  name: 'deepProcessor',
  voice: 'alloy', // Thoughtful, patient, philosophical
  instructions: deepProcessorPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

