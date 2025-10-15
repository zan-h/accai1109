import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { calmingCoachPrompt } from '../prompts';

export const calmingCoachAgent = new RealtimeAgent({
  name: 'calmingCoach',
  voice: 'verse', // Gentle, reassuring voice
  instructions: calmingCoachPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

