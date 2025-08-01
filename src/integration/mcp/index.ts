/**
 * MCP integration module for DSGS
 * Exports both HTTP and stdio server implementations
 * 
 * @module mcp
 */

export { initializeMcpServer } from './McpAdapter';
export { initializeMcpStdioServer } from './McpStdioServer';
