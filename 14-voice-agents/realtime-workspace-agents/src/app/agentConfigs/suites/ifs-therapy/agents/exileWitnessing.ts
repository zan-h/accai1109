import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { exileWitnessingPrompt } from '../prompts';

export const exileWitnessingAgent = new RealtimeAgent({
  name: 'exileWitnessing',
  voice: 'shimmer', // Soft, gentle, compassionate voice
  instructions: exileWitnessingPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Will be populated in index.ts
});


