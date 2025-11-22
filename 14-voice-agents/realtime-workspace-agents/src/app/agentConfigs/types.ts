// Central re-exports so agent files don't need to reach deep into the SDK path

import type { RealtimeAgent as RealtimeAgentType } from '@openai/agents/realtime';

export { tool } from '@openai/agents/realtime';
export type { RealtimeAgent, FunctionTool } from '@openai/agents/realtime';

// ============================================
// SUITE TYPES
// ============================================

export type SuiteCategory = 
  | 'productivity'
  | 'mental-health' 
  | 'planning'
  | 'coaching'
  | 'learning'
  | 'creativity';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface WorkspaceTemplate {
  name: string;
  type: 'markdown' | 'csv';
  content: string;
  description?: string;
}

export interface SuiteConfig {
  // Required metadata
  id: string;
  name: string;
  description: string;
  icon: string;
  category: SuiteCategory;
  tags: string[];
  
  // Optional metadata
  disabled?: boolean; // If true, suite won't appear in UI
  suggestedUseCases?: string[];
  userLevel?: UserLevel;
  estimatedSessionLength?: number; // minutes
  author?: string;
  version?: string;
  
  // Workspace configuration
  workspaceTemplates?: WorkspaceTemplate[];
  
  // Suite-specific context
  initialContext?: Record<string, any>;
}

export interface AgentSuite extends SuiteConfig {
  // Agent configuration
  agents: RealtimeAgentType[];
  rootAgent: RealtimeAgentType;
  
  // Optional guardrails
  guardrails?: any[];
}

// Helper type for suite module exports
export interface SuiteModule {
  default: AgentSuite;
  config: SuiteConfig;
  agents: RealtimeAgentType[];
}

// ============================================
// REGISTRY TYPES
// ============================================

export interface SuiteRegistry {
  [suiteId: string]: AgentSuite;
}
