import path from 'path';

export const generateOutputPath = (outputDir, filename) => {
    return path.join(outputDir, `${filename}.mp4`);
};