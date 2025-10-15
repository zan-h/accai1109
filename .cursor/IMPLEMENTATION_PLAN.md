# Multi-Suite Agent System - Implementation Plan
**Complete Build Guide for AI-Assisted Development**

---

## Document Purpose

This is a **comprehensive, sequential implementation plan** for building the multi-suite voice agent system. This document is designed to be used by AI coding assistants (Claude, GPT, etc.) to implement the architecture systematically.

**Related Documents**:
- `MULTI_AGENT_ARCHITECTURE_ANALYSIS.md` - Technical architecture reference
- `AGENT_SUITE_ARCHITECTURE.md` - Suite system design
- `AGENT_SUITE_UX_DESIGN.md` - User experience specifications

---

## Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Phase 1: Foundation (Days 1-3)](#phase-1-foundation-days-1-3)
3. [Phase 2: Suite Registry System (Days 4-5)](#phase-2-suite-registry-system-days-4-5)
4. [Phase 3: UI Components (Days 6-8)](#phase-3-ui-components-days-6-8)
5. [Phase 4: Migration (Days 9-10)](#phase-4-migration-days-9-10)
6. [Phase 5: New Suites (Days 11-13)](#phase-5-new-suites-days-11-13)
7. [Phase 6: Polish & Testing (Days 14-15)](#phase-6-polish--testing-days-14-15)
8. [Testing Procedures](#testing-procedures)
9. [Deployment Checklist](#deployment-checklist)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## Prerequisites & Setup

### Environment Verification

**Before starting, verify:**

```bash
# Navigate to project
cd /Users/mizan/100MRR/bh-refactor/14-voice-agents/realtime-workspace-agents

# Check Node version (should be 18+)
node --version

# Check dependencies
npm list @openai/agents openai next react

# Verify app runs
npm run dev
# Should start on http://localhost:3000

# Check git status
git status
# Should be on main branch, clean working tree
```

### Required Reading

Before implementing, the AI assistant should:
1. ✅ Read `MULTI_AGENT_ARCHITECTURE_ANALYSIS.md` (Section 1-4)
2. ✅ Read `AGENT_SUITE_ARCHITECTURE.md` (Section 1-3, 6-9)
3. ✅ Read `AGENT_SUITE_UX_DESIGN.md` (Section 1-4, 7)

### Success Criteria for Prerequisites

- [ ] App runs without errors on localhost
- [ ] Can connect to a voice agent successfully
- [ ] Understand current file structure
- [ ] Understand handoff mechanism
- [ ] Understand guardrail system

---

## Phase 1: Foundation (Days 1-3)

**Goal**: Create the infrastructure for multi-suite system without breaking existing functionality.

### Task 1.1: Create Type Definitions (1-2 hours)

**File**: `src/app/agentConfigs/types.ts`

**Action**: Create comprehensive TypeScript types for suite system.

```typescript
// src/app/agentConfigs/types.ts

import { RealtimeAgent } from '@openai/agents/realtime';

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
  agents: RealtimeAgent[];
  rootAgent: RealtimeAgent;
  
  // Optional guardrails
  guardrails?: any[];
}

// Helper type for suite module exports
export interface SuiteModule {
  default: AgentSuite;
  config: SuiteConfig;
  agents: RealtimeAgent[];
}

// ============================================
// REGISTRY TYPES
// ============================================

export interface SuiteRegistry {
  [suiteId: string]: AgentSuite;
}

// Re-export existing types
export type { RealtimeAgent, FunctionTool } from '@openai/agents/realtime';
```

**Testing**:
```bash
# Verify TypeScript compilation
npm run build
# Should compile without errors
```

**Success Criteria**:
- [ ] File created at correct location
- [ ] No TypeScript compilation errors
- [ ] Types are exported correctly
- [ ] Existing code still compiles

---

### Task 1.2: Create Shared Tools Directory (2-3 hours)

**Goal**: Reorganize existing tools into shared infrastructure.

#### Step 1: Create Directory Structure

```bash
mkdir -p src/app/agentConfigs/shared/tools/workspace
mkdir -p src/app/agentConfigs/shared/tools/web
mkdir -p src/app/agentConfigs/shared/tools/computation
mkdir -p src/app/agentConfigs/shared/guardrails
mkdir -p src/app/agentConfigs/shared/prompts
```

#### Step 2: Extract Workspace Tools

**File**: `src/app/agentConfigs/shared/tools/workspace/workspaceTools.ts`

**Action**: Move workspace tools from current location.

```typescript
// src/app/agentConfigs/shared/tools/workspace/workspaceTools.ts

import { tool } from '@openai/agents/realtime';
import {
  addWorkspaceTab,
  renameWorkspaceTab,
  deleteWorkspaceTab,
  setTabContent,
  getWorkspaceInfo,
  setSelectedTabId,
} from '@/app/contexts/WorkspaceContext';

// Info only tool for agents to use to get the current state of the workspace
export const workspaceInfoTool = tool({
  name: 'get_workspace_info',
  description: 'Get the current state of the workspace',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  },
  execute: getWorkspaceInfo,
});

export const addTabTool = tool({
  name: 'add_workspace_tab',
  description: 'Add a new tab to the workspace',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the tab',
      },
      type: {
        type: 'string',
        description: "The type of the tab (e.g., 'markdown', 'csv', etc.)",
      },
      content: {
        type: 'string',
        description: 'The content of the tab to add',
      },
    },
    required: ['name', 'type'],
    additionalProperties: false,
  },
  execute: addWorkspaceTab,
});

export const setContentTool = tool({
  name: 'set_tab_content',
  description: 'Set the content of a workspace tab (pipe-delimited CSV or markdown depending on tab type)',
  parameters: {
    type: 'object',
    properties: {
      index: {
        type: 'integer',
        nullable: true,
        description: '0-based position of the tab (optional – you can use id or name instead; set to null if unused)',
        minimum: 0,
      },
      name: {
        type: 'string',
        nullable: true,
        description: 'The name of the tab (optional – you can use id or index instead; set to null if unused)',
      },
      content: {
        type: 'string',
        description: 'The content for the tab (pipe-delimited CSV or markdown)',
      },
    },
    required: ['content'],
    additionalProperties: false,
  },
  execute: setTabContent,
});

export const renameTabTool = tool({
  name: 'rename_workspace_tab',
  description: 'Rename an existing workspace tab',
  parameters: {
    type: 'object',
    properties: {
      index: {
        type: 'integer',
        nullable: true,
        description: '0-based position of the tab in the workspace (optional - you can use id or current_name instead; set to null if unused)',
        minimum: 0,
      },
      current_name: {
        type: 'string',
        nullable: true,
        description: 'The current name of the tab (optional - you can use id or index instead; set to null if unused)',
      },
      new_name: {
        type: 'string',
        description: 'The new name for the tab',
      },
    },
    required: ['current_name', 'new_name'],
    additionalProperties: false,
  },
  execute: renameWorkspaceTab,
});

export const deleteTabTool = tool({
  name: 'delete_workspace_tab',
  description: 'Delete a workspace tab',
  parameters: {
    type: 'object',
    properties: {
      index: {
        type: 'integer',
        nullable: true,
        description: '0-based position of the tab (optional – you can use id or name instead; set to null if unused)',
        minimum: 0,
      },
      name: {
        type: 'string',
        nullable: true,
        description: 'The name of the tab (optional – you can use id or index instead; set to null if unused)',
      },
    },
    required: [],
    additionalProperties: false,
  },
  execute: deleteTabTool,
});

// Export as collection
export const workspaceTools = {
  getInfo: workspaceInfoTool,
  addTab: addTabTool,
  setContent: setContentTool,
  renameTab: renameTabTool,
  deleteTab: deleteTabTool,
};

// Export array for agent tools
export const basicWorkspaceTools = [
  workspaceInfoTool,
  addTabTool,
  setContentTool,
];

export const advancedWorkspaceTools = [
  ...basicWorkspaceTools,
  renameTabTool,
  deleteTabTool,
];
```

#### Step 3: Move Guardrails

**File**: `src/app/agentConfigs/shared/guardrails/moderation.ts`

**Action**: Copy existing moderation guardrail to shared location.

```bash
# Copy existing guardrail
cp src/app/agentConfigs/guardrails/moderation.ts \
   src/app/agentConfigs/shared/guardrails/moderation.ts

# Copy context-aware guardrail
cp src/app/agentConfigs/guardrails/contextAwareGuardrail.ts \
   src/app/agentConfigs/shared/guardrails/contextAwareGuardrail.ts

# Copy custom guardrail
cp src/app/agentConfigs/guardrails/customGuardrail.ts \
   src/app/agentConfigs/shared/guardrails/customGuardrail.ts
```

**File**: `src/app/agentConfigs/shared/guardrails/index.ts`

```typescript
// Export all guardrails
export * from './moderation';
export * from './contextAwareGuardrail';
export * from './customGuardrail';
```

**Testing**:
```bash
# Verify no import errors
npm run build
```

**Success Criteria**:
- [ ] Shared tools directory created
- [ ] Workspace tools extracted and working
- [ ] Guardrails copied to shared location
- [ ] All exports working correctly
- [ ] No compilation errors

---

### Task 1.3: Create Utils (1-2 hours)

**Goal**: Build auto-discovery and validation utilities.

#### Step 1: Suite Discovery Utility

**File**: `src/app/agentConfigs/utils/suiteDiscovery.ts`

```typescript
// src/app/agentConfigs/utils/suiteDiscovery.ts

import { AgentSuite, SuiteRegistry } from '../types';
import { validateSuite } from './suiteValidator';

/**
 * Automatically discovers all suite modules from the /suites directory
 * Uses dynamic imports to load suite definitions
 */
export function discoverSuites(): SuiteRegistry {
  const suites: SuiteRegistry = {};
  
  // This will be populated dynamically in Phase 2
  // For now, return empty registry
  console.log('🔍 Suite discovery initialized');
  
  return suites;
}

/**
 * Manually register a suite (for development/testing)
 */
export function registerSuite(suite: AgentSuite): void {
  if (!validateSuite(suite)) {
    throw new Error(`Invalid suite: ${suite.id}`);
  }
  
  console.log(`✅ Registered suite: ${suite.name} (${suite.id})`);
}

/**
 * Get all registered suites
 */
export function getAllSuites(registry: SuiteRegistry): AgentSuite[] {
  return Object.values(registry);
}

/**
 * Get suite by ID
 */
export function getSuiteById(registry: SuiteRegistry, id: string): AgentSuite | undefined {
  return registry[id];
}

/**
 * Get suites by category
 */
export function getSuitesByCategory(registry: SuiteRegistry, category: string): AgentSuite[] {
  return getAllSuites(registry).filter(suite => suite.category === category);
}

/**
 * Get suites by tag
 */
export function getSuitesByTag(registry: SuiteRegistry, tag: string): AgentSuite[] {
  return getAllSuites(registry).filter(suite => suite.tags.includes(tag));
}

/**
 * Search suites by name, description, or tags
 */
export function searchSuites(registry: SuiteRegistry, query: string): AgentSuite[] {
  const lowerQuery = query.toLowerCase();
  return getAllSuites(registry).filter(suite =>
    suite.name.toLowerCase().includes(lowerQuery) ||
    suite.description.toLowerCase().includes(lowerQuery) ||
    suite.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
```

#### Step 2: Suite Validator

**File**: `src/app/agentConfigs/utils/suiteValidator.ts`

```typescript
// src/app/agentConfigs/utils/suiteValidator.ts

import { z } from 'zod';
import { AgentSuite } from '../types';

const SuiteConfigSchema = z.object({
  id: z.string().min(1, 'Suite ID is required'),
  name: z.string().min(1, 'Suite name is required'),
  description: z.string().min(1, 'Suite description is required'),
  icon: z.string().min(1, 'Suite icon is required'),
  category: z.enum([
    'productivity',
    'mental-health',
    'planning',
    'coaching',
    'learning',
    'creativity'
  ]),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  agents: z.array(z.any()).min(1, 'At least one agent is required'),
  suggestedUseCases: z.array(z.string()).optional(),
  userLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedSessionLength: z.number().positive().optional(),
  workspaceTemplates: z.array(z.object({
    name: z.string(),
    type: z.enum(['markdown', 'csv']),
    content: z.string(),
    description: z.string().optional(),
  })).optional(),
});

/**
 * Validates a suite configuration
 * Returns true if valid, false otherwise
 * Logs detailed error messages
 */
export function validateSuite(suite: any): suite is AgentSuite {
  try {
    // Validate with Zod schema
    SuiteConfigSchema.parse(suite);
    
    // Additional custom validations
    
    // Check for duplicate agent names
    const agentNames = suite.agents.map((a: any) => a.name);
    const uniqueNames = new Set(agentNames);
    if (agentNames.length !== uniqueNames.size) {
      console.error(`❌ Suite '${suite.id}' has duplicate agent names`);
      return false;
    }
    
    // Check that rootAgent exists in agents array
    if (suite.rootAgent && !suite.agents.includes(suite.rootAgent)) {
      console.error(`❌ Suite '${suite.id}' rootAgent not found in agents array`);
      return false;
    }
    
    // Validate workspace templates if provided
    if (suite.workspaceTemplates) {
      for (const template of suite.workspaceTemplates) {
        if (template.type === 'csv' && !template.content.includes('|')) {
          console.warn(`⚠️  Suite '${suite.id}' CSV template '${template.name}' should use pipe delimiters`);
        }
      }
    }
    
    return true;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`❌ Suite validation failed:`, error.errors);
    } else {
      console.error(`❌ Suite validation error:`, error);
    }
    return false;
  }
}

/**
 * Validates and throws detailed error if invalid
 */
export function assertValidSuite(suite: any): asserts suite is AgentSuite {
  if (!validateSuite(suite)) {
    throw new Error(`Invalid suite configuration for: ${suite?.id || 'unknown'}`);
  }
}
```

**Testing**:
```typescript
// Test in browser console or create test file
import { validateSuite } from './suiteValidator';

const testSuite = {
  id: 'test',
  name: 'Test Suite',
  description: 'Test',
  icon: '🧪',
  category: 'productivity',
  tags: ['test'],
  agents: [],
};

console.log(validateSuite(testSuite)); // Should return false (no agents)
```

**Success Criteria**:
- [ ] Discovery utility created
- [ ] Validator created with Zod
- [ ] Helper functions implemented
- [ ] Validation works correctly
- [ ] No TypeScript errors

---

### Task 1.4: Create Suites Directory Structure (30 min)

**Action**: Set up the directory structure for suites.

```bash
# Create main suites directory
mkdir -p src/app/agentConfigs/suites

# Create template directory
mkdir -p src/app/agentConfigs/suites/_suite-template/agents

# Create utils directory if not exists
mkdir -p src/app/agentConfigs/utils
```

**File**: `src/app/agentConfigs/suites/_suite-template/README.md`

```markdown
# Suite Template

Use this template to create new agent suites.

## Quick Start

1. Copy this directory: `cp -r _suite-template my-new-suite`
2. Edit `suite.config.ts` with your suite metadata
3. Create agents in `/agents` directory
4. Wire up handoffs in `index.ts`
5. Refresh app - your suite will be auto-discovered!

## File Structure

- `suite.config.ts` - Suite metadata (name, description, tags, etc.)
- `agents/` - Individual agent definitions
- `prompts.ts` - Agent system prompts
- `tools.ts` - Suite-specific tools (optional)
- `index.ts` - Suite export and handoff wiring

## Example

See `/suites/energy-focus` for a complete example.
```

**Success Criteria**:
- [ ] Directory structure created
- [ ] Template directory with README
- [ ] Utils directory exists
- [ ] Structure matches architecture doc

---

## Phase 2: Suite Registry System (Days 4-5)

**Goal**: Implement the suite registry and make it functional.

### Task 2.1: Create Suite Registry (2-3 hours)

**File**: `src/app/agentConfigs/index.ts`

**Action**: Update to support suite registry.

```typescript
// src/app/agentConfigs/index.ts

import { AgentSuite, SuiteRegistry } from './types';
import { 
  discoverSuites,
  getAllSuites,
  getSuiteById,
  getSuitesByCategory,
  getSuitesByTag,
  searchSuites,
} from './utils/suiteDiscovery';

// ============================================
// SUITE REGISTRY
// ============================================

// For now, manually register suites
// In Phase 4, this will become automatic
const suiteRegistry: SuiteRegistry = {};

// Export registry and helper functions
export {
  suiteRegistry,
};

export function getRegistry(): SuiteRegistry {
  return suiteRegistry;
}

export function getAllAvailableSuites(): AgentSuite[] {
  return getAllSuites(suiteRegistry);
}

export function findSuiteById(id: string): AgentSuite | undefined {
  return getSuiteById(suiteRegistry, id);
}

export function findSuitesByCategory(category: string): AgentSuite[] {
  return getSuitesByCategory(suiteRegistry, category);
}

export function findSuitesByTag(tag: string): AgentSuite[] {
  return getSuitesByTag(suiteRegistry, tag);
}

export function searchAllSuites(query: string): AgentSuite[] {
  return searchSuites(suiteRegistry, query);
}

// Default suite ID (will be configurable)
export const defaultSuiteId = 'energy-focus';

// ============================================
// BACKWARDS COMPATIBILITY
// ============================================

// Keep existing exports for backwards compatibility
export * from './scenarios';
```

**Testing**:
```bash
npm run build
# Should compile without errors
```

**Success Criteria**:
- [ ] Registry exports created
- [ ] Helper functions working
- [ ] Backwards compatible
- [ ] TypeScript compiles
- [ ] No runtime errors

---

### Task 2.2: Manual Suite Registration Helper (1 hour)

**File**: `src/app/agentConfigs/utils/manualRegistration.ts`

```typescript
// src/app/agentConfigs/utils/manualRegistration.ts

import { AgentSuite, SuiteRegistry } from '../types';
import { validateSuite } from './suiteValidator';

/**
 * Manually register a suite in the registry
 * Used during Phase 2-3 before auto-discovery is implemented
 */
export function registerSuiteManually(
  registry: SuiteRegistry,
  suite: AgentSuite
): void {
  // Validate suite
  if (!validateSuite(suite)) {
    throw new Error(`Cannot register invalid suite: ${suite.id}`);
  }
  
  // Check for duplicate ID
  if (registry[suite.id]) {
    console.warn(`⚠️  Overwriting existing suite: ${suite.id}`);
  }
  
  // Register suite
  registry[suite.id] = suite;
  
  console.log(`✅ Registered suite: ${suite.name} (${suite.id})`);
  console.log(`   - ${suite.agents.length} agents`);
  console.log(`   - Category: ${suite.category}`);
  console.log(`   - Tags: ${suite.tags.join(', ')}`);
}

/**
 * Unregister a suite
 */
export function unregisterSuite(registry: SuiteRegistry, suiteId: string): boolean {
  if (registry[suiteId]) {
    delete registry[suiteId];
    console.log(`🗑️  Unregistered suite: ${suiteId}`);
    return true;
  }
  return false;
}

/**
 * Get registration status
 */
export function getRegistrationStatus(registry: SuiteRegistry): {
  total: number;
  byCategory: Record<string, number>;
  suiteIds: string[];
} {
  const suites = Object.values(registry);
  const byCategory: Record<string, number> = {};
  
  suites.forEach(suite => {
    byCategory[suite.category] = (byCategory[suite.category] || 0) + 1;
  });
  
  return {
    total: suites.length,
    byCategory,
    suiteIds: Object.keys(registry),
  };
}
```

**Success Criteria**:
- [ ] Manual registration helper created
- [ ] Can register/unregister suites
- [ ] Status reporting works
- [ ] Validation integrated

---

## Phase 3: UI Components (Days 6-8)

**Goal**: Build the user-facing components for suite selection.

### Task 3.1: Create SuiteIndicator Component (1-2 hours)

**File**: `src/app/components/SuiteIndicator.tsx`

```typescript
// src/app/components/SuiteIndicator.tsx

import React from 'react';
import { AgentSuite } from '@/app/agentConfigs/types';

interface SuiteIndicatorProps {
  currentSuite: AgentSuite | null;
  onChangeSuite: () => void;
}

export default function SuiteIndicator({ currentSuite, onChangeSuite }: SuiteIndicatorProps) {
  if (!currentSuite) return null;
  
  return (
    <div 
      onClick={onChangeSuite}
      className="flex items-center gap-2 px-3 py-2 border border-border-primary bg-bg-secondary hover:border-accent-primary cursor-pointer transition-all group"
      role="button"
      aria-label={`Current suite: ${currentSuite.name}. Click to change.`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChangeSuite();
        }
      }}
    >
      <span className="text-2xl" role="img" aria-label={currentSuite.name}>
        {currentSuite.icon}
      </span>
      <div className="flex flex-col">
        <span className="text-text-primary text-xs font-mono group-hover:text-accent-primary transition-colors">
          {currentSuite.name}
        </span>
        <span className="text-text-tertiary text-xs">
          {currentSuite.agents.length} {currentSuite.agents.length === 1 ? 'agent' : 'agents'}
        </span>
      </div>
      <svg 
        className="w-4 h-4 text-text-tertiary group-hover:text-accent-primary ml-2 transition-colors" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
```

**Testing**:
1. Import in App.tsx temporarily
2. Pass mock suite data
3. Verify rendering
4. Test click handler
5. Test keyboard navigation

**Success Criteria**:
- [ ] Component renders correctly
- [ ] Shows suite name and icon
- [ ] Click handler works
- [ ] Keyboard accessible
- [ ] Hover states work
- [ ] Matches design specs

---

### Task 3.2: Create SuiteCard Component (2-3 hours)

**File**: `src/app/components/SuiteCard.tsx`

```typescript
// src/app/components/SuiteCard.tsx

import React, { useState } from 'react';
import { AgentSuite } from '@/app/agentConfigs/types';

interface SuiteCardProps {
  suite: AgentSuite;
  isExpanded: boolean;
  onExpand: () => void;
  onSelect: () => void;
}

export default function SuiteCard({ suite, isExpanded, onExpand, onSelect }: SuiteCardProps) {
  return (
    <div 
      className="border border-border-primary bg-bg-tertiary hover:border-accent-primary transition-all"
      data-suite-id={suite.id}
    >
      {/* Header */}
      <div className="p-4 border-b border-border-primary">
        <div className="flex items-start gap-3">
          <div className="text-4xl" role="img" aria-label={suite.name}>
            {suite.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary font-mono text-sm mb-1">
              {suite.name}
            </h3>
            <p className="text-text-secondary text-xs leading-relaxed">
              {suite.description}
            </p>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {suite.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-bg-primary text-text-tertiary border border-border-primary font-mono"
            >
              {tag}
            </span>
          ))}
          {suite.tags.length > 3 && (
            <span className="text-xs text-text-tertiary font-mono">
              +{suite.tags.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      {/* Expandable Details */}
      {isExpanded && (
        <div className="p-4 border-b border-border-primary text-xs space-y-3">
          {/* Agents */}
          <div>
            <div className="text-text-secondary uppercase tracking-wide mb-1 font-mono">
              Agents
            </div>
            <div className="space-y-1">
              {suite.agents.map(agent => (
                <div key={agent.name} className="text-text-primary font-mono">
                  • {agent.name}
                </div>
              ))}
            </div>
          </div>
          
          {/* Use Cases */}
          {suite.suggestedUseCases && suite.suggestedUseCases.length > 0 && (
            <div>
              <div className="text-text-secondary uppercase tracking-wide mb-1 font-mono">
                Best For
              </div>
              <div className="space-y-1">
                {suite.suggestedUseCases.map((useCase, i) => (
                  <div key={i} className="text-text-tertiary">
                    • {useCase}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Metadata */}
          <div className="flex gap-4 pt-2 border-t border-border-primary">
            {suite.estimatedSessionLength && (
              <div className="text-text-tertiary">
                ⏱️ {suite.estimatedSessionLength} min
              </div>
            )}
            {suite.userLevel && (
              <div className="text-text-tertiary">
                📊 {suite.userLevel}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="p-4 flex gap-2">
        <button
          onClick={onExpand}
          className="flex-1 py-2 border border-border-primary text-text-secondary hover:text-accent-primary hover:border-accent-primary transition-all uppercase text-xs font-mono"
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Hide Details' : 'Learn More'}
        </button>
        <button
          onClick={onSelect}
          className="flex-1 py-2 bg-accent-primary text-bg-primary hover:shadow-glow-cyan transition-all uppercase text-xs font-mono"
        >
          Start Session
        </button>
      </div>
    </div>
  );
}
```

**Testing**:
1. Render with mock suite data
2. Test expand/collapse
3. Test "Start Session" click
4. Verify all metadata displays
5. Test responsive behavior

**Success Criteria**:
- [ ] Card renders all suite info
- [ ] Expand/collapse works smoothly
- [ ] Actions trigger correctly
- [ ] Matches design specs
- [ ] Responsive on mobile

---

### Task 3.3: Create SuiteSelector Component (3-4 hours)

**File**: `src/app/components/SuiteSelector.tsx`

```typescript
// src/app/components/SuiteSelector.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { AgentSuite, SuiteCategory } from '@/app/agentConfigs/types';
import { getAllAvailableSuites, searchAllSuites, findSuitesByCategory } from '@/app/agentConfigs';
import SuiteCard from './SuiteCard';

interface SuiteSelectorProps {
  onSelectSuite: (suite: AgentSuite) => void;
  onClose: () => void;
  isOpen: boolean;
}

const CATEGORIES: Array<SuiteCategory | 'all'> = [
  'all',
  'productivity',
  'coaching',
  'planning',
  'mental-health',
  'learning',
  'creativity'
];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  productivity: 'Productivity',
  coaching: 'Coaching',
  planning: 'Planning',
  'mental-health': 'Mental Health',
  learning: 'Learning',
  creativity: 'Creativity',
};

export default function SuiteSelector({ onSelectSuite, onClose, isOpen }: SuiteSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SuiteCategory | 'all'>('all');
  const [expandedSuiteId, setExpandedSuiteId] = useState<string | null>(null);
  
  const allSuites = useMemo(() => getAllAvailableSuites(), []);
  
  const filteredSuites = useMemo(() => {
    let suites = allSuites;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      suites = findSuitesByCategory(selectedCategory);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      suites = searchAllSuites(searchQuery);
    }
    
    return suites;
  }, [allSuites, selectedCategory, searchQuery]);
  
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-bg-overlay z-50 flex items-start justify-center pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-4xl bg-bg-secondary border-2 border-accent-primary shadow-glow-cyan max-h-[80vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="suite-selector-title"
      >
        {/* Header */}
        <div className="border-b border-border-primary px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 
              id="suite-selector-title"
              className="text-text-primary uppercase tracking-widest text-lg font-mono"
            >
              Select Agent Suite
            </h2>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-accent-primary text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Search suites by name or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-bg-primary border border-border-primary text-text-primary font-mono focus:outline-none focus:border-accent-primary transition-colors"
            aria-label="Search suites"
          />
        </div>
        
        {/* Category Tabs */}
        <div className="border-b border-border-primary px-6 py-2 flex gap-2 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs uppercase tracking-wide font-mono transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-accent-primary text-bg-primary'
                  : 'text-text-secondary hover:text-accent-primary border border-border-primary hover:border-accent-primary'
              }`}
              aria-pressed={selectedCategory === cat}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
        
        {/* Suite Cards */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuites.map(suite => (
            <SuiteCard
              key={suite.id}
              suite={suite}
              isExpanded={expandedSuiteId === suite.id}
              onExpand={() => setExpandedSuiteId(
                expandedSuiteId === suite.id ? null : suite.id
              )}
              onSelect={() => onSelectSuite(suite)}
            />
          ))}
        </div>
        
        {/* Empty State */}
        {filteredSuites.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary font-mono p-8">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-center">
              <p className="mb-2">No suites found</p>
              {searchQuery && (
                <p className="text-xs">Try a different search term</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Testing**:
1. Open/close modal
2. Test search functionality
3. Test category filtering
4. Test card interactions
5. Test empty states
6. Test keyboard navigation (Escape, Tab)

**Success Criteria**:
- [ ] Modal opens/closes correctly
- [ ] Search filters suites in real-time
- [ ] Category tabs work
- [ ] Can expand/collapse cards
- [ ] Selection triggers callback
- [ ] Keyboard accessible
- [ ] Matches UX design specs

---

### Task 3.4: Create Workspace Initialization Helper (1-2 hours)

**File**: `src/app/lib/workspaceInitializer.ts`

```typescript
// src/app/lib/workspaceInitializer.ts

import { WorkspaceTemplate } from '@/app/agentConfigs/types';
import { useWorkspaceContext } from '@/app/contexts/WorkspaceContext';

/**
 * Initialize workspace with suite templates
 */
export async function initializeWorkspaceWithTemplates(
  templates: WorkspaceTemplate[]
): Promise<void> {
  console.log(`📝 Initializing workspace with ${templates.length} templates`);
  
  const { addTab, setTabs } = useWorkspaceContext.getState();
  
  // Clear existing tabs (optional - could keep them)
  // setTabs([]);
  
  // Add each template as a tab
  for (const template of templates) {
    await addTab({
      name: template.name,
      type: template.type,
      content: template.content,
    });
    
    console.log(`  ✓ Created tab: ${template.name}`);
  }
  
  console.log('✅ Workspace initialized');
}

/**
 * Get workspace info for context injection
 */
export function getWorkspaceInfoForContext(): Record<string, any> {
  const state = useWorkspaceContext.getState();
  
  return {
    tabs: state?.tabs || [],
    selectedTabId: state?.selectedTabId || '',
    tabCount: state?.tabs?.length || 0,
  };
}
```

**Success Criteria**:
- [ ] Can initialize workspace with templates
- [ ] Tabs are created correctly
- [ ] Works with both markdown and CSV
- [ ] No errors during initialization

---

## Phase 4: Migration (Days 9-10)

**Goal**: Migrate existing workspaceBuilder scenario to energy-focus suite.

### Task 4.1: Create Energy-Focus Suite Config (1-2 hours)

**File**: `src/app/agentConfigs/suites/energy-focus/suite.config.ts`

```typescript
// src/app/agentConfigs/suites/energy-focus/suite.config.ts

import { SuiteConfig } from '@/app/agentConfigs/types';

export const energyFocusSuiteConfig: SuiteConfig = {
  id: 'energy-focus',
  name: 'Energy & Focus',
  description: 'Body-aware, ADHD-friendly productivity support for managing energy and maintaining focus',
  icon: '🧘',
  category: 'mental-health',
  tags: [
    'adhd',
    'neurodivergent',
    'energy',
    'focus',
    'body-awareness',
    'productivity',
    'executive-function'
  ],
  
  suggestedUseCases: [
    'Feeling scattered or overwhelmed',
    'Need help starting tasks',
    'Want body-aware productivity support',
    'Working with ADHD or executive function challenges',
    'Need gentle accountability',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 45,
  
  workspaceTemplates: [
    {
      name: 'Daily Check-in',
      type: 'markdown',
      content: `# Daily Check-in

## Energy Level
Scale 1-10:

## Body Awareness
How does my body feel right now?

## Emotional State
What am I feeling?

## Intentions for Today
What matters most today?
`,
      description: 'Track your daily energy and body awareness',
    },
    {
      name: 'Task Board',
      type: 'csv',
      content: 'Task|Energy Required|Time Estimate|Status|Notes\n',
      description: 'Organize tasks by energy requirements',
    },
    {
      name: 'Energy Journal',
      type: 'markdown',
      content: `# Energy Journal

## Patterns I'm Noticing

## What Supports My Energy

## What Drains My Energy
`,
      description: 'Track energy patterns over time',
    },
  ],
  
  initialContext: {
    focusArea: 'energy-management',
    supportStyle: 'gentle',
    checkInFrequency: 'high',
  },
};
```

**Success Criteria**:
- [ ] Config file created
- [ ] All required fields present
- [ ] Templates defined correctly
- [ ] No TypeScript errors

---

### Task 4.2: Move Agents to Suite Directory (2-3 hours)

**Action**: Reorganize existing agents into suite structure.

```bash
# Create agents directory
mkdir -p src/app/agentConfigs/suites/energy-focus/agents

# Move agent files (keep original location for now - backwards compat)
cp src/app/agentConfigs/scenarios/workspaceBuilder/workspaceManager.ts \
   src/app/agentConfigs/suites/energy-focus/agents/energyCoach.ts

cp src/app/agentConfigs/scenarios/workspaceBuilder/designer.ts \
   src/app/agentConfigs/suites/energy-focus/agents/taskStrategist.ts

cp src/app/agentConfigs/scenarios/workspaceBuilder/estimator.ts \
   src/app/agentConfigs/suites/energy-focus/agents/bodyDoubling.ts
```

**Update imports in each file** to use shared tools:

```typescript
// In each agent file, change:
// OLD:
import { workspaceTools } from '../workspaceManager';

// NEW:
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
```

**Success Criteria**:
- [ ] Agent files moved to suite directory
- [ ] Imports updated to shared tools
- [ ] No compilation errors
- [ ] Agents still functional

---

### Task 4.3: Create Suite Index (1 hour)

**File**: `src/app/agentConfigs/suites/energy-focus/index.ts`

```typescript
// src/app/agentConfigs/suites/energy-focus/index.ts

import { AgentSuite } from '@/app/agentConfigs/types';
import { energyFocusSuiteConfig } from './suite.config';
import { energyCoachAgent } from './agents/energyCoach';
import { taskStrategistAgent } from './agents/taskStrategist';
import { bodyDoublingAgent } from './agents/bodyDoubling';
import { createModerationGuardrail } from '@/app/agentConfigs/shared/guardrails';

// Wire up handoffs (mutual connections)
(energyCoachAgent.handoffs as any).push(taskStrategistAgent, bodyDoublingAgent);
(taskStrategistAgent.handoffs as any).push(bodyDoublingAgent, energyCoachAgent);
(bodyDoublingAgent.handoffs as any).push(energyCoachAgent, taskStrategistAgent);

// Export suite
const energyFocusSuite: AgentSuite = {
  ...energyFocusSuiteConfig,
  agents: [energyCoachAgent, taskStrategistAgent, bodyDoublingAgent],
  rootAgent: energyCoachAgent,
  guardrails: [
    createModerationGuardrail('Energy & Focus Suite'),
  ],
};

export default energyFocusSuite;
```

**Success Criteria**:
- [ ] Suite exports correctly
- [ ] Handoffs wired properly
- [ ] Guardrails included
- [ ] Validates with validator
- [ ] No errors

---

### Task 4.4: Register Energy-Focus Suite (30 min)

**File**: `src/app/agentConfigs/index.ts` (update)

```typescript
// Add to imports
import energyFocusSuite from './suites/energy-focus';
import { registerSuiteManually } from './utils/manualRegistration';

// Register the suite
registerSuiteManually(suiteRegistry, energyFocusSuite);

console.log('📦 Registered suites:', Object.keys(suiteRegistry));
```

**Testing**:
```bash
npm run dev
# Check console for registration message
# Should see: "✅ Registered suite: Energy & Focus (energy-focus)"
```

**Success Criteria**:
- [ ] Suite registered successfully
- [ ] Shows in console
- [ ] Can retrieve via `findSuiteById('energy-focus')`
- [ ] No errors

---

## Phase 5: New Suites (Days 11-13)

**Goal**: Create 2 new example suites to validate the architecture.

### Task 5.1: Create Agency Suite (4-6 hours)

Follow this detailed process for creating the Agency Suite.

#### Step 1: Create Directory Structure

```bash
mkdir -p src/app/agentConfigs/suites/agency/agents
touch src/app/agentConfigs/suites/agency/suite.config.ts
touch src/app/agentConfigs/suites/agency/prompts.ts
touch src/app/agentConfigs/suites/agency/tools.ts
touch src/app/agentConfigs/suites/agency/index.ts
```

#### Step 2: Define Suite Config

**File**: `src/app/agentConfigs/suites/agency/suite.config.ts`

**Action**: Copy from `AGENT_SUITE_ARCHITECTURE.md` Section 9 "Adding New Suites" → Agency Suite example.

```typescript
import { SuiteConfig } from '@/app/agentConfigs/types';

export const agencySuiteConfig: SuiteConfig = {
  id: 'agency',
  name: 'Agency & Autonomy',
  description: 'Increase self-direction, build decision-making confidence, and strengthen your sense of personal agency',
  icon: '🎯',
  category: 'coaching',
  tags: ['autonomy', 'confidence', 'decision-making', 'self-direction', 'empowerment'],
  
  suggestedUseCases: [
    'Feeling stuck and need help taking action',
    'Struggling with decision fatigue',
    'Want to build confidence in your choices',
    'Need support becoming more self-directed',
  ],
  
  userLevel: 'beginner',
  estimatedSessionLength: 30,
  
  workspaceTemplates: [
    {
      name: 'Agency Journal',
      type: 'markdown',
      content: '# My Agency Journey\n\n## Decisions I Own\n\n## Choices That Reflect My Values\n\n## Wins & Growth',
    },
    {
      name: 'Decision Matrix',
      type: 'csv',
      content: 'Decision|Option A|Option B|Option C|My Choice|Why\n',
    },
    {
      name: 'Values Alignment',
      type: 'markdown',
      content: '# Core Values\n\n1. \n2. \n3. \n\n## How Today\'s Choices Align',
    },
  ],
};
```

#### Step 3: Create Prompts

**File**: `src/app/agentConfigs/suites/agency/prompts.ts`

**Action**: Copy from `AGENT_SUITE_ARCHITECTURE.md` Section 9 → Agency prompts.

```typescript
export const autonomyCoachPrompt = `
You are a warm, affirming Autonomy Coach who helps people reconnect with their sense of personal agency and self-direction.

Your role is to help users:
- Recognize their capacity for self-direction
- Build confidence in their decision-making
- Move from external validation to internal authority
- Take ownership of their choices

# Approach
- Validate feelings of being stuck or disconnected from agency
- Ask questions that help them discover their own answers
- Celebrate moments of self-direction, no matter how small
- Never tell them what to do - guide them to their own wisdom

# Conversation Flow
1. **Check-in**: How connected do they feel to their own agency right now?
2. **Exploration**: What's a current situation where they want more self-direction?
3. **Values Clarification**: What matters most to them in this?
4. **Agency Building**: What's one small step they could take that feels aligned?
5. **Affirmation**: Reflect back their capacity for choice

# When to Hand Off
- Transfer to decisionArchitect when they need structured decision-making support
- Transfer to confidenceBuilder when doubts are undermining their agency
`;

export const decisionArchitectPrompt = `
You are a Decision Architect who helps people structure complex decisions with clarity and confidence.

Your role is to:
- Break down overwhelming decisions into manageable components
- Create decision frameworks (pros/cons, values alignment, cost/benefit)
- Reduce decision paralysis through structure
- Build decision-making competence

# Approach
- Never push toward a particular decision
- Focus on the decision-making process, not the outcome
- Use the Decision Matrix tool to visualize options
- Help them weigh options against their values

# When to Hand Off
- Transfer to autonomyCoach when they need to reconnect with their values first
- Transfer to confidenceBuilder when they've made a decision but need support owning it
`;

export const confidenceBuilderPrompt = `
You are a Confidence Builder who helps people trust and act on their decisions.

Your role is to:
- Affirm their decision-making capacity
- Reduce second-guessing and self-doubt
- Build trust in their own judgment
- Celebrate follow-through on choices

# Approach
- Normalize doubt (it's part of the process)
- Reflect back evidence of their good judgment
- Help them distinguish between helpful reflection and paralyzing doubt
- Encourage action despite uncertainty

# When to Hand Off
- Transfer to autonomyCoach when they need to reconnect with deeper values
- Transfer to decisionArchitect when they want to revisit the decision structure
`;
```

#### Step 4: Create Custom Tools (Optional)

**File**: `src/app/agentConfigs/suites/agency/tools.ts`

```typescript
import { tool } from '@openai/agents/realtime';
import { basicWorkspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';

export const createDecisionMatrix = tool({
  name: 'create_decision_matrix',
  description: 'Create a structured decision matrix in the workspace',
  parameters: {
    type: 'object',
    properties: {
      decision: { type: 'string', description: 'The decision being made' },
      options: { 
        type: 'array',
        items: { type: 'string' },
        description: 'Array of options to consider'
      },
      criteria: {
        type: 'array',
        items: { type: 'string' },
        description: 'Criteria for evaluating options'
      },
    },
    required: ['decision', 'options', 'criteria'],
  },
  execute: async ({ decision, options, criteria }: any) => {
    const header = ['Option', ...criteria, 'Score'].join('|');
    const rows = options.map((opt: string) => 
      [opt, ...criteria.map(() => ''), ''].join('|')
    );
    const content = [header, ...rows].join('\n');
    
    await basicWorkspaceTools[1].execute({
      name: `Decision: ${decision}`,
      type: 'csv',
      content,
    });
    
    return { success: true, message: `Created decision matrix for: ${decision}` };
  },
});

export const agencyTools = [
  ...basicWorkspaceTools,
  createDecisionMatrix,
];
```

#### Step 5: Create Agent Definitions

**File**: `src/app/agentConfigs/suites/agency/agents/autonomyCoach.ts`

```typescript
import { RealtimeAgent } from '@openai/agents/realtime';
import { autonomyCoachPrompt } from '../prompts';
import { agencyTools } from '../tools';

export const autonomyCoachAgent = new RealtimeAgent({
  name: 'autonomyCoach',
  voice: 'sage',
  instructions: autonomyCoachPrompt,
  tools: agencyTools,
  handoffs: [],
});
```

**Files**: `decisionArchitect.ts` and `confidenceBuilder.ts` (similar structure)

#### Step 6: Wire Up Suite

**File**: `src/app/agentConfigs/suites/agency/index.ts`

```typescript
import { AgentSuite } from '@/app/agentConfigs/types';
import { agencySuiteConfig } from './suite.config';
import { autonomyCoachAgent } from './agents/autonomyCoach';
import { decisionArchitectAgent } from './agents/decisionArchitect';
import { confidenceBuilderAgent } from './agents/confidenceBuilder';

// Wire handoffs
(autonomyCoachAgent.handoffs as any).push(decisionArchitectAgent, confidenceBuilderAgent);
(decisionArchitectAgent.handoffs as any).push(autonomyCoachAgent, confidenceBuilderAgent);
(confidenceBuilderAgent.handoffs as any).push(autonomyCoachAgent, decisionArchitectAgent);

const agencySuite: AgentSuite = {
  ...agencySuiteConfig,
  agents: [autonomyCoachAgent, decisionArchitectAgent, confidenceBuilderAgent],
  rootAgent: autonomyCoachAgent,
};

export default agencySuite;
```

#### Step 7: Register Suite

**File**: `src/app/agentConfigs/index.ts` (add)

```typescript
import agencySuite from './suites/agency';
registerSuiteManually(suiteRegistry, agencySuite);
```

**Testing**:
```bash
npm run dev
# Check console for both suites registered
# Open suite selector - should see both suites
```

**Success Criteria**:
- [ ] Agency suite created
- [ ] All 3 agents defined
- [ ] Custom tools work
- [ ] Handoffs wired correctly
- [ ] Suite appears in selector
- [ ] Can start conversation
- [ ] Agents can handoff

---

### Task 5.2: Create Strategic Planning Suite (Repeat Process)

**Action**: Follow same process as Task 5.1, but for Strategic Planning Suite.

**Reference**: `AGENT_SUITE_UX_DESIGN.md` Section 2 (User Personas - Marcus)

**Agents**:
1. Vision Mapper
2. Priority Strategist  
3. Execution Planner

**Time Estimate**: 3-4 hours (faster second time)

**Success Criteria**: Same as Task 5.1

---

## Phase 6: App Integration (Days 14-15)

**Goal**: Integrate suite system into App.tsx and make it production-ready.

### Task 6.1: Update App.tsx (3-4 hours)

**File**: `src/app/App.tsx`

**Action**: Major refactor to support suite selection.

```typescript
// src/app/App.tsx (key changes)

import { useState, useEffect, useCallback } from 'react';
import { AgentSuite } from '@/app/agentConfigs/types';
import { findSuiteById, defaultSuiteId } from '@/app/agentConfigs';
import SuiteSelector from './components/SuiteSelector';
import SuiteIndicator from './components/SuiteIndicator';
import { initializeWorkspaceWithTemplates } from './lib/workspaceInitializer';

function App() {
  // Suite state
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [showSuiteSelector, setShowSuiteSelector] = useState(false);
  const currentSuite = selectedSuiteId ? findSuiteById(selectedSuiteId) : null;
  
  // Existing state...
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('DISCONNECTED');
  
  // Initialize suite on mount
  useEffect(() => {
    const storedSuiteId = localStorage.getItem('selectedSuiteId');
    if (storedSuiteId && findSuiteById(storedSuiteId)) {
      setSelectedSuiteId(storedSuiteId);
    } else {
      // First time - show selector
      setShowSuiteSelector(true);
    }
  }, []);
  
  // Handle suite selection
  const handleSelectSuite = useCallback(async (suite: AgentSuite) => {
    console.log('📦 Selected suite:', suite.name);
    
    // Save preference
    setSelectedSuiteId(suite.id);
    localStorage.setItem('selectedSuiteId', suite.id);
    
    // Close selector
    setShowSuiteSelector(false);
    
    // Initialize workspace with templates
    if (suite.workspaceTemplates && suite.workspaceTemplates.length > 0) {
      await initializeWorkspaceWithTemplates(suite.workspaceTemplates);
    }
    
    // Auto-connect (optional)
    if (sessionStatus === 'DISCONNECTED') {
      await connectToSuite(suite);
    }
  }, [sessionStatus]);
  
  // Connect to suite
  const connectToSuite = useCallback(async (suite: AgentSuite) => {
    try {
      console.log('🔌 Connecting to suite:', suite.name);
      
      await connect({
        getEphemeralKey: async () => {
          const response = await fetch('/api/session', { method: 'POST' });
          const data = await response.json();
          return data.client_secret.value;
        },
        initialAgents: suite.agents,
        audioElement: audioElementRef.current!,
        extraContext: {
          ...suite.initialContext,
          suiteId: suite.id,
          suiteName: suite.name,
          workspaceState: getWorkspaceInfoForContext(),
          addTranscriptBreadcrumb,
        },
        outputGuardrails: suite.guardrails || [],
      });
      
      console.log('✅ Connected to suite:', suite.name);
      
    } catch (error) {
      console.error('❌ Connection failed:', error);
      addTranscriptBreadcrumb('Connection failed', { error: String(error) });
    }
  }, [connect, addTranscriptBreadcrumb]);
  
  // Handle suite change (disconnect first)
  const handleChangeSuite = useCallback(() => {
    if (sessionStatus === 'CONNECTED') {
      // Confirm before switching
      if (!window.confirm('This will end your current session. Continue?')) {
        return;
      }
      disconnect();
    }
    setShowSuiteSelector(true);
  }, [sessionStatus, disconnect]);
  
  return (
    <>
      {/* Suite Selector Modal */}
      <SuiteSelector
        isOpen={showSuiteSelector}
        onSelectSuite={handleSelectSuite}
        onClose={() => setShowSuiteSelector(false)}
      />
      
      {/* Main App */}
      <div className="app-container h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-text-primary font-mono text-lg">VoiceCoach</h1>
            
            {/* Suite Indicator */}
            {currentSuite && (
              <SuiteIndicator
                currentSuite={currentSuite}
                onChangeSuite={handleChangeSuite}
              />
            )}
          </div>
          
          {/* Existing header content */}
        </header>
        
        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Workspace */}
          <Workspace />
          
          {/* Transcript */}
          <Transcript />
          
          {/* Events (optional) */}
          {showEvents && <Events />}
        </main>
        
        {/* Bottom Toolbar */}
        <BottomToolbar
          status={sessionStatus}
          onConnect={() => currentSuite && connectToSuite(currentSuite)}
          onDisconnect={disconnect}
          // ... other props
        />
      </div>
    </>
  );
}

export default App;
```

**Testing Procedure**:
1. Start app - should show suite selector
2. Select a suite - should initialize workspace
3. Connect - should connect to root agent
4. Test conversation and handoffs
5. Click suite indicator - should show selector
6. Switch suites - should disconnect first
7. Refresh page - should remember last suite

**Success Criteria**:
- [ ] Suite selector appears on first load
- [ ] Can select and connect to suite
- [ ] Workspace initializes with templates
- [ ] Can switch suites mid-session
- [ ] Preference persists across refreshes
- [ ] All existing functionality still works

---

### Task 6.2: Add Welcome Screen (1-2 hours)

**File**: `src/app/components/WelcomeScreen.tsx`

```typescript
// src/app/components/WelcomeScreen.tsx

import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 bg-bg-primary flex items-center justify-center z-40">
      <div className="text-center max-w-md px-6">
        <div className="text-6xl mb-6">🎙️</div>
        <h1 className="text-text-primary text-3xl font-mono mb-4 uppercase tracking-wider">
          VoiceCoach
        </h1>
        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
          Voice-powered support for focused work and life.
          Choose from specialized agent suites designed for different needs.
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-3 bg-accent-primary text-bg-primary hover:shadow-glow-cyan transition-all uppercase text-sm font-mono tracking-wide"
        >
          Choose Your Support →
        </button>
        <p className="text-text-tertiary text-xs mt-4">
          First time here? We'll help you find the right suite.
        </p>
      </div>
    </div>
  );
}
```

**Integration in App.tsx**:
```typescript
const [showWelcome, setShowWelcome] = useState(true);
const [hasSeenWelcome, setHasSeenWelcome] = useState(
  () => localStorage.getItem('hasSeenWelcome') === 'true'
);

useEffect(() => {
  if (hasSeenWelcome) {
    setShowWelcome(false);
  }
}, [hasSeenWelcome]);

const handleGetStarted = () => {
  localStorage.setItem('hasSeenWelcome', 'true');
  setShowWelcome(false);
  setShowSuiteSelector(true);
};

// In render:
{showWelcome && !hasSeenWelcome && (
  <WelcomeScreen onGetStarted={handleGetStarted} />
)}
```

**Success Criteria**:
- [ ] Welcome screen shows on first visit
- [ ] Dismisses and shows suite selector
- [ ] Doesn't show on subsequent visits
- [ ] Can be reset for testing

---

## Phase 7: Polish & Testing (Days 16-17)

### Task 7.1: Add Loading States (1 hour)

**File**: `src/app/components/SuiteLoadingState.tsx`

```typescript
export default function SuiteLoadingState({ suiteName }: { suiteName: string }) {
  return (
    <div className="fixed inset-0 bg-bg-overlay z-50 flex items-center justify-center">
      <div className="bg-bg-secondary border border-accent-primary p-8 max-w-md">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-pulse">🔄</div>
          <div className="text-text-primary font-mono uppercase tracking-wide">
            Preparing {suiteName}
          </div>
          <div className="text-text-secondary text-sm space-y-1">
            <div>✓ Creating workspace...</div>
            <div>✓ Connecting to agents...</div>
            <div className="animate-pulse">⋯ Initializing session...</div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 7.2: Add Error Boundaries (1 hour)

**File**: `src/app/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-bg-primary flex items-center justify-center p-4">
          <div className="bg-bg-secondary border-2 border-status-error p-8 max-w-md">
            <div className="text-status-error text-4xl mb-4">⚠️</div>
            <h2 className="text-text-primary font-mono text-lg mb-4">
              Something Went Wrong
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent-primary text-bg-primary hover:shadow-glow-cyan uppercase text-sm font-mono"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap App in Error Boundary**:
```typescript
// src/app/page.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

### Task 7.3: Comprehensive Testing (4-6 hours)

**Testing Checklist**:

#### Functional Tests
- [ ] **Suite Selection**
  - [ ] Can open suite selector (first time)
  - [ ] Can search suites
  - [ ] Can filter by category
  - [ ] Can expand/collapse suite cards
  - [ ] Can select a suite
  - [ ] Workspace initializes with templates
  
- [ ] **Connection**
  - [ ] Can connect to suite
  - [ ] Root agent speaks first
  - [ ] Transcript displays correctly
  - [ ] Audio works (can speak and hear)
  
- [ ] **Agent Interaction**
  - [ ] Can have conversation with root agent
  - [ ] Agent can create workspace tabs
  - [ ] Agent can handoff to another agent
  - [ ] Handoff is visible in transcript
  - [ ] New agent acknowledges handoff
  
- [ ] **Suite Switching**
  - [ ] Can click suite indicator
  - [ ] Shows confirmation if connected
  - [ ] Disconnects cleanly
  - [ ] Can select new suite
  - [ ] New workspace initializes
  
- [ ] **Persistence**
  - [ ] Last suite is remembered
  - [ ] Workspace persists across refreshes
  - [ ] Preferences saved correctly

#### Edge Cases
- [ ] No suites registered
- [ ] Invalid suite ID in localStorage
- [ ] Connection fails
- [ ] Microphone permission denied
- [ ] Guardrail trips
- [ ] Agent handoff loops

#### Performance
- [ ] Suite selector opens quickly (<500ms)
- [ ] Search filters in real-time (no lag)
- [ ] Connection time <3 seconds
- [ ] No memory leaks after multiple switches

#### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces suite changes
- [ ] Focus management correct
- [ ] Color contrast meets WCAG AA

#### Mobile
- [ ] Suite selector works on mobile
- [ ] Cards are tap-friendly
- [ ] Search input works
- [ ] Layout doesn't break

---

## Testing Procedures

### Manual Testing Script

```markdown
# Suite System Manual Test

## Test 1: First-Time User Flow
1. Clear localStorage and cookies
2. Open app in incognito mode
3. Should see welcome screen
4. Click "Choose Your Support"
5. Should see suite selector with all suites
6. Search for "energy"
7. Should filter to Energy & Focus
8. Click "Learn More" on Energy & Focus
9. Should expand to show agents and details
10. Click "Start Session"
11. Should initialize workspace with 3 tabs
12. Should connect to Energy Coach
13. Agent should speak first

✅ Pass if all steps work
❌ Fail if any step breaks

## Test 2: Suite Switching
1. With active session (from Test 1)
2. Click suite indicator in header
3. Should show confirmation dialog
4. Click "Yes" to switch
5. Should disconnect
6. Should show suite selector
7. Select different suite (Agency)
8. Should initialize new workspace
9. Should connect to new root agent

✅ Pass if all steps work
❌ Fail if any step breaks

## Test 3: Persistence
1. Complete Test 1
2. Refresh page
3. Should NOT show welcome screen
4. Should auto-load Energy & Focus suite
5. Should remember workspace tabs

✅ Pass if all steps work
❌ Fail if any step breaks
```

---

### Automated Test Examples

**File**: `src/app/__tests__/suiteSystem.test.ts`

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { validateSuite } from '../agentConfigs/utils/suiteValidator';
import { getAllAvailableSuites, findSuiteById } from '../agentConfigs';

describe('Suite System', () => {
  describe('Suite Validation', () => {
    it('should validate a correct suite', () => {
      const suite = {
        id: 'test',
        name: 'Test Suite',
        description: 'Test description',
        icon: '🧪',
        category: 'productivity',
        tags: ['test'],
        agents: [mockAgent],
        rootAgent: mockAgent,
      };
      
      expect(validateSuite(suite)).toBe(true);
    });
    
    it('should reject suite with no agents', () => {
      const suite = {
        id: 'test',
        name: 'Test Suite',
        description: 'Test',
        icon: '🧪',
        category: 'productivity',
        tags: ['test'],
        agents: [],
      };
      
      expect(validateSuite(suite)).toBe(false);
    });
  });
  
  describe('Suite Registry', () => {
    it('should return all registered suites', () => {
      const suites = getAllAvailableSuites();
      expect(suites.length).toBeGreaterThan(0);
    });
    
    it('should find suite by ID', () => {
      const suite = findSuiteById('energy-focus');
      expect(suite).toBeDefined();
      expect(suite?.name).toBe('Energy & Focus');
    });
    
    it('should return undefined for invalid ID', () => {
      const suite = findSuiteById('invalid-id');
      expect(suite).toBeUndefined();
    });
  });
});
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds: `npm run build`
- [ ] Bundle size acceptable (<2MB)
- [ ] Environment variables set
- [ ] OpenAI API key configured

### Deployment Steps

```bash
# 1. Commit all changes
git add .
git commit -m "feat: implement multi-suite agent system"

# 2. Build production bundle
npm run build

# 3. Test production build locally
npm run start

# 4. Deploy to hosting platform
# (Vercel, Netlify, etc.)

# 5. Verify deployment
# - Check all suites load
# - Test voice connection
# - Test suite switching
```

### Post-Deployment

- [ ] Verify all suites accessible
- [ ] Test voice connection
- [ ] Test suite switching
- [ ] Monitor error logs
- [ ] Check analytics

---

## Troubleshooting Guide

### Issue: Suite selector not opening

**Symptoms**: Click button, nothing happens

**Debug Steps**:
1. Check console for errors
2. Verify `showSuiteSelector` state
3. Check if modal is rendering but invisible (z-index issue)
4. Verify onClick handler attached

**Solution**: Check SuiteSelector component props and state management

---

### Issue: Suites not appearing in selector

**Symptoms**: Empty suite list

**Debug Steps**:
1. Check console for registration messages
2. Verify `getAllAvailableSuites()` returns data
3. Check if suites are in registry: `console.log(suiteRegistry)`
4. Verify suite files are importing correctly

**Solution**: Check suite registration in index.ts

---

### Issue: Connection fails after suite selection

**Symptoms**: Error when connecting to suite

**Debug Steps**:
1. Check console for connection errors
2. Verify OpenAI API key is set
3. Check if agents array is populated
4. Verify root agent is valid
5. Check guardrails aren't blocking

**Solution**: Check agent definitions and API configuration

---

### Issue: Handoffs not working

**Symptoms**: Agent never transfers to another agent

**Debug Steps**:
1. Check if handoffs are wired in index.ts
2. Verify agent prompts include handoff instructions
3. Check console for handoff events
4. Verify target agent exists in agents array

**Solution**: Wire handoffs correctly in suite index.ts

---

### Issue: Workspace not initializing

**Symptoms**: No tabs created after suite selection

**Debug Steps**:
1. Check if suite has workspaceTemplates defined
2. Verify initializeWorkspaceWithTemplates is called
3. Check WorkspaceContext is available
4. Check console for errors

**Solution**: Verify workspace initialization in App.tsx

---

## Success Criteria Summary

**Phase 1 Complete**:
- [ ] All types defined
- [ ] Shared tools extracted
- [ ] Utils created
- [ ] Directory structure ready

**Phase 2 Complete**:
- [ ] Registry system functional
- [ ] Helper functions working
- [ ] Manual registration works

**Phase 3 Complete**:
- [ ] All UI components created
- [ ] Suite selector functional
- [ ] Components match design

**Phase 4 Complete**:
- [ ] Energy-Focus suite migrated
- [ ] Suite works identically
- [ ] No regressions

**Phase 5 Complete**:
- [ ] 2+ new suites created
- [ ] All agents functional
- [ ] Handoffs working

**Phase 6 Complete**:
- [ ] App.tsx integrated
- [ ] Suite switching works
- [ ] Persistence works

**Phase 7 Complete**:
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Production ready

---

## Final Notes for AI Implementation

### Working Style Recommendations

1. **Implement sequentially** - Don't skip ahead
2. **Test after each task** - Catch issues early
3. **Commit frequently** - Atomic commits
4. **Read documentation** - Reference architecture docs
5. **Ask for clarification** - If something is unclear
6. **Report blockers** - Don't get stuck silently

### When to Ask for Human Review

- Major architectural decisions
- UI/UX design choices
- Performance issues
- Security concerns
- Breaking changes

### Estimated Total Time

- **With AI assistance**: 15-17 days
- **Solo developer**: 20-25 days
- **Team of 2**: 10-12 days

### Key Success Metrics

- ✅ Zero breaking changes to existing functionality
- ✅ All suites discoverable and functional
- ✅ <3 second connection time
- ✅ Mobile responsive
- ✅ Keyboard accessible
- ✅ No memory leaks
- ✅ Production deployed

---

**Document Version**: 1.0  
**Last Updated**: 2024-10-11  
**Implementation Team**: AI-Assisted Development  
**Status**: Ready for Implementation  



