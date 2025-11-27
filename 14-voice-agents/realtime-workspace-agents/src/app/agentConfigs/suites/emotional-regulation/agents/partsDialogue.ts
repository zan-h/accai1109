import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { partsDialoguePrompt } from '../prompts';

export const partsDialogueAgent = new RealtimeAgent({
  name: 'partsDialogue',
  voice: 'echo', // Warm, therapeutic, curious
  instructions: partsDialoguePrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

