import { spawn } from 'child_process';

export const runColmap = (args = []) => {
    return new Promise((resolve, reject) => {
        const dockerArgs = [
        'run',
        '--gpus', 'all',
        '--rm',
        '-v', `${process.cwd()}/images:/images`,
        '-v', `${process.cwd()}/colmap_output:/workspace`,
        'colmap/colmap',
        'colmap',
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
        if (code === 0) resolve();
        else reject(new Error(`COLMAP failed with exit code ${code}`));
        });
    });
};
