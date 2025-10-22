// src/app/agentConfigs/suites/joe-hudson/agents/somaticCheck.ts

import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { somaticCheckPrompt } from '../prompts';

export const somaticCheckAgent = new RealtimeAgent({
  name: 'somaticCheck',
  voice: 'echo',
  instructions: somaticCheckPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

