import { getAllPlyFileKeys, getPlyFileFromS3 } from "../services/plyModelServices.js";
import dotenv from 'dotenv';

dotenv.config();

export const streamPlyFileFromS3 = (request, response) => {
    const { filename } = request.params;

    if (!filename) {
        return response.status(400).json({ error: 'Filename is required' });
    };

    if (!/^[\w\-\.]+$/.test(filename)) {
        return response.status(400).json({ error: 'Invalid filename' });
    };
    
    try {
        const stream = getPlyFileFromS3(filename, process.env.R2_BUCKET);
        response.setHeader('Content-Type', 'application/octet-stream');
        stream.pipe(response);
    } catch(error) {
        console.error(error);

        const message = error.message || '';
        if (message.includes('not found')) {
            response.status(404).json({ error: 'File not found' });
        } else {
            response.status(500).json({ error: 'Internal server error' });
        };
    };
};

export const getAllPlyFilesFromS3 = async (request, response) => {
    try {
        const fileKeys = await getAllPlyFileKeys();

        if (!Array.isArray(fileKeys)) {
            throw new Error('Malformed response: Missing "Contents" field');
        };

        const validKeys = fileKeys.filter(key => key != null);

        response.status(200).json(validKeys);
    } catch(error) {
        console.error(error);

        const message = error.message || '';
        if (message.includes('not found')) {
            response.status(404).json({ error: 'Files not found' });
        } else {
            response.status(500).json({ data: [], error: 'Internal server error' });
        };
    };
};