import { spawn } from 'child_process';

const runColmap = (args = []) => {
  const dockerArgs = [
    'run',
    '--gpus', 'all',
    '--rm',
    'colmap/colmap',
    'colmap', // 👈 this is the actual binary to run
    ...args
  ];

  const colmap = spawn('docker', dockerArgs);

  colmap.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  colmap.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  colmap.on('close', (code) => {
    console.log(`COLMAP process exited with code ${code}`);
  });
};

// Now run a valid COLMAP subcommand
runColmap(['feature_extractor', '--help']);
