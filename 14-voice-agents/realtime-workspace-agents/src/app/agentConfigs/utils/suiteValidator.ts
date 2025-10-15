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



