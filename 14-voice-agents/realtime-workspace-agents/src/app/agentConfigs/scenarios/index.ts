import type { RealtimeAgent } from '@openai/agents/realtime';

import { workspaceBuilderScenario } from './workspaceBuilder';
import { adhdProductivityScenario } from './adhdProductivity';

export const allAgentSets: Record<string, RealtimeAgent[]> = {
  workspaceBuilder: workspaceBuilderScenario,
  adhdProductivity: adhdProductivityScenario,
};

export const defaultAgentSetKey = 'adhdProductivity';

export {
  workspaceBuilderScenario,
  adhdProductivityScenario,
};
