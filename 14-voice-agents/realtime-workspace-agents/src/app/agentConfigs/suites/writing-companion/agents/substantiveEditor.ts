import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { substantiveEditorPrompt } from '../prompts';

export const substantiveEditorAgent = new RealtimeAgent({
  name: 'substantiveEditor',
  voice: 'sage', // Thoughtful, strategic voice
  instructions: substantiveEditorPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

