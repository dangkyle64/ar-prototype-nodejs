import { processVideo } from "../services/uploadVideoServices.js";

export const uploadVideoController = async (request, response) => {

    if (!request.file) {
        return response.status(400).json({ error: 'No video file uploaded' });
    };
     
    const allowedMimeTypes = ['video/mp4', 'video/webm'];

    if (!allowedMimeTypes.includes(request.file.mimetype)) {
        return response.status(400).json({ error: 'Unsupported video file type'});
    };

    try {
        const { buffer, mimetype } = request.file;
        console.log(request.file);

        const result = await processVideo(buffer, mimetype);

        response.status(200).json({
            message: 'Video processed successfully',
        });
    } catch(error) {
        console.log(error);
        response.status(500).json({ error: 'Error processing video' });
    };
};