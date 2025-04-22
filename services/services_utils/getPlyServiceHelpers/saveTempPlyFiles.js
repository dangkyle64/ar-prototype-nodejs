import path from 'path';
import fs from 'fs';

export const saveTempPlyFiles = async (fileEntry, outputDirectory = 'ply') => {
    return new Promise((resolve, reject) => {
        try {
            // sanitize filename just in case
            const safeFilename = path.basename(fileEntry.path);
            const savePath = path.join(outputDirectory, safeFilename);

            if (!fs.existsSync(outputDirectory)) {
                fs.mkdirSync(outputDirectory, { recursive: true });
            }

            const writeStream = fs.createWriteStream(savePath);

            fileEntry.stream()
                .pipe(writeStream)
                .on('finish', () => {
                    console.log(`Saved: ${safeFilename}`);
                    resolve({ status: 200, message: 'Temp files saved successfully' });
                })
                .on('error', (error) => {
                    console.error('Stream error:', error);
                    reject(new Error('Stream error'));
                });

        } catch (error) {
            reject(new Error('Server Error'));
        }
    });
};