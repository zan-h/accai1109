import { energyCoach } from './energyCoach';
import { taskStrategist } from './taskStrategist';
import { bodyDoublingCompanion } from './bodyDoublingCompanion';

// Wire up bidirectional hand-offs between agents
(energyCoach.handoffs as any).push(taskStrategist, bodyDoublingCompanion);
(taskStrategist.handoffs as any).push(energyCoach, bodyDoublingCompanion);
(bodyDoublingCompanion.handoffs as any).push(energyCoach, taskStrategist);

export const adhdProductivityScenario = [
  energyCoach,
  taskStrategist,
  bodyDoublingCompanion,
];
