import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { developmentTrackerPrompt } from '../prompts';

export const developmentTrackerAgent = new RealtimeAgent({
  name: 'developmentTracker',
  voice: 'shimmer', // Encouraging, upbeat voice
  instructions: developmentTrackerPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

