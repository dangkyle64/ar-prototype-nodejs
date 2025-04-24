import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { uploadZippedDirectory } from './zipImageDirectoryHelpers/uploadZippedDirectory.js';
import { createOutputStream } from './zipImageDirectoryHelpers/createOutputStream.js';
import { handleOutputErrors } from './zipImageDirectoryHelpers/handleOutputErrors.js';
import { createZipArchive } from './zipImageDirectoryHelpers/createZipArchive.js';

dotenv.config();

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

            const apiUrl = `${process.env.API_ENDPOINT}/colmap-api`; 

            console.log(`ZIP complete.`);
            console.log(`Uploading file: ${outputPath}`);
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
