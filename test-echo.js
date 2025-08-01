console.error('Echo server started');

process.stdin.on('data', (chunk) => {
  console.error('Received:', chunk.toString());
  console.log('Echo:', chunk.toString().trim());
});

process.stdin.on('end', () => {
  console.error('Stdin ended');
});

process.stdin.on('error', (err) => {
  console.error('Stdin error:', err);
});
