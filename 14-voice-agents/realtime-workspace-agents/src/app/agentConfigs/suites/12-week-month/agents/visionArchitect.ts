import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { visionArchitectPrompt } from '../prompts';

export const visionArchitectAgent = new RealtimeAgent({
  name: 'visionArchitect',
  voice: 'sage', // Calm, strategic voice
  instructions: visionArchitectPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

