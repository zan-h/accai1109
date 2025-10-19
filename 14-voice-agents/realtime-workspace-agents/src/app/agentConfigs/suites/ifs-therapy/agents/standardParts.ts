import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { standardPartsPrompt } from '../prompts';

export const standardPartsAgent = new RealtimeAgent({
  name: 'standardParts',
  voice: 'echo', // Warm, therapeutic voice
  instructions: standardPartsPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Will be populated in index.ts
});


