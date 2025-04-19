import { processZipFile } from "../services/getPlyServices.js";

export const getPlyController = async (request, response) => {
    try {

        //console.log('Received request:', request.file);

        if (!request.file) {
            return response.status(400).json({ error: 'No file uploaded' });
        };

        const zipPlyBuffer = request.file.buffer;
        const result = await processZipFile(zipPlyBuffer);

        if (result.error) {
            console.log('It failed.');
            return response.status(result.status).json({ error: result.error });
        };

        return response.status(result.status).json({ message: result.message });
    } catch(error) {
        console.log(error);
        return response.status(500).json({ error: 'Server error' });
    };
};