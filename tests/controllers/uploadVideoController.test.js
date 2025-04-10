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
});