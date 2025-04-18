import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { handleArchiveError } from './zipImageDirectoryHelpers/handleArchiveErrors.js';
import { uploadZippedDirectory } from './zipImageDirectoryHelpers/uploadZippedDirectory.js';

export const handleOutputErrors = (reject) => (error) => {

    if (typeof reject !== 'function') {
        throw new Error('reject is not a function');
    };

    if (!error) {
        throw new Error('No error provided');
    };

    let errorMessage;
    if (error && error.message) {
        errorMessage = error.message;
    } else {
        errorMessage = 'Unknown error';
    };

    reject(new Error(`File write error: ${errorMessage}`));
};

export const createOutputStream = (outputPath, reject) => {
    let output;
    try {
        output = fs.createWriteStream(outputPath);
    } catch(error) {
        return reject(new Error(`Failed to create write stream: ${error.message}`));
    };
    return output;
};

export const createZipArchive = (sourceDir, reject, output) => {
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.on('error', handleArchiveError(reject));
    archive.directory(sourceDir, false);
    archive.finalize();
};

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

            const apiUrl = 'https://3a74-172-88-117-116.ngrok-free.app/colmap-api'; // TEMPORARY

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
