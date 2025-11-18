import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';
import { journalTools } from '@/app/agentConfigs/shared/tools/journal';
import { sparkAgentPrompt } from '../prompts';

export const sparkAgent = new RealtimeAgent({
  name: 'spark',
  voice: 'shimmer', // Energetic, encouraging voice
  instructions: sparkAgentPrompt,
  tools: [...basicWorkspaceTools, ...timerTools, ...journalTools],
  handoffs: [], // Wired in index.ts
});

