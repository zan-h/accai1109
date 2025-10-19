import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { microPracticePrompt } from '../prompts';

export const microPracticeAgent = new RealtimeAgent({
  name: 'microPractice',
  voice: 'echo', // Friendly, encouraging voice
  instructions: microPracticePrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Will be populated in index.ts
});


