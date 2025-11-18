import { AgentSuite } from '@/app/agentConfigs/types';
import { deepWorkForgeSuiteConfig } from './suite.config';
import { anchorAgent } from './agents/anchorAgent';
import { sparkAgent } from './agents/sparkAgent';
import { guideAgent } from './agents/guideAgent';
import { archivistAgent } from './agents/archivistAgent';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up sequential handoffs
const agents = [anchorAgent, sparkAgent, guideAgent, archivistAgent];

// Sequential handoffs: Anchor → Spark → Guide → Archivist
anchorAgent.handoffs = [sparkAgent];
sparkAgent.handoffs = [guideAgent];
guideAgent.handoffs = [archivistAgent];
archivistAgent.handoffs = []; // Final stage, no handoffs

// Export suite
const deepWorkForgeSuite: AgentSuite = {
  ...deepWorkForgeSuiteConfig,
  agents,
  rootAgent: anchorAgent, // Always start with Anchor
  guardrails: [
    createModerationGuardrail('Deep Work Forge'),
  ],
};

export default deepWorkForgeSuite;

