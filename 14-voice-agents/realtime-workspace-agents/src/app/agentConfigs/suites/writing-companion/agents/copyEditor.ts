import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { copyEditorPrompt } from '../prompts';

export const copyEditorAgent = new RealtimeAgent({
  name: 'copyEditor',
  voice: 'onyx', // Precise, detail-oriented voice
  instructions: copyEditorPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

