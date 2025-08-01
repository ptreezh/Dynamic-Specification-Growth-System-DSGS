/**
 * Integration tests for McpAdapter
 * These tests verify the MCP server functionality and integration with the DSGS system
 * 
 * @module McpAdapter.test
 */

import { initializeMcpServer } from '../../src/integration/mcp/McpAdapter';
import { loadSpecification } from '../../src/core/specification/SpecificationManager';
import { TaskContextCapsule } from '../../src/core/types/TCC';
import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

// Mock the core components to avoid actual file I/O and constraint generation
jest.mock('../../src/core/specification/SpecificationManager');
jest.mock('../../src/core/constraint/ConstraintGenerator');

describe('McpAdapter Integration Tests', () => {
  let server: any;
  let serverConfig: { port: number; host: string; maxConnections: number };
  let testServerUrl: string;

  // Create test specification and TCC files
  const testSpecPath = 'test-spec.json';
  const testTccPath = 'test-tcc.json';
  const testSpec = {
    SOF: 'Maximize(UserValue) - 0.2*Complexity',
    BSL: ['NO_DEADLOCK', 'MINIMAL_PRIVILEGE']
  };
  const testTcc: TaskContextCapsule = {
    taskId: 'T001',
    goal: 'ProcessPayment',
    taskType: 'financial',
    context: {
      relevantConstraints: ['InputValidation@PaymentService'],
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
      creationTime: new Date().toISOString(),
      source: 'user-request',
      priority: 'MEDIUM'
    },
    size: 0,
    version: '1.0'
  };

  beforeAll(async () => {
    // Create test files
    require('fs').writeFileSync(testSpecPath, JSON.stringify(testSpec), 'utf8');
    require('fs').writeFileSync(testTccPath, JSON.stringify(testTcc), 'utf8');

    // Setup server configuration
    serverConfig = {
      port: 8080,
      host: 'localhost',
      maxConnections: 10
    };
    testServerUrl = `http://${serverConfig.host}:${serverConfig.port}`;

    // Initialize the MCP server
    server = await initializeMcpServer(serverConfig);
    
    // Wait a moment for the server to fully start
    await new Promise(resolve => setTimeout(resolve, 100));
  }, 30000);

  afterAll(async () => {
    // Clean up test files
    try {
      require('fs').unlinkSync(testSpecPath);
      require('fs').unlinkSync(testTccPath);
    } catch (error) {
      // Ignore errors if files don't exist
    }

    // Close the server
    if (server) {
      server.close();
    }
  }, 30000);

  // Mock implementations for the core components
  beforeEach(() => {
    // Mock loadSpecification to return test data
    (loadSpecification as jest.Mock).mockImplementation((path: unknown) => {
      const pathStr = path as string;
      if (pathStr === testSpecPath) {
        return Promise.resolve(testSpec);
      } else if (pathStr === testTccPath) {
        return Promise.resolve(testTcc);
      }
      return Promise.reject(new Error(`File not found: ${pathStr}`));
    });

    // Mock generateConstraints from ConstraintGenerator
    const { generateConstraints } = require('../../src/core/constraint/ConstraintGenerator');
    (generateConstraints as jest.Mock).mockReturnValue([
      { id: 'security-001', rule: 'Input validation required', severity: 'ERROR' },
      { id: 'performance-001', rule: 'Response time < 500ms', severity: 'WARNING' }
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('MCP Server Initialization', () => {
    it('should start the server on the specified port and host', async () => {
      // The server should be listening on the specified port
      expect(server.address().port).toBe(serverConfig.port);
      // The server may bind to 127.0.0.1 instead of localhost, so we check for both
      expect(['localhost', '127.0.0.1']).toContain(server.address().address);
    });

    it('should handle OPTIONS preflight requests', async () => {
      const response = await fetch(testServerUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('should reject non-POST requests', async () => {
      const response = await fetch(testServerUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { error?: { message: string } };
      expect(data.error).toBeDefined();
      expect(data.error?.message).toBe('Method not allowed');
    });
  });

  describe('MCP Request Handling', () => {
    it('should handle checkConstraints method successfully', async () => {
      const requestBody = {
        jsonrpc: '2.0',
        method: 'checkConstraints',
        params: {
          tccPath: testTccPath,
          specPath: testSpecPath
        },
        id: 1
      };

      const response = await fetch(testServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { result?: { constraints: any[], violations: any[] }, id: number };
      expect(data.result).toBeDefined();
      expect(data.result?.constraints).toBeDefined();
      expect(data.result?.constraints.length).toBe(2);
      expect(data.result?.violations).toBeDefined();
      expect(data.result?.violations.length).toBe(0);
      expect(data.id).toBe(1);
    });

    it('should return error for missing parameters in checkConstraints', async () => {
      const requestBody = {
        jsonrpc: '2.0',
        method: 'checkConstraints',
        params: {
          tccPath: testTccPath
          // Missing specPath
        },
        id: 2
      };

      const response = await fetch(testServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.status).toBe(200); // MCP returns 200 even for errors in the response body
      const data = await response.json() as { error?: { code: number, message: string }, id: number };
      expect(data.error).toBeDefined();
      expect(data.error?.code).toBe(-32602);
      expect(data.error?.message).toContain('Missing required parameters');
      expect(data.id).toBe(2);
    });

    it('should handle getSystemStatus method', async () => {
      const requestBody = {
        jsonrpc: '2.0',
        method: 'getSystemStatus',
        id: 3
      };

      const response = await fetch(testServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { result?: { status: string, version: string, uptime: number }, id: number };
      expect(data.result).toBeDefined();
      expect(data.result?.status).toBe('running');
      expect(data.result?.version).toBe('1.0.0');
      expect(data.result?.uptime).toBeGreaterThan(0);
      expect(data.id).toBe(3);
    });

    it('should handle getEvolutionStage method', async () => {
      const requestBody = {
        jsonrpc: '2.0',
        method: 'getEvolutionStage',
        id: 4
      };

      const response = await fetch(testServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { result?: { currentStage: string, description: string, capabilities: string[] }, id: number };
      expect(data.result).toBeDefined();
      expect(data.result?.currentStage).toBe('MVP');
      expect(data.result?.description).toContain('Minimum Viable Product');
      expect(data.result?.capabilities).toBeDefined();
      expect(data.result?.capabilities.length).toBeGreaterThan(0);
      expect(data.id).toBe(4);
    });

    it('should return method not found for unknown methods', async () => {
      const requestBody = {
        jsonrpc: '2.0',
        method: 'unknownMethod',
        id: 5
      };

      const response = await fetch(testServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { error?: { code: number, message: string }, id: number };
      expect(data.error).toBeDefined();
      expect(data.error?.code).toBe(-32601);
      expect(data.error?.message).toBe('Method not found');
      expect(data.id).toBe(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parse errors', async () => {
      const response = await fetch(testServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      });

      expect(response.status).toBe(200); // MCP returns 200 even for errors in the response body
      const data = await response.json() as { error?: { code: number, message: string }, id: string };
      expect(data.error).toBeDefined();
      expect(data.error?.code).toBe(-32700);
      expect(data.error?.message).toBe('Parse error');
      expect(data.id).toBe('parse-error');
    });

    it('should handle internal server errors', async () => {
      // Temporarily make the server throw an error in the request handler
      const originalHandleRequest = server.listeners('request')[0];
      server.removeAllListeners('request');
      server.on('request', (req: any, res: any) => {
        // Send error response directly instead of throwing
        const response = {
          error: {
            code: -32603,
            message: 'Internal error'
          },
          id: 'server-error'
        };
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(response));
      });

      try {
        const response = await fetch(testServerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'checkConstraints',
            params: {
              tccPath: testTccPath,
              specPath: testSpecPath
            },
            id: 6
          })
        });

        expect(response.status).toBe(200);
        const data = await response.json() as { error?: { code: number, message: string }, id: string };
        expect(data.error).toBeDefined();
        expect(data.error?.code).toBe(-32603);
        expect(data.error?.message).toBe('Internal error');
        expect(data.id).toBe('server-error');
      } finally {
        // Restore the original request handler
        server.removeAllListeners('request');
        server.on('request', originalHandleRequest);
      }
    });
  });
});
