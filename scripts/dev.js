const { spawn } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const node = process.execPath;
const services = [
  {
    name: 'API',
    cwd: path.join(projectRoot, 'server'),
    args: [path.join(projectRoot, 'server', 'server.js')]
  },
  {
    name: 'Web client',
    cwd: path.join(projectRoot, 'client'),
    args: [path.join(projectRoot, 'client', 'node_modules', 'vite', 'bin', 'vite.js')]
  }
];

let stopping = false;
const children = services.map(({ name, cwd, args }) => {
  const child = spawn(node, args, {
    cwd,
    stdio: 'inherit'
  });

  child.on('error', (error) => {
    console.error(`${name} could not start: ${error.message}`);
    stop(1);
  });

  child.on('exit', (code, signal) => {
    if (!stopping) {
      const reason = signal ? `signal ${signal}` : `code ${code}`;
      console.error(`${name} stopped unexpectedly (${reason}).`);
      stop(code || 1);
    }
  });

  return child;
});

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;

  for (const child of children) {
    if (!child.killed) child.kill();
  }

  setTimeout(() => process.exit(exitCode), 250).unref();
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
