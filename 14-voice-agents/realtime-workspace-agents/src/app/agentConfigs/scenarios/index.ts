import type { RealtimeAgent } from '@openai/agents/realtime';

import { workspaceBuilderScenario } from './workspaceBuilder';

export const allAgentSets: Record<string, RealtimeAgent[]> = {
  workspaceBuilder: workspaceBuilderScenario,
};

export const defaultAgentSetKey = 'workspaceBuilder';

export {
  workspaceBuilderScenario,
};
