/**
 * SpecificationManager handles the lifecycle of specifications (BSL, TCC, etc.)
 * It provides methods for loading, saving, and validating specifications.
 * 
 * @module SpecificationManager
 */

/**
 * Validates a specification against the defined schema
 * @param spec - The Specification object to validate
 * @returns ValidationResult indicating success or failure with details
 */
interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

/**
 * Loads a specification from the specified path
 * @param path - The file path to load the specification from
 * @returns The loaded Specification object
 * @throws Error if the specification cannot be loaded or is invalid
 */
export async function loadSpecification(path: string): Promise<any> {
  try {
    const fs = await import('fs').then(mod => mod.promises);
    const data = await fs.readFile(path, 'utf8');
    const spec = JSON.parse(data);
    
    // Validate the specification
    const isValid = await validateSpecification(spec);
    if (!isValid.isValid) {
      throw new Error(`Invalid specification: ${isValid.errors?.join(', ')}`);
    }
    
    return spec;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to load specification from ${path}: ${error.message}`);
    }
    throw new Error(`Failed to load specification from ${path}: Unknown error`);
  }
}

/**
 * Saves a specification to the specified path
 * @param spec - The Specification object to save
 * @param path - The file path to save the specification to
 * @throws Error if the specification cannot be saved
 */
export async function saveSpecification(spec: any, path: string): Promise<void> {
  try {
    const fs = await import('fs').then(mod => mod.promises);
    const data = JSON.stringify(spec, null, 2);
    await fs.writeFile(path, data, 'utf8');
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to save specification to ${path}: ${error.message}`);
    }
    throw new Error(`Failed to save specification to ${path}: Unknown error`);
  }
}

  /**
   * Validates a specification against the defined schema
   * @param spec - The Specification object to validate
   * @returns ValidationResult indicating success or failure with details
   */
  export async function validateSpecification(spec: any): Promise<ValidationResult> {
    try {
      // Use synchronous import to avoid async issues in Jest
      const jsonSchema = require('json-schema');
      
      // Load schema synchronously to avoid async recursion
      const fs = require('fs');
      const schemaPath = require('path').join(__dirname, 'bsl.schema.json');
      const schemaData = fs.readFileSync(schemaPath, 'utf8');
      const schema = JSON.parse(schemaData);
      
      const result = jsonSchema.validate(spec, schema);
      if (result.valid) {
        return { isValid: true, errors: [] };
      } else {
        return { 
          isValid: false, 
          errors: result.errors.map((detail: any) => detail.message) || ['Unknown validation error']
        };
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { 
          isValid: false, 
          errors: [`Schema validation failed: ${error.message}`]
        };
      }
      return { 
        isValid: false, 
          errors: ['Schema validation failed: Unknown error']
      };
    }
  }
