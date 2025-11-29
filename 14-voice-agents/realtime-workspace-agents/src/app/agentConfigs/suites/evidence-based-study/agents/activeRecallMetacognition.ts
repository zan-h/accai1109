import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { timerTools } from '@/app/agentConfigs/shared/tools/workspace/timerTools';
import { activeRecallMetacognitionPrompt } from '../prompts';

export const activeRecallMetacognitionAgent = new RealtimeAgent({
  name: 'activeRecallMetacognition',
  voice: 'echo', // Clear, focused, reflective
  instructions: activeRecallMetacognitionPrompt,
  tools: [...basicWorkspaceTools, ...timerTools], // Includes timer for focused study sessions
  handoffs: [], // Wired in index.ts
});

