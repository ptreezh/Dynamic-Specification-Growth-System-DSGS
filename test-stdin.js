process.stdin.setEncoding('utf8');

console.log('Waiting for input...');

process.stdin.on('data', (chunk) => {
  console.log('Received chunk:', chunk);
  process.stdin.pause();
});

process.stdin.on('end', () => {
  console.log('Stdin ended');
});

process.stdin.on('error', (err) => {
  console.error('Stdin error:', err);
});
