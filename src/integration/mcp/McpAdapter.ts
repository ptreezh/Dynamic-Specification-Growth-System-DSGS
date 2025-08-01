/**
 * McpAdapter provides MCP-compliant interface for IDE integration
 * It handles communication between DSGS and IDEs like Cline/VS Studio
 * 
 * @module McpAdapter
 */

import { loadSpecification } from '../../core/specification/SpecificationManager';
import { generateConstraints } from '../../core/constraint/ConstraintGenerator';
import { TaskContextCapsule } from '../../core/types/TCC';

/**
 * MCP Server configuration interface
 */
interface McpServerConfig {
  port: number;
  host: string;
  maxConnections: number;
}

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
 * Initializes the MCP server for DSGS
 * @param config - Server configuration options
 * @returns Promise resolving to the server instance
 */
export async function initializeMcpServer(config: McpServerConfig) {
  // Import http module dynamically to avoid issues in testing environments
  const http = await import('http');
  
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          res.end();
          return;
        }

        // Only accept POST requests
        if (req.method !== 'POST') {
          const response = {
            error: {
              code: -32600,
              message: 'Method not allowed'
            },
            id: 'method-not-allowed'
          };
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify(response));
          return;
        }

        // Read request body
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const request: McpRequest = JSON.parse(body);
            const response = await handleMcpRequest(request);
            
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(response));
          } catch (error) {
          const response: McpResponse = {
            error: {
              code: -32700,
              message: 'Parse error'
            },
            id: 'parse-error'
          };
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(response));
          }
        });
      } catch (error) {
        const response: McpResponse = {
          error: {
            code: -32603,
            message: 'Internal error'
          },
          id: 'server-error'
        };
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(response));
        return; // Ensure we don't continue processing after sending error response
      }
    });

    server.listen(config.port, config.host, () => {
      console.log(`MCP server running at http://${config.host}:${config.port}`);
      resolve(server);
    });

    server.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Handles incoming MCP requests
 * @param request - The MCP request object
 * @returns Promise resolving to the MCP response
 */
async function handleMcpRequest(request: McpRequest): Promise<McpResponse> {
  try {
    switch (request.method) {
      case 'checkConstraints':
        return await handleCheckConstraints(request);
      case 'getSystemStatus':
        return await handleGetSystemStatus(request);
      case 'getEvolutionStage':
        return await handleGetEvolutionStage(request);
      default:
        return {
          error: {
            code: -32601,
            message: 'Method not found'
          },
          id: request.id
        };
    }
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
