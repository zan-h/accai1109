import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { groundingConsentPrompt } from '../prompts';

export const groundingConsentAgent = new RealtimeAgent({
  name: 'groundingConsent',
  voice: 'alloy', // Calm, steady voice
  instructions: groundingConsentPrompt,
  tools: basicWorkspaceTools,
  handoffs: [], // Will be populated in index.ts
});


