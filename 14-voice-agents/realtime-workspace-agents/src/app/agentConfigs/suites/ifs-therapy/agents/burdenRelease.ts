import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { burdenReleasePrompt } from '../prompts';

export const burdenReleaseAgent = new RealtimeAgent({
  name: 'burdenRelease',
  voice: 'shimmer', // Soft, ceremonial voice
  instructions: burdenReleasePrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Will be populated in index.ts
});


