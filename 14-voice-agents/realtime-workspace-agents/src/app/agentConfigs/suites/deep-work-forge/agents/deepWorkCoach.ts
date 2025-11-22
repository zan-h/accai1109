// Deep Work Coach - Simplified single-agent for deep work sessions

import { RealtimeAgent } from '@openai/agents-realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';
import { deepWorkCoachPrompt } from '../prompts';

export const deepWorkCoach = new RealtimeAgent({
  name: 'deepWorkCoach',
  voice: 'echo',
  instructions: deepWorkCoachPrompt,
  tools: [...basicWorkspaceTools, ...timerTools],
  handoffs: [],
});

