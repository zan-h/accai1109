# Agent Suite Architecture
**Modular Multi-Agent System for User-Selectable Voice Agent Collections**

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Core Concepts](#core-concepts)
4. [Suite Registry System](#suite-registry-system)
5. [Agent Composition Patterns](#agent-composition-patterns)
6. [Suite Configuration Schema](#suite-configuration-schema)
7. [UI/UX Design](#uiux-design)
8. [Implementation Guide](#implementation-guide)
9. [Adding New Suites (Developer Guide)](#adding-new-suites-developer-guide)
10. [Migration from Current System](#migration-from-current-system)
11. [Advanced Patterns](#advanced-patterns)

---

## Architecture Overview

### Current System vs. Proposed System

#### Current (Single Scenario)
```
User → Connects → workspaceBuilder scenario
                  ├── Energy Coach
                  ├── Task Strategist
                  └── Body Doubling
```

#### Proposed (Multi-Suite)
```
User → Selects Suite → Connects to Suite
         │
         ├── 🎯 Agency Suite
         │   ├── Autonomy Coach
         │   ├── Decision Architect
         │   └── Confidence Builder
         │
         ├── 📋 Strategic Planning Suite
         │   ├── Vision Mapper
         │   ├── Priority Strategist
         │   └── Execution Planner
         │
         ├── 🧘 Energy & Focus Suite (current workspaceBuilder)
         │   ├── Energy Coach
         │   ├── Task Strategist
         │   └── Body Doubling
         │
         └── 💼 Executive Function Suite
             ├── Working Memory Assistant
             ├── Task Sequencer
             └── Time Perception Coach
```

### Design Principles

1. **Suite Independence**: Each suite is self-contained with its own agents, tools, and guardrails
2. **Easy Addition**: Adding a new suite should require minimal boilerplate
3. **Shared Infrastructure**: Common tools and utilities are reusable across suites
4. **Type Safety**: Full TypeScript support with auto-completion
5. **Hot Reload**: New suites should be discoverable without code changes in App.tsx
6. **Metadata Rich**: Each suite has description, tags, intended use case
7. **Workspace Integration**: Suites can define their own workspace tab templates

---

## Directory Structure

### 📁 Proposed File Organization

```
src/app/agentConfigs/
│
├── index.ts                              🎯 Main registry (auto-discovers suites)
├── types.ts                              📘 Core type definitions
│
├── shared/                               🔧 SHARED INFRASTRUCTURE
│   ├── tools/                            🛠️ Reusable tools across suites
│   │   ├── workspace/
│   │   │   ├── workspaceTools.ts         (CRUD operations)
│   │   │   └── workspaceInfoTool.ts      (Read-only workspace access)
│   │   ├── web/
│   │   │   └── searchTool.ts             (Web search)
│   │   ├── computation/
│   │   │   └── calculatorTool.ts         (Code interpreter)
│   │   └── communication/
│   │       └── sendMessageTool.ts        (External messaging)
│   │
│   ├── guardrails/                       🛡️ Reusable guardrails
│   │   ├── moderation.ts
│   │   ├── contextAware.ts
│   │   └── customBusiness.ts
│   │
│   └── prompts/                          📝 Reusable prompt fragments
│       ├── handoffPatterns.ts            (Common handoff instructions)
│       ├── toolUsagePatterns.ts          (Common tool usage patterns)
│       └── conversationFlow.ts           (Common conversation patterns)
│
├── suites/                               🎭 AGENT SUITES
│   │
│   ├── _suite-template/                  📋 Template for new suites
│   │   ├── suite.config.ts               (Suite metadata)
│   │   ├── agents/
│   │   │   ├── agentA.ts
│   │   │   └── agentB.ts
│   │   ├── prompts.ts
│   │   ├── tools.ts                      (Suite-specific tools)
│   │   ├── guardrails.ts                 (Suite-specific guardrails)
│   │   └── index.ts                      (Exports suite)
│   │
│   ├── agency/                           🎯 AGENCY SUITE
│   │   ├── suite.config.ts
│   │   │   ├── name: "Agency & Autonomy"
│   │   │   ├── description: "Increase self-direction and decision-making confidence"
│   │   │   ├── icon: "🎯"
│   │   │   ├── tags: ["autonomy", "confidence", "decision-making"]
│   │   │   └── workspaceTemplates: [...]
│   │   │
│   │   ├── agents/
│   │   │   ├── autonomyCoach.ts          (Supports self-direction)
│   │   │   ├── decisionArchitect.ts      (Helps structure decisions)
│   │   │   └── confidenceBuilder.ts      (Affirms agency, reduces doubt)
│   │   │
│   │   ├── prompts.ts
│   │   ├── tools.ts                      (Decision matrix tool, values alignment)
│   │   └── index.ts
│   │
│   ├── strategic-planning/               📋 STRATEGIC PLANNING SUITE
│   │   ├── suite.config.ts
│   │   │   ├── name: "Strategic Planning"
│   │   │   ├── description: "Long-term vision, priorities, and execution roadmaps"
│   │   │   ├── icon: "📋"
│   │   │   ├── tags: ["planning", "strategy", "execution"]
│   │   │   └── workspaceTemplates: [Vision Board, OKRs, Roadmap]
│   │   │
│   │   ├── agents/
│   │   │   ├── visionMapper.ts           (Clarifies long-term vision)
│   │   │   ├── priorityStrategist.ts     (Ruthless prioritization)
│   │   │   └── executionPlanner.ts       (Tactical execution plans)
│   │   │
│   │   ├── prompts.ts
│   │   ├── tools.ts                      (OKR generator, roadmap builder)
│   │   └── index.ts
│   │
│   ├── energy-focus/                     🧘 ENERGY & FOCUS SUITE (migrated workspaceBuilder)
│   │   ├── suite.config.ts
│   │   │   ├── name: "Energy & Focus"
│   │   │   ├── description: "Body-aware, ADHD-friendly productivity support"
│   │   │   ├── icon: "🧘"
│   │   │   ├── tags: ["adhd", "neurodivergent", "energy", "focus"]
│   │   │   └── workspaceTemplates: [Daily Check-in, Task Board, Energy Journal]
│   │   │
│   │   ├── agents/
│   │   │   ├── energyCoach.ts
│   │   │   ├── taskStrategist.ts
│   │   │   └── bodyDoubling.ts
│   │   │
│   │   ├── prompts.ts
│   │   └── index.ts
│   │
│   └── executive-function/               💼 EXECUTIVE FUNCTION SUITE
│       ├── suite.config.ts
│       │   ├── name: "Executive Function Support"
│       │   ├── description: "Working memory, sequencing, time perception assistance"
│       │   ├── icon: "💼"
│       │   ├── tags: ["executive-function", "adhd", "memory", "time"]
│       │   └── workspaceTemplates: [Memory Board, Sequence Planner, Time Tracker]
│       │
│       ├── agents/
│       │   ├── workingMemoryAssistant.ts (Holds context, reminds of key info)
│       │   ├── taskSequencer.ts          (Orders tasks optimally)
│       │   └── timePerceptionCoach.ts    (Helps with time blindness)
│       │
│       ├── prompts.ts
│       └── index.ts
│
└── utils/
    ├── suiteDiscovery.ts                 🔍 Auto-discovers suites
    └── suiteValidator.ts                 ✅ Validates suite configs
```

---

## Core Concepts

### 1. Agent Suite Definition

An **Agent Suite** is a collection of specialized voice agents designed to work together toward a specific user goal.

```typescript
interface AgentSuite {
  // Metadata
  id: string;                           // Unique identifier (e.g., 'agency')
  name: string;                         // Display name (e.g., 'Agency & Autonomy')
  description: string;                  // User-facing description
  icon: string;                         // Emoji or icon identifier
  tags: string[];                       // Searchable tags
  category: SuiteCategory;              // Primary category
  
  // Agents
  agents: RealtimeAgent[];              // Array of configured agents
  rootAgent: RealtimeAgent;             // Starting agent (agents[0])
  
  // Configuration
  workspaceTemplates?: WorkspaceTemplate[];  // Default tabs for this suite
  guardrails?: OutputGuardrail[];            // Suite-specific guardrails
  initialContext?: Record<string, any>;      // Context passed to agents
  
  // Usage hints
  suggestedUseCases?: string[];         // When to use this suite
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  estimatedSessionLength?: number;      // Minutes
}

type SuiteCategory = 
  | 'productivity'
  | 'mental-health' 
  | 'planning'
  | 'coaching'
  | 'learning'
  | 'creativity';
```

### 2. Suite Configuration File

Each suite has a `suite.config.ts` that defines metadata:

```typescript
// suites/agency/suite.config.ts

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
  
  // Optional: Suite-specific context
  initialContext: {
    focusArea: 'agency',
    checkInFrequency: 'high',
  },
};
```

### 3. Suite Registry (Auto-Discovery)

The registry automatically discovers all suites:

```typescript
// agentConfigs/index.ts

import { AgentSuite } from './types';
import { discoverSuites } from './utils/suiteDiscovery';

// Auto-discover all suites from /suites directory
const discoveredSuites = discoverSuites();

// Export as registry
export const suiteRegistry: Record<string, AgentSuite> = discoveredSuites;

// Export helper functions
export function getAllSuites(): AgentSuite[] {
  return Object.values(suiteRegistry);
}

export function getSuiteById(id: string): AgentSuite | undefined {
  return suiteRegistry[id];
}

export function getSuitesByCategory(category: SuiteCategory): AgentSuite[] {
  return getAllSuites().filter(suite => suite.category === category);
}

export function getSuitesByTag(tag: string): AgentSuite[] {
  return getAllSuites().filter(suite => suite.tags.includes(tag));
}

export function searchSuites(query: string): AgentSuite[] {
  const lowerQuery = query.toLowerCase();
  return getAllSuites().filter(suite =>
    suite.name.toLowerCase().includes(lowerQuery) ||
    suite.description.toLowerCase().includes(lowerQuery) ||
    suite.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// Default suite for initial load
export const defaultSuiteId = 'energy-focus';
```

---

## Suite Registry System

### Auto-Discovery Implementation

```typescript
// agentConfigs/utils/suiteDiscovery.ts

import { AgentSuite } from '../types';
import { validateSuite } from './suiteValidator';

export function discoverSuites(): Record<string, AgentSuite> {
  const suites: Record<string, AgentSuite> = {};
  
  // Import all suite index files dynamically
  const suiteModules = import.meta.glob('../suites/*/index.ts', { eager: true });
  
  for (const [path, module] of Object.entries(suiteModules)) {
    // Extract suite ID from path: ../suites/agency/index.ts → agency
    const suiteId = path.split('/')[2];
    
    // Skip template directory
    if (suiteId === '_suite-template') continue;
    
    // Get exported suite
    const suite = (module as any).default as AgentSuite;
    
    // Validate suite structure
    if (!validateSuite(suite)) {
      console.error(`Invalid suite: ${suiteId}`);
      continue;
    }
    
    // Add to registry
    suites[suiteId] = suite;
    console.log(`✅ Registered suite: ${suite.name} (${suiteId})`);
  }
  
  return suites;
}
```

### Suite Validator

```typescript
// agentConfigs/utils/suiteValidator.ts

import { AgentSuite } from '../types';
import { z } from 'zod';

const SuiteConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string(),
  category: z.enum(['productivity', 'mental-health', 'planning', 'coaching', 'learning', 'creativity']),
  tags: z.array(z.string()),
  agents: z.array(z.any()).min(1),
  suggestedUseCases: z.array(z.string()).optional(),
  userLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedSessionLength: z.number().positive().optional(),
});

export function validateSuite(suite: any): suite is AgentSuite {
  try {
    SuiteConfigSchema.parse(suite);
    
    // Additional checks
    if (suite.agents.length === 0) {
      console.error(`Suite ${suite.id} has no agents`);
      return false;
    }
    
    // Ensure all agents have unique names
    const agentNames = suite.agents.map((a: any) => a.name);
    const uniqueNames = new Set(agentNames);
    if (agentNames.length !== uniqueNames.size) {
      console.error(`Suite ${suite.id} has duplicate agent names`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Suite validation failed:`, error);
    return false;
  }
}
```

---

## Agent Composition Patterns

### Pattern 1: Base Agent Class (Optional)

For suites with similar agent patterns, use a base class:

```typescript
// shared/agents/BaseCoachAgent.ts

import { RealtimeAgent } from '@openai/agents/realtime';

export interface BaseCoachConfig {
  name: string;
  voice: string;
  specialty: string;
  approach: string;
  tools: any[];
  handoffs: RealtimeAgent[];
}

export function createCoachAgent(config: BaseCoachConfig): RealtimeAgent {
  const baseInstructions = `
You are a ${config.specialty} coach with a ${config.approach} approach.

# Core Principles
- Listen actively and validate experiences
- Ask open-ended questions
- Celebrate progress, no matter how small
- Hold space for authentic expression
- Never judge or pressure

# Your Specialty
${config.specialty}

# When to Hand Off
${config.handoffs.map(a => `- Transfer to ${a.name} when [condition]`).join('\n')}
  `.trim();
  
  return new RealtimeAgent({
    name: config.name,
    voice: config.voice,
    instructions: baseInstructions,
    tools: config.tools,
    handoffs: config.handoffs,
  });
}
```

### Pattern 2: Prompt Composition

Compose prompts from reusable fragments:

```typescript
// shared/prompts/handoffPatterns.ts

export const handoffPatterns = {
  energyBased: (targetAgent: string) => `
Hand off to ${targetAgent} when user's energy level changes significantly or they need different support.
  `.trim(),
  
  taskBased: (targetAgent: string) => `
Hand off to ${targetAgent} when the conversation moves from planning to execution.
  `.trim(),
  
  stuckPattern: (targetAgent: string) => `
Hand off to ${targetAgent} when user feels stuck, overwhelmed, or needs a different perspective.
  `.trim(),
};

// Usage in agent prompt
import { handoffPatterns } from '@/app/agentConfigs/shared/prompts/handoffPatterns';

export const autonomyCoachPrompt = `
You are an Autonomy Coach...

${handoffPatterns.stuckPattern('decisionArchitect')}
${handoffPatterns.taskBased('confidenceBuilder')}
`;
```

### Pattern 3: Tool Mixins

Create composable tool sets:

```typescript
// shared/tools/toolMixins.ts

import { workspaceTools } from './workspace/workspaceTools';
import { searchTool } from './web/searchTool';
import { calculatorTool } from './computation/calculatorTool';

export const toolMixins = {
  // Basic workspace manipulation
  workspaceBasic: [
    workspaceTools.getInfo,
    workspaceTools.addTab,
    workspaceTools.setContent,
  ],
  
  // Advanced workspace with search
  workspaceAdvanced: [
    ...toolMixins.workspaceBasic,
    workspaceTools.renameTab,
    workspaceTools.deleteTab,
    searchTool,
  ],
  
  // Research-focused
  research: [
    workspaceTools.getInfo,
    workspaceTools.addTab,
    searchTool,
  ],
  
  // Computation-focused
  analytical: [
    workspaceTools.getInfo,
    calculatorTool,
  ],
};

// Usage in agent definition
import { toolMixins } from '@/app/agentConfigs/shared/tools/toolMixins';

export const visionMapperAgent = new RealtimeAgent({
  name: 'visionMapper',
  tools: toolMixins.workspaceAdvanced, // Easy tool composition
  // ...
});
```

---

## Suite Configuration Schema

### Complete TypeScript Types

```typescript
// agentConfigs/types.ts

import { RealtimeAgent } from '@openai/agents/realtime';

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
```

### Suite Index Template

```typescript
// suites/_suite-template/index.ts

import { AgentSuite } from '@/app/agentConfigs/types';
import { suiteConfig } from './suite.config';
import { agentA } from './agents/agentA';
import { agentB } from './agents/agentB';
import { suiteGuardrails } from './guardrails';

// Wire up handoffs
(agentA.handoffs as any).push(agentB);
(agentB.handoffs as any).push(agentA);

// Export suite
const suite: AgentSuite = {
  ...suiteConfig,
  agents: [agentA, agentB],
  rootAgent: agentA,
  guardrails: suiteGuardrails,
};

export default suite;
```

---

## UI/UX Design

### Suite Selection Flow

```
1. User Opens App
   ↓
2. Suite Selector Modal (if no suite selected)
   ├── Search bar (filter by name, tags)
   ├── Category tabs (Productivity, Coaching, Planning, etc.)
   ├── Suite cards showing:
   │   ├── Icon
   │   ├── Name
   │   ├── Description
   │   ├── Tags
   │   └── "Start Session" button
   └── "Learn More" expands to show agents
   ↓
3. User Selects Suite
   ↓
4. Workspace Initializes with Templates
   ↓
5. Connection Established with Root Agent
   ↓
6. Session Begins
```

### Suite Selector Component

```tsx
// components/SuiteSelector.tsx

import React, { useState, useMemo } from 'react';
import { getAllSuites, getSuitesByCategory, searchSuites } from '@/app/agentConfigs';
import { AgentSuite, SuiteCategory } from '@/app/agentConfigs/types';

interface SuiteSelectorProps {
  onSelectSuite: (suite: AgentSuite) => void;
  onClose: () => void;
}

export default function SuiteSelector({ onSelectSuite, onClose }: SuiteSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SuiteCategory | 'all'>('all');
  const [expandedSuiteId, setExpandedSuiteId] = useState<string | null>(null);
  
  const allSuites = useMemo(() => getAllSuites(), []);
  
  const filteredSuites = useMemo(() => {
    let suites = allSuites;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      suites = getSuitesByCategory(selectedCategory);
    }
    
    // Filter by search
    if (searchQuery) {
      suites = searchSuites(searchQuery);
    }
    
    return suites;
  }, [allSuites, selectedCategory, searchQuery]);
  
  return (
    <div className="fixed inset-0 bg-bg-overlay z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-4xl bg-bg-secondary border-2 border-accent-primary shadow-glow-cyan max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-border-primary px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-text-primary uppercase tracking-widest text-lg font-mono">
              Select Agent Suite
            </h2>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-accent-primary text-2xl"
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
            className="w-full mt-4 px-4 py-2 bg-bg-primary border border-border-primary text-text-primary font-mono focus:outline-none focus:border-accent-primary"
          />
        </div>
        
        {/* Category Tabs */}
        <div className="border-b border-border-primary px-6 py-2 flex gap-2 overflow-x-auto">
          {['all', 'productivity', 'coaching', 'planning', 'mental-health', 'learning', 'creativity'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-3 py-1 text-xs uppercase tracking-wide font-mono transition-all ${
                selectedCategory === cat
                  ? 'bg-accent-primary text-bg-primary'
                  : 'text-text-secondary hover:text-accent-primary border border-border-primary'
              }`}
            >
              {cat}
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
              onExpand={() => setExpandedSuiteId(suite.id)}
              onSelect={() => onSelectSuite(suite)}
            />
          ))}
        </div>
        
        {/* Empty State */}
        {filteredSuites.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary font-mono">
            No suites found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}

interface SuiteCardProps {
  suite: AgentSuite;
  isExpanded: boolean;
  onExpand: () => void;
  onSelect: () => void;
}

function SuiteCard({ suite, isExpanded, onExpand, onSelect }: SuiteCardProps) {
  return (
    <div className="border border-border-primary bg-bg-tertiary hover:border-accent-primary transition-all">
      {/* Header */}
      <div className="p-4 border-b border-border-primary">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{suite.icon}</div>
          <div className="flex-1">
            <h3 className="text-text-primary font-mono text-sm mb-1">{suite.name}</h3>
            <p className="text-text-secondary text-xs">{suite.description}</p>
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
        <div className="p-4 border-b border-border-primary text-xs">
          <div className="mb-3">
            <div className="text-text-secondary uppercase tracking-wide mb-1">Agents</div>
            <div className="space-y-1">
              {suite.agents.map(agent => (
                <div key={agent.name} className="text-text-primary font-mono">
                  • {agent.name}
                </div>
              ))}
            </div>
          </div>
          
          {suite.suggestedUseCases && (
            <div>
              <div className="text-text-secondary uppercase tracking-wide mb-1">Use Cases</div>
              <div className="space-y-1">
                {suite.suggestedUseCases.map((useCase, i) => (
                  <div key={i} className="text-text-tertiary">
                    • {useCase}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Actions */}
      <div className="p-4 flex gap-2">
        <button
          onClick={onExpand}
          className="flex-1 py-2 border border-border-primary text-text-secondary hover:text-accent-primary hover:border-accent-primary transition-all uppercase text-xs font-mono"
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

### Header Suite Indicator

```tsx
// components/SuiteIndicator.tsx

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
      className="flex items-center gap-2 px-3 py-2 border border-border-primary bg-bg-secondary hover:border-accent-primary cursor-pointer transition-all"
    >
      <span className="text-2xl">{currentSuite.icon}</span>
      <div className="flex flex-col">
        <span className="text-text-primary text-xs font-mono">{currentSuite.name}</span>
        <span className="text-text-tertiary text-xs">
          {currentSuite.agents.length} agents
        </span>
      </div>
    </div>
  );
}
```

---

## Implementation Guide

### Step 1: Create Type Definitions

```bash
# Create new types file
touch src/app/agentConfigs/types.ts
```

Add all TypeScript types from the "Suite Configuration Schema" section.

### Step 2: Create Shared Infrastructure

```bash
# Create shared directory structure
mkdir -p src/app/agentConfigs/shared/{tools,guardrails,prompts}
mkdir -p src/app/agentConfigs/shared/tools/{workspace,web,computation}
```

Move existing workspace tools to shared location:
```bash
mv src/app/agentConfigs/scenarios/workspaceBuilder/workspaceManager.ts \
   src/app/agentConfigs/shared/tools/workspace/workspaceTools.ts
```

### Step 3: Create Utils

```bash
mkdir -p src/app/agentConfigs/utils
touch src/app/agentConfigs/utils/suiteDiscovery.ts
touch src/app/agentConfigs/utils/suiteValidator.ts
```

Implement auto-discovery and validation from earlier sections.

### Step 4: Migrate Existing Scenario

```bash
# Rename scenarios to suites
mv src/app/agentConfigs/scenarios src/app/agentConfigs/suites

# Rename workspaceBuilder to energy-focus
mv src/app/agentConfigs/suites/workspaceBuilder \
   src/app/agentConfigs/suites/energy-focus
```

Add `suite.config.ts` to energy-focus:
```typescript
// suites/energy-focus/suite.config.ts
export const energyFocusSuiteConfig: SuiteConfig = {
  id: 'energy-focus',
  name: 'Energy & Focus',
  description: 'Body-aware, ADHD-friendly productivity support',
  icon: '🧘',
  category: 'mental-health',
  tags: ['adhd', 'neurodivergent', 'energy', 'focus', 'body-awareness'],
  suggestedUseCases: [
    'Feeling scattered or overwhelmed',
    'Need help starting tasks',
    'Want body-aware productivity support',
    'Working with ADHD or executive function challenges',
  ],
  userLevel: 'beginner',
  estimatedSessionLength: 45,
  workspaceTemplates: [
    {
      name: 'Daily Check-in',
      type: 'markdown',
      content: '# Daily Check-in\n\n## Energy Level\n\n## Body Awareness\n\n## Intentions',
    },
    // ... more templates
  ],
};
```

### Step 5: Update Registry

```typescript
// agentConfigs/index.ts

import { AgentSuite, SuiteCategory } from './types';
import { discoverSuites } from './utils/suiteDiscovery';

const suiteRegistry = discoverSuites();

export {
  suiteRegistry,
  getAllSuites,
  getSuiteById,
  getSuitesByCategory,
  searchSuites,
};

export const defaultSuiteId = 'energy-focus';
```

### Step 6: Update App.tsx

```typescript
// App.tsx (key changes)

import { getSuiteById, defaultSuiteId } from '@/app/agentConfigs';
import SuiteSelector from './components/SuiteSelector';

function App() {
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [showSuiteSelector, setShowSuiteSelector] = useState(false);
  
  const currentSuite = selectedSuiteId ? getSuiteById(selectedSuiteId) : null;
  
  // Show suite selector on mount if no suite selected
  useEffect(() => {
    const storedSuiteId = localStorage.getItem('selectedSuiteId');
    if (storedSuiteId) {
      setSelectedSuiteId(storedSuiteId);
    } else {
      setShowSuiteSelector(true);
    }
  }, []);
  
  // Handle suite selection
  const handleSelectSuite = (suite: AgentSuite) => {
    setSelectedSuiteId(suite.id);
    localStorage.setItem('selectedSuiteId', suite.id);
    setShowSuiteSelector(false);
    
    // Initialize workspace with suite templates
    if (suite.workspaceTemplates) {
      initializeWorkspaceWithTemplates(suite.workspaceTemplates);
    }
    
    // Auto-connect to suite
    connectToSuite(suite);
  };
  
  const connectToSuite = async (suite: AgentSuite) => {
    await connect({
      getEphemeralKey,
      initialAgents: suite.agents,
      audioElement: audioElementRef.current!,
      extraContext: {
        ...suite.initialContext,
        suiteId: suite.id,
        addTranscriptBreadcrumb,
      },
      outputGuardrails: suite.guardrails || [],
    });
  };
  
  return (
    <>
      {showSuiteSelector && (
        <SuiteSelector
          onSelectSuite={handleSelectSuite}
          onClose={() => setShowSuiteSelector(false)}
        />
      )}
      
      <div className="app-container">
        <header>
          <SuiteIndicator
            currentSuite={currentSuite}
            onChangeSuite={() => setShowSuiteSelector(true)}
          />
        </header>
        
        {/* ... rest of app */}
      </div>
    </>
  );
}
```

---

## Adding New Suites (Developer Guide)

### Quick Start: 5-Minute Suite

```bash
# 1. Copy template
cp -r src/app/agentConfigs/suites/_suite-template \
      src/app/agentConfigs/suites/my-new-suite

# 2. Edit suite.config.ts
# 3. Create agents in agents/ directory
# 4. Wire up handoffs in index.ts
# 5. Refresh app - suite auto-discovered!
```

### Detailed Guide: Creating the Agency Suite

#### Step 1: Create Suite Directory

```bash
mkdir -p src/app/agentConfigs/suites/agency/agents
touch src/app/agentConfigs/suites/agency/suite.config.ts
touch src/app/agentConfigs/suites/agency/prompts.ts
touch src/app/agentConfigs/suites/agency/tools.ts
touch src/app/agentConfigs/suites/agency/index.ts
```

#### Step 2: Define Suite Config

```typescript
// suites/agency/suite.config.ts

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
      content: '# My Agency Journey\n\n## Decisions I Own\n\n## Choices That Reflect My Values',
    },
    {
      name: 'Decision Matrix',
      type: 'csv',
      content: 'Decision|Option A|Option B|Option C|My Choice|Why\n',
    },
  ],
};
```

#### Step 3: Create Agent Prompts

```typescript
// suites/agency/prompts.ts

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

```typescript
// suites/agency/tools.ts

import { tool } from '@openai/agents/realtime';
import { workspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';

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
        description: 'Criteria for evaluating options (e.g., cost, time, alignment with values)'
      },
    },
    required: ['decision', 'options', 'criteria'],
  },
  execute: async ({ decision, options, criteria }: any) => {
    // Build CSV content
    const header = ['Option', ...criteria, 'Score'].join('|');
    const rows = options.map((opt: string) => 
      [opt, ...criteria.map(() => ''), ''].join('|')
    );
    const content = [header, ...rows].join('\n');
    
    // Create workspace tab
    await workspaceTools.addTab({
      name: `Decision: ${decision}`,
      type: 'csv',
      content,
    });
    
    return { success: true, message: `Created decision matrix for: ${decision}` };
  },
});

export const valuesAlignment = tool({
  name: 'check_values_alignment',
  description: 'Help user check if a choice aligns with their stated values',
  parameters: {
    type: 'object',
    properties: {
      choice: { type: 'string' },
      values: { type: 'array', items: { type: 'string' } },
    },
    required: ['choice', 'values'],
  },
  execute: async ({ choice, values }: any) => {
    const content = `# Values Alignment Check\n\n## Choice\n${choice}\n\n## My Core Values\n${values.map((v: string) => `- ${v}`).join('\n')}\n\n## Alignment Analysis\n\n### How this choice honors each value:\n${values.map((v: string) => `\n**${v}:**\n- `).join('\n')}`;
    
    await workspaceTools.addTab({
      name: 'Values Alignment',
      type: 'markdown',
      content,
    });
    
    return { success: true };
  },
});
```

#### Step 5: Create Agent Definitions

```typescript
// suites/agency/agents/autonomyCoach.ts

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { autonomyCoachPrompt } from '../prompts';
import { workspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { valuesAlignment } from '../tools';

export const autonomyCoachAgent = new RealtimeAgent({
  name: 'autonomyCoach',
  voice: 'sage',
  instructions: autonomyCoachPrompt,
  tools: [
    workspaceTools.getInfo,
    workspaceTools.addTab,
    workspaceTools.setContent,
    valuesAlignment,
  ],
  handoffs: [], // Wired up in index.ts
});
```

```typescript
// suites/agency/agents/decisionArchitect.ts

import { RealtimeAgent } from '@openai/agents/realtime';
import { decisionArchitectPrompt } from '../prompts';
import { workspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';
import { createDecisionMatrix } from '../tools';

export const decisionArchitectAgent = new RealtimeAgent({
  name: 'decisionArchitect',
  voice: 'alloy',
  instructions: decisionArchitectPrompt,
  tools: [
    workspaceTools.getInfo,
    workspaceTools.addTab,
    createDecisionMatrix,
  ],
  handoffs: [],
});
```

```typescript
// suites/agency/agents/confidenceBuilder.ts

import { RealtimeAgent } from '@openai/agents/realtime';
import { confidenceBuilderPrompt } from '../prompts';
import { workspaceTools } from '@/app/agentConfigs/shared/tools/workspace/workspaceTools';

export const confidenceBuilderAgent = new RealtimeAgent({
  name: 'confidenceBuilder',
  voice: 'nova',
  instructions: confidenceBuilderPrompt,
  tools: [
    workspaceTools.getInfo,
    workspaceTools.addTab,
  ],
  handoffs: [],
});
```

#### Step 6: Wire Up Suite

```typescript
// suites/agency/index.ts

import { AgentSuite } from '@/app/agentConfigs/types';
import { agencySuiteConfig } from './suite.config';
import { autonomyCoachAgent } from './agents/autonomyCoach';
import { decisionArchitectAgent } from './agents/decisionArchitect';
import { confidenceBuilderAgent } from './agents/confidenceBuilder';

// Wire up handoffs (full mesh - all agents can handoff to each other)
(autonomyCoachAgent.handoffs as any).push(decisionArchitectAgent, confidenceBuilderAgent);
(decisionArchitectAgent.handoffs as any).push(autonomyCoachAgent, confidenceBuilderAgent);
(confidenceBuilderAgent.handoffs as any).push(autonomyCoachAgent, decisionArchitectAgent);

// Export suite
const agencySuite: AgentSuite = {
  ...agencySuiteConfig,
  agents: [autonomyCoachAgent, decisionArchitectAgent, confidenceBuilderAgent],
  rootAgent: autonomyCoachAgent,
};

export default agencySuite;
```

#### Step 7: Test

```bash
npm run dev
```

Open the app - the Agency Suite should appear in the suite selector automatically! ✨

---

## Migration from Current System

### Phase 1: Backwards Compatibility (Week 1)

Keep both systems running:

```typescript
// agentConfigs/index.ts

// Old system (scenarios)
import { workspaceBuilderScenario } from './scenarios/workspaceBuilder';
export const allAgentSets = {
  workspaceBuilder: workspaceBuilderScenario,
};

// New system (suites) - runs in parallel
import { suiteRegistry } from './suites';
export { suiteRegistry };

// App.tsx can use either
```

### Phase 2: Gradual Migration (Week 2-3)

1. Migrate workspaceBuilder → energy-focus suite
2. Add suite config
3. Test thoroughly
4. Keep old system as fallback

### Phase 3: Full Cutover (Week 4)

1. Remove old scenarios/ directory
2. Update all imports
3. Update documentation
4. Deploy

### Migration Checklist

- [ ] Create new directory structure
- [ ] Move shared tools to `shared/tools/`
- [ ] Create suite.config.ts for existing scenario
- [ ] Update imports in agent files
- [ ] Test existing scenario works as suite
- [ ] Create SuiteSelector component
- [ ] Update App.tsx to use suite registry
- [ ] Add 2-3 new suites to validate architecture
- [ ] Write developer documentation
- [ ] Remove old scenario code
- [ ] Update README

---

## Advanced Patterns

### Pattern 1: Suite Inheritance

For related suites, use inheritance:

```typescript
// suites/advanced-strategic-planning/suite.config.ts

import { strategicPlanningSuiteConfig } from '../strategic-planning/suite.config';

export const advancedStrategicPlanningSuiteConfig: SuiteConfig = {
  ...strategicPlanningSuiteConfig,
  id: 'advanced-strategic-planning',
  name: 'Advanced Strategic Planning',
  description: 'For experienced planners: OKRs, scenario planning, strategic pivots',
  userLevel: 'advanced',
  tags: [...strategicPlanningSuiteConfig.tags, 'advanced', 'okrs', 'scenario-planning'],
};
```

### Pattern 2: Dynamic Agent Loading

Load agents conditionally based on user preferences:

```typescript
// suites/adaptive/index.ts

function createAdaptiveSuite(userPreferences: UserPreferences): AgentSuite {
  const agents = [];
  
  if (userPreferences.needsEnergySupport) {
    agents.push(energyCoachAgent);
  }
  
  if (userPreferences.needsTaskBreakdown) {
    agents.push(taskStrategistAgent);
  }
  
  if (userPreferences.needsAccountability) {
    agents.push(bodyDoublingAgent);
  }
  
  // Wire up handoffs dynamically
  wireHandoffs(agents);
  
  return {
    ...adaptiveSuiteConfig,
    agents,
    rootAgent: agents[0],
  };
}
```

### Pattern 3: Suite Composition

Combine agents from multiple suites:

```typescript
// suites/hybrid/index.ts

import { energyCoachAgent } from '../energy-focus/agents/energyCoach';
import { visionMapperAgent } from '../strategic-planning/agents/visionMapper';
import { autonomyCoachAgent } from '../agency/agents/autonomyCoach';

const hybridSuite: AgentSuite = {
  id: 'hybrid',
  name: 'Hybrid: Energy + Planning + Agency',
  description: 'Best of all worlds for comprehensive support',
  agents: [energyCoachAgent, visionMapperAgent, autonomyCoachAgent],
  rootAgent: energyCoachAgent,
  // ...
};
```

### Pattern 4: Plugin System

Allow third-party suites:

```typescript
// agentConfigs/utils/suiteDiscovery.ts

export function registerExternalSuite(suite: AgentSuite) {
  if (!validateSuite(suite)) {
    throw new Error(`Invalid external suite: ${suite.id}`);
  }
  
  suiteRegistry[suite.id] = suite;
  console.log(`✅ Registered external suite: ${suite.name}`);
}

// Usage
import { myCustomSuite } from 'my-suite-package';
registerExternalSuite(myCustomSuite);
```

---

## Summary

### Key Benefits of This Architecture

1. **Developer Experience**
   - Add new suite in 5 minutes
   - Auto-discovery (no manual registry)
   - Reusable components (tools, prompts, guardrails)
   - Type-safe with full IntelliSense

2. **User Experience**
   - Clear suite selection UI
   - Search and filter suites
   - Understand what each suite offers
   - Easy switching between suites

3. **Maintainability**
   - Each suite is self-contained
   - Shared infrastructure prevents duplication
   - Validation ensures quality
   - Clear patterns for consistency

4. **Scalability**
   - Add unlimited suites
   - No performance impact (lazy loading possible)
   - Plugin system for third-party suites
   - Suite inheritance for variations

### File Count Estimate

**Minimal Setup (1 Suite):**
- 15 files total
- 3 agent files
- 1 suite config
- 1 prompts file
- Shared infrastructure

**With 5 Suites:**
- ~60 files total
- Each suite: 10-12 files
- Shared infrastructure: 15 files

**Development Time:**
- Initial setup: 2-3 days
- Each new suite: 2-4 hours
- Adding an agent to existing suite: 30 minutes

### Next Steps

1. Review this architecture with team
2. Create proof-of-concept with 2 suites
3. Validate developer experience
4. Validate user experience
5. Iterate based on feedback
6. Full implementation

---

**Architecture Version:** 1.0  
**Date:** 2024-10-11  
**Author:** AI Architecture Team  



