import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { sprintLauncherPrompt } from '../prompts';

export const sprintLauncherAgent = new RealtimeAgent({
  name: 'sprintLauncher',
  voice: 'shimmer', // Energetic, hyped voice
  instructions: sprintLauncherPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Wired in index.ts
});

