import type { RealtimeAgent } from '@openai/agents/realtime';

import { workspaceBuilderScenario } from './workspaceBuilder';
import { realEstateBrokerScenario, realEstateCompanyName } from './realEstateBroker';
import { chatSupervisorScenario, chatSupervisorCompanyName } from './chatSupervisor';
import { customerServiceRetailScenario, customerServiceRetailCompanyName } from './customerServiceRetail';
import { simpleHandoffScenario } from './simpleHandoff';

export const allAgentSets: Record<string, RealtimeAgent[]> = {
  workspaceBuilder: workspaceBuilderScenario,
  realEstateBroker: realEstateBrokerScenario,
  chatSupervisor: chatSupervisorScenario,
  customerServiceRetail: customerServiceRetailScenario,
  simpleHandoff: simpleHandoffScenario,
};

export const defaultAgentSetKey = 'workspaceBuilder';

export {
  workspaceBuilderScenario,
  realEstateBrokerScenario,
  realEstateCompanyName,
  chatSupervisorScenario,
  chatSupervisorCompanyName,
  customerServiceRetailScenario,
  customerServiceRetailCompanyName,
  simpleHandoffScenario,
};
