import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { emotionIdentifierPrompt } from '../prompts';

export const emotionIdentifierAgent = new RealtimeAgent({
  name: 'emotionIdentifier',
  voice: 'alloy', // Calm, steady, grounding
  instructions: emotionIdentifierPrompt,
  tools: basicWorkspaceTools, // Can read/write to workspace
  handoffs: [], // Wired in index.ts
});

