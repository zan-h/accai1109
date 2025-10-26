import { RealtimeAgent } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { webSearchTool } from '@/app/agentConfigs/shared/tools/web/webSearchTool';
import { researchAssistantPrompt } from '../prompts';

export const researchAssistantAgent = new RealtimeAgent({
  name: 'researchAssistant',
  voice: 'sage', // Thoughtful, knowledgeable voice
  instructions: researchAssistantPrompt,
  tools: [...basicWorkspaceTools, webSearchTool], // Workspace tools + web search!
  handoffs: [], // Wired in index.ts
});

