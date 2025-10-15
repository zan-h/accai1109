import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { bodyDoublingPrompt2 } from '../../../scenarios/workspaceBuilder/prompts';

export const bodyDoublingAgent = new RealtimeAgent({
  name: 'bodyDoubling',
  voice: 'verse',
  instructions: bodyDoublingPrompt2,
  tools: basicWorkspaceTools,
  handoffs: [], // wired up in index.ts to avoid circular dependencies
});



