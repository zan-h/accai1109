// src/app/agentConfigs/suites/joe-hudson/agents/taskSharding.ts

import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { taskShardingPrompt } from '../prompts';

export const taskShardingAgent = new RealtimeAgent({
  name: 'taskSharding',
  voice: 'shimmer',
  instructions: taskShardingPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

