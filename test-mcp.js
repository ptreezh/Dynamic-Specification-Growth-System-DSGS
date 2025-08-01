const { spawn } = require('child_process');

// Start the MCP server
const server = spawn('node', ['d:/DAIP/dnaSpec/dsgs/dist/integration/mcp/McpStdioServer.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Capture all output
const output = [];
server.stdout.on('data', (data) => {
  output.push(`STDOUT: ${data.toString().trim()}`);
  console.log('Received from server:', data.toString().trim());
});

server.stderr.on('data', (data) => {
  output.push(`STDERR: ${data.toString().trim()}`);
  console.error('Server stderr:', data.toString().trim());
});

server.on('error', (err) => {
  output.push(`ERROR: ${err.toString()}`);
  console.error('Server error:', err);
});

server.on('close', (code) => {
  output.push(`CLOSED: ${code}`);
  console.log('Server process closed with code:', code);
  console.log('Full output:', JSON.stringify(output, null, 2));
});

// Send a test request
setTimeout(() => {
  console.log('Sending request: {"method":"getSystemStatus","id":1}');
  server.stdin.write('{"method":"getSystemStatus","id":1}\n');
  console.log('Message sent, waiting for response...');
}, 1000);

// Keep the script running for a few seconds to receive response
setTimeout(() => {
  server.stdin.end();
  console.log('Input stream ended');
}, 3000);

setTimeout(() => {
  server.kill();
  console.log('Test completed');
}, 5000);
