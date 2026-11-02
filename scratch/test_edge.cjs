const { spawn } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=9222',
  'http://localhost:3000'
];

const proc = spawn(edgePath, args);

setTimeout(async () => {
  try {
    const http = require('http');
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Edge debugging targets:', data);
        proc.kill();
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Error connecting to Edge CDP:', err);
    proc.kill();
    process.exit(1);
  }
}, 3000);

