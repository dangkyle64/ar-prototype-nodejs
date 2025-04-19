import fs from 'fs';
import path from 'path';
import { uploadZippedDirectory } from './zipImageDirectoryHelpers/uploadZippedDirectory.js';
import { createOutputStream } from './zipImageDirectoryHelpers/createOutputStream.js';
import { handleOutputErrors } from './zipImageDirectoryHelpers/handleOutputErrors.js';
import { createZipArchive } from './createZipArchive.js';

export const zipImageDirectory = (sourceDir, outputPath) => {
    return new Promise((resolve, reject) => {

        if (!fs.existsSync(sourceDir)) {
            return reject(new Error(`Source directory does not exist: ${sourceDir}`));
        };
        
        const zipDir = path.dirname(outputPath);
        fs.mkdirSync(zipDir, { recursive: true });

        const output = createOutputStream(outputPath, reject);

        output.on('error', handleOutputErrors(reject));

        output.on('close', () => {

            const apiUrl = 'https://7d52-172-88-117-116.ngrok-free.app/colmap-api'; // TEMPORARY

            console.log(`ZIP complete.`);
            uploadZippedDirectory(outputPath, apiUrl)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(new Error(`Upload failed: ${err.message}`));
            });
        });

        createZipArchive(sourceDir, reject, output);
    });
};
