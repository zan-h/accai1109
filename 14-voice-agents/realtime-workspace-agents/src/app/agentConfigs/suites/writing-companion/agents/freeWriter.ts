import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';
import { freeWriterPrompt } from '../prompts';

export const freeWriterAgent = new RealtimeAgent({
  name: 'freeWriter',
  voice: 'echo', // Calm, supportive voice
  instructions: freeWriterPrompt,
  tools: [...basicWorkspaceTools, ...timerTools], // Timer for timed writing sessions!
  handoffs: [], // Wired in index.ts
});

