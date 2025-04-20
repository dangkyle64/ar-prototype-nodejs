import path from 'path';
import fs from 'fs';

export const saveTempPlyFiles = async (fileEntry, outputDirectory = 'ply') => {

    try {
         // sanitize filename just in case
        const safeFilename = path.basename(fileEntry.path);
        const savePath = path.join(outputDirectory, safeFilename);

        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory, { recursive: true });
        }

        const writeStream = fs.createWriteStream(savePath);

        await new Promise((resolve, reject) => {
            fileEntry.stream()
                .pipe(writeStream)
                .on('finish', resolve)
                .on('error', (error) => {
                    console.error('Stream error:', error);
                    reject(error);
                });
        });

        console.log(`Saved: ${safeFilename}`);

        return { status: 200, message: 'Temp files saved successfully' };
    } catch(error) {
        return { status: 500, error: 'Server Error' };
    };
};