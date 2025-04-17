import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export const zipImageDirectory = (sourceDir, outPath) => {
    return new Promise((resolve, reject) => {

        if (!fs.existsSync(sourceDir)) {
            return reject(new Error(`Source directory does not exist: ${sourceDir}`));
        };
        
        const zipDir = path.dirname(outPath);
        fs.mkdirSync(zipDir, { recursive: true });

        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`ZIP complete: ${archive.pointer()} bytes`);
            resolve();
        });

        archive.on('error', err => reject(err));

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
};
