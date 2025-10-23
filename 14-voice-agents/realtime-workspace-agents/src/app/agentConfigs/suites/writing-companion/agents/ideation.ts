import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { ideationPrompt } from '../prompts';

export const ideationAgent = new RealtimeAgent({
  name: 'ideation',
  voice: 'alloy', // Curious, encouraging voice
  instructions: ideationPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

