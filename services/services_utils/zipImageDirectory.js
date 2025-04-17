import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const handleOutputErrors = (reject) => (error) => {
    reject(new Error(`File write error: ${error.message}`));
};

const handleArchiveError = (reject) => (error) => {
    reject(new Error(`Archiver error: ${error.message}`));
};

const createOutputStream = (outputPath, reject) => {
    let output;
    try {
        output = fs.createWriteStream(outputPath);
    } catch(error) {
        return reject(newError(`Failed to create write stream: ${error.message}`));
    };
    return output;
};

const createZipArchive = (sourceDir, reject, output) => {
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
            console.log(`ZIP complete.`);
            resolve();
        });

        createZipArchive(sourceDir, reject, output);

    });
};
