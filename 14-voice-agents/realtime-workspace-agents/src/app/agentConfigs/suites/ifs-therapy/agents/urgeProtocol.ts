import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { urgeProtocolPrompt } from '../prompts';

export const urgeProtocolAgent = new RealtimeAgent({
  name: 'urgeProtocol',
  voice: 'alloy', // Steady, grounded voice
  instructions: urgeProtocolPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Will be populated in index.ts
});


