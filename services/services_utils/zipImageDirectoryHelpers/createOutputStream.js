import fs from 'fs';

export const createOutputStream = (outputPath, reject) => {
    let output;
    try {
        output = fs.createWriteStream(outputPath);
    } catch(error) {
        return reject(new Error(`Failed to create write stream: ${error.message}`));
    };
    return output;
};