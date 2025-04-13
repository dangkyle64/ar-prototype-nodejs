import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { Readable } from 'stream';
import path from 'path';

// using static version of ffmpeg since fluent is just a wrapper
ffmpeg.setFfmpegPath(ffmpegPath);

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

export const generateOutputPath = (outputDir, filename) => {
    return path.join(outputDir, `${filename}.mp4`);
};