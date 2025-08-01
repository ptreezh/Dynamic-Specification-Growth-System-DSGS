/**
 * ConstraintGenerator generates constraints based on task context and type.
 * It uses template matching to apply appropriate constraints to tasks.
 * 
 * @module ConstraintGenerator
 */

/**
 * Represents a constraint that can be applied to a task
 */
interface Constraint {
  id: string;
  name: string;
  category: 'SECURITY' | 'PERFORMANCE' | 'ARCHITECTURE' | 'OTHER';
  description: string;
  rule: string;
  applicableTasks: string[];
  severity: 'WARNING' | 'ERROR';
}

/**
 * Represents a constraint template that can be instantiated
 */
interface ConstraintTemplate {
  id: string;
  name: string;
  category: 'SECURITY' | 'PERFORMANCE' | 'ARCHITECTURE' | 'OTHER';
  description: string;
  rule: string;
  applicableTasks: string[];
  severity: 'WARNING' | 'ERROR';
}

/**
 * TaskContextCapsule contains the context for a specific task
 */
interface TaskContextCapsule {
  taskId: string;
  goal: string;
  taskType: string;
  context: {
    relevantConstraints: string[];
    systemState: {
      loadLevel: 'LOW' | 'MED' | 'HIGH';
      dependencies: string[];
    };
    creationTime: string;
  };
  size: number;
}

/**
 * Generates constraints based on the provided task context capsule
 * @param tcc - The TaskContextCapsule containing task details and context
 * @returns Array of Constraint objects that should be applied to the task
 * @throws Error if constraint generation fails due to invalid context
 */
export async function generateConstraints(tcc: TaskContextCapsule): Promise<Constraint[]> {
  try {
    // Load applicable templates based on task type
    const templates = await matchTemplates(tcc.taskType);
    
    // Convert templates to constraints
    const constraints: Constraint[] = templates.map(template => ({
      id: template.id,
      name: template.name,
      category: template.category,
      description: template.description,
      rule: template.rule,
      applicableTasks: template.applicableTasks,
      severity: template.severity
    }));
    
    // Add constraints from TCC context
    const contextConstraints = tcc.context.relevantConstraints.map(id => {
      return {
        id,
        name: id,
        category: 'OTHER' as const,
        description: `Constraint from task context`,
        rule: `context.${id}`,
        applicableTasks: [tcc.taskType],
        severity: 'WARNING' as const
      };
    });
    
    return [...constraints, ...contextConstraints];
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate constraints: ${error.message}`);
    }
    throw new Error('Failed to generate constraints: Unknown error');
  }
}

/**
 * Matches constraint templates to the specified task type
 * @param taskType - The type of task to find templates for
 * @returns Array of ConstraintTemplate objects that match the task type
 */
export async function matchTemplates(taskType: string): Promise<ConstraintTemplate[]> {
  try {
    // Use dynamic imports for fs and path
    const fs = await import('fs').then(mod => mod.promises);
    const path = await import('path');
    
    // Get the directory path using a more compatible approach
    // Use the location of this file for resolving templates
    const currentDir = typeof __dirname !== 'undefined' ? 
      __dirname : 
      path.join(process.cwd(), 'src', 'core', 'constraint');
    
    // Define template directories
    const templateDirs = [
      path.join(currentDir, 'templates', 'security'),
      path.join(currentDir, 'templates', 'performance'),
      path.join(currentDir, 'templates', 'architecture')
    ];
    
    const templates: ConstraintTemplate[] = [];
    
    // Search through each template directory
    for (const dir of templateDirs) {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(dir, file);
            const data = await fs.readFile(filePath, 'utf8');
            const template = JSON.parse(data) as ConstraintTemplate;
            
            // Check if template applies to task type
            if (template.applicableTasks.includes(taskType) || 
                template.applicableTasks.includes('ALL')) {
              templates.push(template);
            }
          }
        }
      } catch (error) {
        // Directory may not exist, continue with other directories
        continue;
      }
    }
    
    return templates;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to match templates: ${error.message}`);
    }
    throw new Error('Failed to match templates: Unknown error');
  }
}
