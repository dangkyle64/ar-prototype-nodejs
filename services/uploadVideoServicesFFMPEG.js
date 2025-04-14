import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

export const extractFramesFromWebm = (webmPath, outputDir, options = {}) => {
  const {
    fps = null,
    frameStep = null     
  } = options;

  return new Promise((resolve, reject) => {
    fs.mkdirSync(outputDir, { recursive: true });

    ffmpeg.setFfmpegPath(ffmpegPath);

    const command = ffmpeg(webmPath);

    if (fps) {
      command.outputOptions(['-vf', `fps=${fps}`]);
    } else if (frameStep) {
      command.outputOptions(['-vf', `select=not(mod(n\\,${frameStep}))`, '-vsync', 'vfr']);
    } else {
      // Default: extract all frames
    };

    const outputPattern = path.join(outputDir, 'frame_%04d.jpg');

    command
      .output(outputPattern)
      .on('start', cmd => console.log('📽️ FFmpeg command:', cmd))
      .on('end', () => {
        console.log('✅ Frame extraction complete');
        resolve();
      })
      .on('error', err => {
        console.error('❌ FFmpeg error:', err.message);
        reject(err);
      })
      .run();
  });
}
