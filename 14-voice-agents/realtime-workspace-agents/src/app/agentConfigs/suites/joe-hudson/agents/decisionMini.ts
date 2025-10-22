// src/app/agentConfigs/suites/joe-hudson/agents/decisionMini.ts

import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { decisionMiniPrompt } from '../prompts';

export const decisionMiniAgent = new RealtimeAgent({
  name: 'decisionMini',
  voice: 'alloy',
  instructions: decisionMiniPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

