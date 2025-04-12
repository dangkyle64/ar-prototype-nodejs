import { convertWebmToMp4 } from "./uploadVideoServicesUtils.js";

export const processVideo = async (buffer, mimetype) => {
    try {
        console.log({
            mimetype: mimetype,
            size: buffer.length,
            message: 'Video processed in-memory',
        });

        if (!['video/webm', 'video/mp4'].includes(mimetype)) {
            throw new Error('Unsupported mimetype');
        };

        const outputPath = './temp_video_output/output.mp4';

        if (mimetype === 'video/webm') {
            
            await convertWebmToMp4(buffer, outputPath);
            console.log('webm file converted.');
        } else {
            console.log('mp4 file');
        };

    } catch(error) {
        console.error({
            error: 'Error processing video',
        });
    };
};

//docker run --gpus all -it colmap/colmap bash
//nvidia-smi