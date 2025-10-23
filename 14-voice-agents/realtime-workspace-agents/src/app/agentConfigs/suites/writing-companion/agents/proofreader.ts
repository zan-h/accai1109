import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { proofreaderPrompt } from '../prompts';

export const proofreaderAgent = new RealtimeAgent({
  name: 'proofreader',
  voice: 'nova', // Meticulous, final-check voice
  instructions: proofreaderPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

