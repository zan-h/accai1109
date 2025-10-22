import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { organizerPrompt } from '../prompts';

export const organizerAgent = new RealtimeAgent({
  name: 'organizer',
  voice: 'echo', // Orderly, calming voice
  instructions: organizerPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

