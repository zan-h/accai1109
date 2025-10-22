import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { challengeMasterPrompt } from '../prompts';

export const challengeMasterAgent = new RealtimeAgent({
  name: 'challengeMaster',
  voice: 'verse', // Playful, game designer voice
  instructions: challengeMasterPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

