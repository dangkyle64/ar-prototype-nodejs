import multer from "multer";

export const handleFileError = (error, request, response, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return response.status(413).json({ error: 'Video file is too large' });
        };
    } else if (error) {
        return response.status(500).json({ error: 'Internal server error' });
    };
    next();
};