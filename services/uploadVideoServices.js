import fs from 'fs';
import path from 'path';
import { convertWebmToMp4, generateOutputPath, isValidVideo } from "./uploadVideoServicesUtils.js";
import { getVideoFrames } from './uploadVideoServicesOpenCV.js';

export const processVideo = async (buffer, mimetype) => {
    try {
        console.log({
            mimetype: mimetype,
            size: buffer.length,
            message: 'Video processed in-memory',
        });

        if (!['video/webm', 'video/mp4'].includes(mimetype)) {
            console.error('Unsupported mimetype');
            return;
        };

        if (!(await isValidVideo(buffer))) {
            throw new Error('Invalid video buffer');
        };

        const outputDir = './services/temp_video_output/';
        const filename = `video_${Date.now()}`;
        const outputPath = generateOutputPath(outputDir, filename);

        if (mimetype === 'video/mp4') {
            console.log('MP4 file — no conversion needed');
            fs.writeFileSync(outputPath, buffer); 

        } else if (mimetype === 'video/webm') {
            console.log('Converting .webm to .mp4...');
            await convertWebmToMp4(buffer, outputPath); 
            console.log('Conversion done. Output path:', path.resolve(outputPath));

        } else {
            console.error('Unsupported mimetype:', mimetype); 
            throw new Error('Unsupported mimetype');
        };
        
        //getVideoFrames(outputPath);

    } catch(error) {
        console.error('Process video error:', error.message || error);
        throw error; 
    };
};

//docker run --gpus all -it colmap/colmap bash
//nvidia-smi