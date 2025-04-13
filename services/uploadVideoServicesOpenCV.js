import cv from 'opencv4nodejs-prebuilt-install';
import fs from 'fs';

export const getVideoFrames = (tempMP4File) => {
    try {

        if (!fs.existsSync(tempMP4File)) {
            console.error('File not found:', tempMP4File);
            throw new Error('MP4 file not found after conversion');
        };

        const cap = new cv.VideoCapture(tempMP4File, cv.CAP_FFMPEG);

        const frame = videoCapture.read();

        if (frame.empty) {
            throw new Error('Failed to read frame from video');
        };
    } catch(error) {
        console.error('Error getting frames from video: ', error);
        return;
    };
};
