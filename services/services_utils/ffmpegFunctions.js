import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';
import { Readable } from 'stream';

// using static version of ffmpeg since fluent is just a wrapper
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

export const convertWebmToMp4 = (buffer, outputPath) => {
    return new Promise((resolve, reject) => {
        // set it to read it like a inputed file rather than a raw buffer input
        const stream = new Readable();
        stream.push(buffer);

        // say that the stream is complete and can now be converted
        stream.push(null);

        ffmpeg(stream)
            .inputFormat('webm')
            .toFormat('mp4')
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
};

export const isValidVideo = (buffer) => {
    return new Promise((resolve) => {
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        ffmpeg(stream).ffprobe((err, data) => {
            if (err) {
                console.error('Invalid video:', err.message);
                return resolve(false);
            };

            const hasStreams = data && data.streams && data.streams.length > 0;
            resolve(hasStreams);
        });
    });
};
