import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { studyStrategistPrompt } from '../prompts';

export const studyStrategistAgent = new RealtimeAgent({
  name: 'studyStrategist',
  voice: 'shimmer', // Encouraging, organized, systematic
  instructions: studyStrategistPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});


