/**
 * TCC (Task Context Capsule) data model
 * Represents the context and constraints for a specific task
 * 
 * @module TCC
 */

/**
 * System state information
 */
interface SystemState {
  loadLevel: 'LOW' | 'MED' | 'HIGH';
  dependencies: string[];
  resourceAvailability: {
    cpu: number;
    memory: number;
    network: number;
  };
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
}

/**
 * Task context capsule containing all relevant information for constraint generation
 */
export interface TaskContextCapsule {
  /**
   * Unique identifier for the task
   */
  taskId: string;
  
  /**
   * Goal or purpose of the task
   */
  goal: string;
  
  /**
   * Type/category of the task (e.g., 'FINANCIAL', 'AUTHENTICATION', 'API')
   */
  taskType: string;
  
  /**
   * Contextual information for the task
   */
  context: {
    /**
     * List of relevant constraint IDs that apply to this task
     */
    relevantConstraints: string[];
    
    /**
     * Current system state
     */
    systemState: SystemState;
    
    /**
     * Timestamp when the TCC was created
     */
    creationTime: string;
    
    /**
     * Source of the task (e.g., 'user-request', 'automated-process')
     */
    source: string;
    
    /**
     * Priority level of the task
     */
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  
  /**
   * Size of the TCC in bytes (must be < 10KB)
   */
  size: number;
  
  /**
   * Version of the TCC schema
   */
  version: string;
}

/**
 * Validates that a TCC is within size limits
 * @param tcc - The TaskContextCapsule to validate
 * @returns boolean indicating if the TCC is valid
 */
export function validateTCCSize(tcc: TaskContextCapsule): boolean {
  // Convert TCC to JSON string to calculate size
  const tccString = JSON.stringify(tcc);
  const byteSize = new Blob([tccString]).size;
  
  // Update size property
  tcc.size = byteSize;
  
  // Check if size is within limits (< 10KB)
  return byteSize < 10240;
}

/**
 * Creates a new TaskContextCapsule with default values
 * @param taskId - Unique identifier for the task
 * @param goal - Goal or purpose of the task
 * @param taskType - Type/category of the task
 * @returns A new TaskContextCapsule instance
 */
export function createTCC(taskId: string, goal: string, taskType: string): TaskContextCapsule {
  const now = new Date().toISOString();
  
  const tcc: TaskContextCapsule = {
    taskId,
    goal,
    taskType,
    context: {
      relevantConstraints: [],
      systemState: {
        loadLevel: 'MED',
        dependencies: [],
        resourceAvailability: {
          cpu: 50,
          memory: 50,
          network: 50
        },
        environment: 'DEVELOPMENT'
      },
      creationTime: now,
      source: 'user-request',
      priority: 'MEDIUM'
    },
    size: 0,
    version: '1.0'
  };
  
  // Calculate and validate size
  validateTCCSize(tcc);
  
  return tcc;
}
