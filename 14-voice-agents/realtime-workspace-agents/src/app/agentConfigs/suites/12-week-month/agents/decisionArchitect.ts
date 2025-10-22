import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { decisionArchitectPrompt } from '../prompts';

export const decisionArchitectAgent = new RealtimeAgent({
  name: 'decisionArchitect',
  voice: 'echo', // Analytical, steady voice
  instructions: decisionArchitectPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

