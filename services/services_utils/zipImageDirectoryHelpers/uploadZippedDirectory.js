import fs from 'fs';
import fetch from 'node-fetch';

export const uploadZippedDirectory = async (zipPath, apiUrl) => {
    const fileStream = fs.createReadStream(zipPath);

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/zip',
        },
        body: fileStream
    });

    if (!response.ok) {
        throw new Error(`Failed to upload zip: ${response.statusText}`);
    }

    return response.json();
};
