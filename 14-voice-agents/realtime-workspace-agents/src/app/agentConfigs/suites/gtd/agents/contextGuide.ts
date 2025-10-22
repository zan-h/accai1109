import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';
import { contextGuidePrompt } from '../prompts';

export const contextGuideAgent = new RealtimeAgent({
  name: 'contextGuide',
  voice: 'shimmer', // Decisive, energizing voice
  instructions: contextGuidePrompt,
  tools: [...basicWorkspaceTools, ...timerTools],
  handoffs: [], // Wired in index.ts
});

