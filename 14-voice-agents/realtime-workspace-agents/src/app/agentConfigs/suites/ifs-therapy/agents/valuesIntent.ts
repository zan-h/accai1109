import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { valuesIntentPrompt } from '../prompts';

export const valuesIntentAgent = new RealtimeAgent({
  name: 'valuesIntent',
  voice: 'echo', // Wise, steady, mentoring voice
  instructions: valuesIntentPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Will be populated in index.ts
});


