import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { healthMonitorPrompt } from '../prompts';

export const healthMonitorAgent = new RealtimeAgent({
  name: 'healthMonitor',
  voice: 'echo', // Professional, calm voice
  instructions: healthMonitorPrompt,
  tools: basicWorkspaceTools,
  handoffs: [],
});

