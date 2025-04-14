import fs from 'fs';
import path from 'path';
import { generateOutputPath, isValidVideo } from "./uploadVideoServicesUtils.js";
import { extractFramesFromWebm } from './uploadVideoServicesFFMPEG.js';

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
        fs.mkdirSync(outputDir, { recursive: true });
        const filename = `video_${Date.now()}`;
        const outputPath = generateOutputPath(outputDir, filename);

        if (mimetype === 'video/mp4') {
            console.log('MP4 file — no conversion needed');
            fs.writeFileSync(outputPath, buffer); 

        } else if (mimetype === 'video/webm') {
            console.log('Converting .webm to .mp4...');
            fs.writeFileSync(outputPath, buffer); 
            console.log('Conversion done. Output path:', path.resolve(outputPath));

        } else {
            console.error('Unsupported mimetype:', mimetype); 
            throw new Error('Unsupported mimetype');
        };
        
        await extractFramesFromWebm(
            path.resolve(outputPath),
            './frames_output',
            { frameStep: 15},
        );

    } catch(error) {
        console.error('Process video error:', error.message || error);
        throw error; 
    };
};

//docker run --gpus all -it colmap/colmap bash
//nvidia-smi