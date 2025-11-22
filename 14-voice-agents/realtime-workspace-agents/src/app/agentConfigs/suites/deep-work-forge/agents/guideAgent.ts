import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';
import { journalTools } from '@/app/agentConfigs/shared/tools/journal';
import { guideAgentPrompt } from '../prompts';

export const guideAgent = new RealtimeAgent({
  name: 'guide',
  voice: 'echo', // Minimal, subtle voice
  instructions: guideAgentPrompt,
  tools: [...basicWorkspaceTools, ...timerTools, ...journalTools],
  handoffs: [], // Wired in index.ts
});

