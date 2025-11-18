import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';
import { journalTools } from '@/app/agentConfigs/shared/tools/journal';
import { archivistAgentPrompt } from '../prompts';

export const archivistAgent = new RealtimeAgent({
  name: 'archivist',
  voice: 'fable', // Warm, reflective voice
  instructions: archivistAgentPrompt,
  tools: [...basicWorkspaceTools, ...timerTools, ...journalTools],
  handoffs: [], // Wired in index.ts
});

