import { RealtimeAgent } from '@openai/agents/realtime';
import { advancedWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { launchPartnerPrompt } from '../prompts';

export const launchPartnerAgent = new RealtimeAgent({
  name: 'launchPartner',
  voice: 'alloy',
  instructions: launchPartnerPrompt,
  tools: advancedWorkspaceTools,
  handoffs: [], // wired up in index.ts to avoid circular dependencies
});

// Export with old name for backwards compatibility during transition
export const bodyDoublingAgent = launchPartnerAgent;



