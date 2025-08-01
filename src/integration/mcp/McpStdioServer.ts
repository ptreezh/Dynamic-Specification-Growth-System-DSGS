/**
 * McpStdioServer provides MCP-compliant interface using stdio for IDE integration
 * It handles communication between DSGS and IDEs like Cline using standard input/output
 * 
 * @module McpStdioServer
 */

import { loadSpecification } from '../../core/specification/SpecificationManager';
import { generateConstraints } from '../../core/constraint/ConstraintGenerator';
import { TaskContextCapsule } from '../../core/types/TCC';

/**
 * MCP Request interface
 */
interface McpRequest {
  method: string;
  params: any;
  id: string | number;
}

/**
 * MCP Response interface
 */
interface McpResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
  };
  id: string | number;
}

/**
 * Constraint violation interface
 */
interface ConstraintViolation {
  id: string;
  severity: 'WARNING' | 'ERROR' | 'FATAL';
  message: string;
  suggestions: string[];
  context: any;
  timestamp: string;
}

/**
 * Initializes the MCP stdio server for DSGS
 * @returns Promise resolving when the server is ready
 */
// Call the initialization function when running directly
if (require.main === module) {
  initializeMcpStdioServer().catch(console.error);
}

export async function initializeMcpStdioServer() {
  // Buffer to accumulate input data
  let buffer = '';
  
  // Add startup message
  console.error('MCP stdio server initialized');
  
  // Listen for data on stdin
  process.stdin.on('data', (chunk) => {
    console.error('Received data chunk:', chunk.toString());
    buffer += chunk.toString();
    
    // Process complete JSON messages
    while (buffer.includes('\n')) {
      const newlineIndex = buffer.indexOf('\n');
      const message = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      
      if (message.trim()) {
        console.error('Processing message:', message);
        try {
          const request: McpRequest = JSON.parse(message);
          console.error('Parsed request:', request);
          handleMcpRequest(request);
        } catch (error) {
          console.error('Parse error:', error);
          const response: McpResponse = {
            error: {
              code: -32700,
              message: 'Parse error'
            },
            id: 'parse-error'
          };
          process.stdout.write(JSON.stringify(response) + '\n');
        }
      }
    }
  });

  // Handle stdin end
  process.stdin.on('end', () => {
    // Don't exit on stdin end - keep server running
    console.error('STDIN ended, but keeping server running');
  });

  // Handle stdin errors
  process.stdin.on('error', (error) => {
    const response: McpResponse = {
      error: {
        code: -32603,
        message: `Internal error: ${error.message}`
      },
      id: 'server-error'
    };
    process.stdout.write(JSON.stringify(response) + '\n');
    // Don't exit on stdin error, just log
    console.error('STDIN error:', error);
  });

  // Keep the process alive
  // Use a simple event listener to prevent exit
  process.on('SIGINT', () => {
    console.error('Received SIGINT, shutting down gracefully');
    process.exit(0);
  });
}

/**
 * Handles incoming MCP requests
 * @param request - The MCP request object
 */
async function handleMcpRequest(request: McpRequest) {
  try {
    let response: McpResponse;
    
    switch (request.method) {
      case 'checkConstraints':
        response = await handleCheckConstraints(request);
        break;
      case 'getSystemStatus':
        response = await handleGetSystemStatus(request);
        break;
      case 'getEvolutionStage':
        response = await handleGetEvolutionStage(request);
        break;
      default:
        response = {
          error: {
            code: -32601,
            message: 'Method not found'
          },
          id: request.id
        };
    }
    
    process.stdout.write(JSON.stringify(response) + '\n');
  } catch (error) {
    const response: McpResponse = {
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      },
      id: request.id
    };
    process.stdout.write(JSON.stringify(response) + '\n');
  }
}

/**
 * Handles the checkConstraints method
 * @param request - The MCP request object
 * @returns Promise resolving to the MCP response
 */
async function handleCheckConstraints(request: McpRequest): Promise<McpResponse> {
  try {
    const { tccPath, specPath } = request.params;
    
    // Validate required parameters
    if (!tccPath || !specPath) {
      return {
        error: {
          code: -32602,
          message: 'Missing required parameters: tccPath and specPath'
        },
        id: request.id
      };
    }

    // Load the specification
    let specification;
    try {
      specification = await loadSpecification(specPath);
    } catch (error) {
      return {
        error: {
          code: -32001,
          message: `Failed to load specification: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        id: request.id
      };
    }

    // Load the task context capsule
    let tcc: TaskContextCapsule;
    try {
      tcc = await loadSpecification(tccPath);
    } catch (error) {
      return {
        error: {
          code: -32002,
          message: `Failed to load task context capsule: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        id: request.id
      };
    }

    // Generate constraints based on the TCC
    let constraints;
    try {
      constraints = generateConstraints(tcc);
    } catch (error) {
      return {
        error: {
          code: -32003,
          message: `Failed to generate constraints: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        id: request.id
      };
    }

    // Check for violations (this would be more complex in a real implementation)
    const violations: ConstraintViolation[] = [];
    
    // In a real implementation, we would check the code against the constraints
    // For now, we'll just return the generated constraints
    return {
      result: {
        constraints,
        violations,
        timestamp: new Date().toISOString()
      },
      id: request.id
    };
  } catch (error) {
    return {
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      },
      id: request.id
    };
  }
}

/**
 * Handles the getSystemStatus method
 * @param request - The MCP request object
 * @returns Promise resolving to the MCP response
 */
async function handleGetSystemStatus(request: McpRequest): Promise<McpResponse> {
  return {
    result: {
      status: 'running',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    },
    id: request.id
  };
}

/**
 * Handles the getEvolutionStage method
 * @param request - The MCP request object
 * @returns Promise resolving to the MCP response
 */
async function handleGetEvolutionStage(request: McpRequest): Promise<McpResponse> {
  // In a real implementation, this would check the current evolution stage
  // For now, we'll return a static response
  return {
    result: {
      currentStage: 'MVP',
      description: 'Minimum Viable Product - Core functionality implemented',
      capabilities: [
        'Basic constraint generation',
        'Task Context Capsule support',
        'MCP integration',
        'CLI interface'
      ],
      timestamp: new Date().toISOString()
    },
    id: request.id
  };
}
