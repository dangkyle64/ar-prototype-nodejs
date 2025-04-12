import multer from 'multer';
import { handleFileError } from '../../routers/uploadVideoRouterUtils.js';

describe('handleFileError', () => {
    let response;
    let next;

    beforeEach(() => {
        response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        next = vi.fn();
    });

    it('should return 413 if file size limit is exceeded', () => {
        const error = new multer.MulterError('LIMIT_FILE_SIZE');

        handleFileError(error, {}, response, next);

        expect(response.status).toHaveBeenCalledWith(413);
        expect(response.json).toHaveBeenCalledWith({ error: 'Video file is too large' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 for other errors', () => {
        const error = new Error('Some random error');

        handleFileError(error, {}, response, next);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if no error is passed', () => {
        handleFileError(null, {}, response, next);

        expect(next).toHaveBeenCalled();
        expect(response.status).not.toHaveBeenCalled();
        expect(response.json).not.toHaveBeenCalled();
    });
});
