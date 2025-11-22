import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';
import { journalTools } from '@/app/agentConfigs/shared/tools/journal';
import { anchorAgentPrompt } from '../prompts';

export const anchorAgent = new RealtimeAgent({
  name: 'anchor',
  voice: 'sage', // Calm, focused voice
  instructions: anchorAgentPrompt,
  tools: [...basicWorkspaceTools, ...timerTools, ...journalTools],
  handoffs: [], // Wired in index.ts
});

