import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { lineEditorPrompt } from '../prompts';

export const lineEditorAgent = new RealtimeAgent({
  name: 'lineEditor',
  voice: 'fable', // Precise, rhythmic voice
  instructions: lineEditorPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

