import { getPlyFileFromS3 } from "../services/plyModelServices.js";

export const streamPlyFileFromS3 = (request, response) => {
    const { filename } = request.params;

    if (!filename) {
        return response.status(400).json({ error: 'Filename is required' });
    };

    if (!/^[\w\-\.]+$/.test(filename)) {
        return response.status(400).json({ error: 'Invalid filename' });
    };
    
    try {
        const stream = getPlyFileFromS3(filename);
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