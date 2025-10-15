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
  const suiteId = suite.id;
  if (!validateSuite(suite)) {
    throw new Error(`Invalid suite: ${suiteId}`);
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

