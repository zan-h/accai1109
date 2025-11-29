// ============================================
// SUITE REGISTRY
// ============================================

import { AgentSuite, SuiteRegistry } from './types';
import { 
  getAllSuites,
  getSuiteById,
  getSuitesByCategory,
  getSuitesByTag,
  searchSuites,
} from './utils/suiteDiscovery';
import { registerSuiteManually } from './utils/manualRegistration';

// Import suites
import energyFocusSuite from './suites/energy-focus';
import satisfyingWorkSuite from './suites/satisfying-work';
import babyCareSuite from './suites/baby-care';
import ifsTherapySuite from './suites/ifs-therapy';
// import joeHudsonSuite from './suites/joe-hudson'; // DISABLED
// import twelveWeekMonthSuite from './suites/12-week-month'; // DISABLED
// import gtdSuite from './suites/gtd'; // DISABLED
import flowSprintsSuite from './suites/flow-sprints';
import writingCompanionSuite from './suites/writing-companion';
import videoProductionSuite from './suites/video-production';
import deepWorkForgeSuite from './suites/deep-work-forge';
import emotionalRegulationSuite from './suites/emotional-regulation';
import evidenceBasedStudySuite from './suites/evidence-based-study';

// For now, manually register suites
// In Phase 4, this will be populated with actual suites
const suiteRegistry: SuiteRegistry = {};

// Register suites
registerSuiteManually(suiteRegistry, energyFocusSuite);
registerSuiteManually(suiteRegistry, satisfyingWorkSuite);
registerSuiteManually(suiteRegistry, babyCareSuite);
registerSuiteManually(suiteRegistry, ifsTherapySuite);
// registerSuiteManually(suiteRegistry, joeHudsonSuite); // DISABLED
// registerSuiteManually(suiteRegistry, twelveWeekMonthSuite); // DISABLED
// registerSuiteManually(suiteRegistry, gtdSuite); // DISABLED
registerSuiteManually(suiteRegistry, flowSprintsSuite);
registerSuiteManually(suiteRegistry, writingCompanionSuite);
registerSuiteManually(suiteRegistry, videoProductionSuite);
registerSuiteManually(suiteRegistry, deepWorkForgeSuite);
registerSuiteManually(suiteRegistry, emotionalRegulationSuite);
registerSuiteManually(suiteRegistry, evidenceBasedStudySuite);

console.log('📦 Registered suites:', Object.keys(suiteRegistry));

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
export const defaultSuiteId = 'energy-aligned-work';

// ============================================
// BACKWARDS COMPATIBILITY
// ============================================

// Keep existing exports for backwards compatibility
export * from './scenarios';
