import cv from 'opencv4nodejs-prebuilt-install';
import fs from 'fs';
import path from 'path';

export const getVideoFrames = (tempMP4File) => {
    try {

        if (!fs.existsSync(tempMP4File)) {
            console.error('File not found:', tempMP4File);
            throw new Error('MP4 file not found after conversion');
        };

        const cap = new cv.VideoCapture(tempMP4File, cv.CAP_FFMPEG);

        const outputDir = './frames_output/';
        fs.mkdirSync(outputDir, { recursive: true });

        let frameCount = 0;
        let savedCount = 0;
        const frameStep = 15;

        while (true) {
            const frame = cap.read();

            if (frame.empty) {
                break;
            };

            if (frameCount % frameStep === 0) {
                const framePath = path.join(outputDir, `frame_${savedCount.toString().padStart(4, '0')}.jpg`);
                cv.imwrite(framePath, frame);
                console.log(`Saved frame ${frameCount} as ${framePath}`);
                savedCount++;
            };

            frameCount++;
        };

    } catch(error) {
        console.error('Error getting frames from video: ', error);
        return;
    };
};

//const pathToVideo = 'services/temp_video_output/planet.mp4'
//getVideoFrames(pathToVideo);