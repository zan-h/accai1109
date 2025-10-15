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
  const suiteId = suite.id;
  
  // Validate suite
  if (!validateSuite(suite)) {
    throw new Error(`Cannot register invalid suite: ${suiteId}`);
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

