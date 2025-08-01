/**
 * TccGenerator creates Task Context Capsules (TCC) from task metadata
 * It extracts relevant constraints and system context to create a comprehensive TCC
 * 
 * @module TccGenerator
 */

import { createTCC, TaskContextCapsule, validateTCCSize } from '@core/types/TCC';
import { loadSpecification } from './SpecificationManager';

/**
 * Generates a Task Context Capsule from task metadata
 * @param taskId - Unique identifier for the task
 * @param goal - Goal or purpose of the task
 * @param taskType - Type/category of the task
 * @param source - Source of the task (e.g., 'user-request', 'automated-process')
 * @param priority - Priority level of the task
 * @returns A TaskContextCapsule instance
 * @throws Error if TCC generation fails
 */
export async function generateTCC(
  taskId: string, 
  goal: string, 
  taskType: string,
  source: string = 'user-request',
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
): Promise<TaskContextCapsule> {
  try {
    // Create base TCC with provided information
    const tcc = createTCC(taskId, goal, taskType);
    
    // Update context with provided values
    tcc.context.source = source;
    tcc.context.priority = priority;
    
    // Extract relevant constraints from global specification
    await extractRelevantConstraints(tcc);
    
    // Validate TCC size (< 10KB)
    if (!validateTCCSize(tcc)) {
      throw new Error(`TCC size exceeds limit: ${tcc.size} bytes`);
    }
    
    return tcc;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate TCC: ${error.message}`);
    }
    throw new Error('Failed to generate TCC: Unknown error');
  }
}

/**
 * Extracts relevant constraints from the global specification based on task type
 * @param tcc - The TaskContextCapsule to populate with relevant constraints
 */
async function extractRelevantConstraints(tcc: TaskContextCapsule): Promise<void> {
  try {
    // Load the global specification
    const spec = await loadSpecification('src/core/specification/bsl.schema.json');
    
    // Extract constraints based on task type
    // This is a simplified example - in a real implementation, this would
    // query a specification database or graph to find relevant constraints
    const relevantConstraints: string[] = [];
    
    // Add constraints based on task type
    switch (tcc.taskType.toUpperCase()) {
      case 'FINANCIAL':
        relevantConstraints.push('SEC-002', 'SEC-003', 'PERF-002');
        break;
      case 'AUTHENTICATION':
        relevantConstraints.push('SEC-001', 'SEC-002');
        break;
      case 'API':
        relevantConstraints.push('PERF-001', 'PERF-002', 'ARCH-002');
        break;
      case 'DATABASE':
        relevantConstraints.push('PERF-001', 'ARCH-002');
        break;
      default:
        relevantConstraints.push('SEC-001');
        break;
    }
    
    // Add any task-specific constraints from the specification
    if (spec?.metadata?.taskConstraints?.[tcc.taskType]) {
      relevantConstraints.push(...spec.metadata.taskConstraints[tcc.taskType]);
    }
    
    // Remove duplicates
    tcc.context.relevantConstraints = [...new Set(relevantConstraints)];
  } catch (error) {
    // If we can't load the specification, continue with empty constraints
    console.warn('Could not load global specification for constraint extraction');
  }
}

/**
 * Updates a TCC with current system state information
 * @param tcc - The TaskContextCapsule to update
 */
export async function updateTCCWithSystemState(tcc: TaskContextCapsule): Promise<void> {
  try {
    // In a real implementation, this would gather actual system metrics
    // For now, we'll use placeholder values
    tcc.context.systemState.loadLevel = 'MED';
    tcc.context.systemState.dependencies = ['core-service', 'database'];
    tcc.context.systemState.resourceAvailability = {
      cpu: 50,
      memory: 50,
      network: 50
    };
    tcc.context.systemState.environment = 'DEVELOPMENT';
    
    // Update creation time to current time
    tcc.context.creationTime = new Date().toISOString();
    
    // Recalculate size
    validateTCCSize(tcc);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn(`Could not update TCC with system state: ${error.message}`);
    } else {
      console.warn('Could not update TCC with system state: Unknown error');
    }
  }
}
