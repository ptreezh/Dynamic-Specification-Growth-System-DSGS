/**
 * CliInterface provides command-line interface for DSGS
 * It integrates with development workflows to enforce constraints
 * 
 * @module CliInterface
 */

import { generateConstraints } from '@core/constraint/ConstraintGenerator';
import { generateTCC, updateTCCWithSystemState } from '@core/specification/TccGenerator';
import { EvolutionManager } from '@core/evolution/EvolutionManager';
import { TaskContextCapsule } from '@core/types/TCC';

/**
 * CLI Interface class for DSGS
 */
export class CliInterface {
  private evolutionManager: EvolutionManager;
  
  constructor() {
    this.evolutionManager = new EvolutionManager();
  }
  
  /**
   * Executes constraint check for a task
   * @param taskId - Unique identifier for the task
   * @param goal - Goal or purpose of the task
   * @param taskType - Type/category of the task
   * @returns Exit code (0 for success, 1 for violations)
   */
  async executeConstraintCheck(
    taskId: string,
    goal: string,
    taskType: string
  ): Promise<number> {
    try {
      // Generate Task Context Capsule
      const tcc = await generateTCC(taskId, goal, taskType);
      
      // Generate constraints based on TCC
      const constraints = await generateConstraints(tcc);
      
      // Log constraints that will be enforced
      console.log(`\nEnforcing ${constraints.length} constraints for task "${goal}":`);
      constraints.forEach(constraint => {
        console.log(`  - [${constraint.severity}] ${constraint.name}: ${constraint.description}`);
      });
      
      // Check if any constraints are violated (simulated)
      const violations = this.checkForViolations(constraints, tcc);
      if (!tcc) {
        return 1;
      }
      
      if (violations.length > 0) {
        console.error(`\n❌ ${violations.length} constraint violation(s) found:`);
        violations.forEach(violation => {
          console.error(`  - ${violation}`);
        });
        return 1; // Return error code
      } else {
        console.log('\n✅ All constraints satisfied');
        
        // Update TCC with current system state
        await updateTCCWithSystemState(tcc);
        
        return 0; // Return success code
      }
    } catch (error) {
      console.error('Error during constraint check:', error);
      return 1;
    }
  }
  
  /**
   * Checks for constraint violations
   * @param constraints - Array of constraints to check
   * @param tcc - Task context capsule
   * @returns Array of violation messages
   */
  private checkForViolations(
    constraints: Array<{id: string, name: string, rule: string, severity: string}>,
    tcc: TaskContextCapsule
  ): string[] {
    const violations: string[] = [];
    
    if (!tcc || !tcc.taskType) {
      return violations;
    }
    
    // In a real implementation, this would check actual code against constraints
    // For now, we'll simulate some basic checks based on task type
    switch (tcc.taskType.toUpperCase()) {
      case 'FINANCIAL':
        // Financial tasks must have audit logging
        if (!constraints.some(c => c.id === 'SEC-003')) {
          violations.push('Financial task requires audit logging (SEC-003)');
        }
        break;
      case 'AUTHENTICATION':
        // Authentication tasks must have input validation
        if (!constraints.some(c => c.id === 'SEC-001')) {
          violations.push('Authentication task requires input validation (SEC-001)');
        }
        break;
      case 'API':
        // API tasks should have caching strategy
        if (!constraints.some(c => c.id === 'PERF-001')) {
          violations.push('API task should have caching strategy (PERF-001)');
        }
        break;
    }
    
    return violations;
  }
  
  /**
   * Shows current evolution stage
   */
  showEvolutionStatus(): void {
    const currentStage = this.evolutionManager.getCurrentStage();
    const state = this.evolutionManager.getState();
    
    if (!currentStage) {
      console.log('\n❌ Evolution stage not available');
      return;
    }
    
    console.log('\n🚀 Evolution Status:');
    console.log(`   Current Stage: ${currentStage.name} (v${currentStage.version})`);
    console.log(`   Entered: ${state.enteredAt}`);
    console.log(`   Features: ${currentStage.features.join(', ')}`);
    
    // Show self-constraints
    const selfConstraints = this.evolutionManager.generateSelfConstraints();
    if (selfConstraints.length > 0) {
      console.log(`   Self-Constraints: ${selfConstraints.join(', ')}`);
    }
  }
  
  /**
   * Attempts to migrate to next evolutionary stage
   * @returns Exit code (0 for success, 1 for failure)
   */
  async migrateEvolution(): Promise<number> {
    console.log('\n🔄 Attempting evolution migration...');
    
    const success = await this.evolutionManager.migrateToNextStage();
    
    if (success) {
      console.log('✅ Migration successful!');
      this.showEvolutionStatus();
      return 0;
    } else {
      console.log('❌ Migration failed');
      return 1;
    }
  }
}

// Create global instance
const cliInterface = new CliInterface();

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Handle commands
  switch (command) {
    case 'check':
      // Usage: npm run check -- <taskId> <goal> <taskType>
      if (args.length !== 4) {
        console.error('Usage: npm run check -- <taskId> <goal> <taskType>');
        process.exit(1);
      }
      
      const [,, taskId, goal, taskType] = args;
      cliInterface.executeConstraintCheck(taskId, goal, taskType)
        .then(exitCode => process.exit(exitCode));
      break;
      
    case 'status':
      cliInterface.showEvolutionStatus();
      process.exit(0);
      break;
      
    case 'migrate':
      cliInterface.migrateEvolution()
        .then(exitCode => process.exit(exitCode));
      break;
      
    default:
      console.log('DSGS CLI Interface');
      console.log('Commands:');
      console.log('  check <taskId> <goal> <taskType>    Check constraints for a task');
      console.log('  status                             Show current evolution status');
      console.log('  migrate                            Attempt to migrate to next evolutionary stage');
      process.exit(0);
  }
}
