import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

export const uploadZippedDirectory = async (zipPath, apiUrl) => {
    const form = new FormData();
    form.append('zip', fs.createReadStream(zipPath));

    try {
        const response = await axios.post(apiUrl, form, {
        headers: {
            ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        });

        return response.data;
    } catch (error) {
        throw new Error(`Failed to upload zip: ${error.response?.statusText || error.message}`);
    };
};
