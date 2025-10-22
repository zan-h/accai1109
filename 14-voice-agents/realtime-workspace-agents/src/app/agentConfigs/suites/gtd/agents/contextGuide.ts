import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { contextGuidePrompt } from '../prompts';

export const contextGuideAgent = new RealtimeAgent({
  name: 'contextGuide',
  voice: 'shimmer', // Decisive, energizing voice
  instructions: contextGuidePrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

