import { describe, it, expect } from 'vitest';
import { uploadVideoController } from '../../controllers/uploadVideoController';
import { processVideo } from '../../services/uploadVideoServices';

vi.mock('../../services/uploadVideoServices');

describe('uploadVideoController', () => {
    it('should return error message `No video file uploaded when not given a video file', async () => {
        const request = {};
        const response = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await uploadVideoController(request, response);

        expect(response.status).toHaveBeenCalledWith (400);
        expect(response.json).toHaveBeenCalledWith ({
            error: 'No video file uploaded',
        });
    });

    it('should return success message when a valid video file is uploaded', async () => {
        const mockResult = { message: 'Video processed successfully' };
        processVideo.mockResolvedValue(mockResult);

        const request = {
            file: { 
                buffer: Buffer.from('mock video content'),
                mimetype: 'video/webm',
            }
        };

        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await uploadVideoController(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return error message when file property is missing in the request object', async () => {
        const request = {};
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await uploadVideoController(request, response);

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({
            error: 'No video file uploaded',
        });
    });

    it('should return error message when an invalid file type is uploaded', async () => {
        const request = {
            file: { buffer: Buffer.from('mock text content'), mimetype: 'text/plain' }
        };

        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await uploadVideoController(request, response);

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({
            error: 'Unsupported video file type',
        });
    });

    it('should return a 500 error if processVideo throws', async () => {
        processVideo.mockImplementation(() => {
            throw new Error('Something broke');
        });
    
        const request = {
            file: {
                buffer: Buffer.from('mock video content'),
                mimetype: 'video/webm',
            }
        };
    
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };
    
        await uploadVideoController(request, response);
    
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({
            error: 'Error processing video',
        });
    });

    it('should return error when multiple files are uploaded', async () => {
        const request = {
            files: [
                {
                    buffer: Buffer.from('mock video content'),
                    mimetype: 'video/webm',
                },
                {
                    buffer: Buffer.from('mock video content 2'),
                    mimetype: 'video/mp4',
                },
            ]
        };

        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await uploadVideoController(request, response);

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({
            error: 'Only one video file is allowed',
        });
    });
    
    it('should handle unexpected result format from processVideo', async () => {
        processVideo.mockResolvedValueOnce({ unexpectedKey: 'unexpected value' });

        const request = {
            file: {
                buffer: Buffer.from('mock video content'),
                mimetype: 'video/webm',
            }
        };

        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await uploadVideoController(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith({
            message: 'Video processed successfully',
        });
    });

    it('should return 500 error if video processing fails due to service error', async () => {
        processVideo.mockRejectedValueOnce(new Error('Service failure during video processing'));

        const request = {
            file: {
                buffer: Buffer.from('mock video content'),
                mimetype: 'video/webm',
            }
        };

        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await uploadVideoController(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({
            error: 'Error processing video',
        });
    });

    it('should return error message when MIME type is missing', async () => {
        const request = {
            file: {
                buffer: Buffer.from('mock video content'),
                mimetype: undefined,
            }
        };

        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await uploadVideoController(request, response);

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({
            error: 'Unsupported video file type',
        });
    });

    it('should return error message when MIME type has extra spaces', async () => {
        const request = {
            file: {
                buffer: Buffer.from('mock video content'),
                mimetype: 'video/webm ',
            }
        };

        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await uploadVideoController(request, response);

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({
            error: 'Unsupported video file type',
        });
    });

    it('should return error message if file buffer is empty', async () => {
        const request = {
            file: {
                buffer: Buffer.from(''),
                mimetype: 'video/webm',
            }
        };

        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await uploadVideoController(request, response);

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({
            error: 'No video file uploaded',
        });
    });
});