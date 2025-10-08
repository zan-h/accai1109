import { energyCoachAgent } from './workspaceManager';
import { taskStrategistAgent } from './designer';
import { bodyDoublingAgent } from './estimator';

// Wire up intelligent handoffs for ADHD/embodied work support
// Energy Coach can hand off to either Task Strategist or Body Doubling
(energyCoachAgent.handoffs as any).push(taskStrategistAgent, bodyDoublingAgent);
// Task Strategist can hand off to Body Doubling or back to Energy Coach
(taskStrategistAgent.handoffs as any).push(bodyDoublingAgent, energyCoachAgent);
// Body Doubling can hand off back to Energy Coach or Task Strategist
(bodyDoublingAgent.handoffs as any).push(energyCoachAgent, taskStrategistAgent);

export const workspaceBuilderScenario = [
  energyCoachAgent,
  taskStrategistAgent,
  bodyDoublingAgent,
];
