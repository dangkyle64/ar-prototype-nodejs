import fs from 'fs';
import axios from 'axios';

export const uploadZippedDirectory = async (zipPath, apiUrl) => {
    const fileStream = fs.createReadStream(zipPath);

    try {
        const response = await axios.post(apiUrl, fileStream, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Length': fs.statSync(zipPath).size,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        });

        return response.data;
    } catch (error) {
        throw new Error(`Failed to upload zip: ${error.response?.statusText || error.message}`);
    };
};
