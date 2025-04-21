import { getPlyFileFromS3 } from "../services/plyModelServices.js";

export const streamPlyFileFromS3 = (request, response) => {
    const { filename } = request.params;

    try {
        const stream = getPlyFileFromS3(filename);
        response.setHeader('Content-Type', 'application/octet-stream');
        stream.pipe(response);
    } catch(error) {
        console.error(error);
        response.status(404).json({ error: 'File not found' });
    };
};