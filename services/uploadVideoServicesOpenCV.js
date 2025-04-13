import cv from 'opencv4nodejs-prebuilt-install';

export const getVideoFrames = (tempMP4File) => {
    try {
        const videoCapture = new cv.VideoCapture(tempMP4File);

        const frame = videoCapture.read();

        if (frame.empty) {
            throw new Error('Failed to read frame from video');
        };
    } catch(error) {
        console.error('Error getting frames from video: ', error);
        return;
    };
};
