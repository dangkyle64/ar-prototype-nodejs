import { describe, it, expect, vi } from 'vitest';
import { getPlyController } from '../../controllers/getPlyController.js';
import * as getPlyServices from '../../services/getPlyServices.js'; 


vi.mock('../../services/getPlyServices.js');

describe('getPlyController', () => {
    it('should return error message `No file uploaded` when no file is provided', async () => {
        const request = {};
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getPlyController(request, response);

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({
            error: 'No file uploaded',
        });
    });

    it('should return error message when processZipFile returns an error', async () => {
        const fakeError = { error: 'Invalid file format', status: 422 };
        getPlyServices.processZipFile.mockResolvedValue(fakeError);

        const request = {
            file: { buffer: Buffer.from('fake zip content') },
        };
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getPlyController(request, response);

        expect(response.status).toHaveBeenCalledWith(422);
        expect(response.json).toHaveBeenCalledWith({
            error: fakeError.error,
        });
    });

    it('should return success message when file is processed correctly', async () => {
        const fakeSuccess = { message: 'File processed successfully', status: 200 };
        getPlyServices.processZipFile.mockResolvedValue(fakeSuccess);

        const request = {
            file: { buffer: Buffer.from('fake zip content') },
        };
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getPlyController(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith({
            message: fakeSuccess.message,
        });
    });

    it('should return server error message when an unexpected error occurs', async () => {
        const consoleSpy = vi.spyOn(console, 'log');
        getPlyServices.processZipFile.mockRejectedValue(new Error('Unexpected server error'));

        const request = {
            file: { buffer: Buffer.from('fake zip content') },
        };
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getPlyController(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({
            error: 'Server error',
        });
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle empty file buffer', async () => {
        const request = {
            file: { buffer: Buffer.from('') },
        };
        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    
        getPlyServices.processZipFile.mockResolvedValue({
            error: 'No file uploaded',
            status: 400,
        });
    
        await getPlyController(request, response);
    
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
    });
    
    it('should handle invalid buffer type', async () => {
        const request = {
            file: { buffer: "not a buffer" },
        };
        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    
        getPlyServices.processZipFile.mockImplementation(() => {
            throw new Error('Invalid buffer');
        });
    
        await getPlyController(request, response);
    
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
    
    it('should handle unexpected response from processZipFile', async () => {
        const request = {
            file: { buffer: Buffer.from('some data') },
        };
        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    
        getPlyServices.processZipFile.mockResolvedValue({
            error: 'Malformed return',
        });
    
        await getPlyController(request, response);
    
        expect(response.status).toHaveBeenCalledWith(undefined);
        expect(response.json).toHaveBeenCalledWith({
            error: 'Malformed return',
        });
    });

    it('should handle large files gracefully', async () => {
        const largeBuffer = Buffer.alloc(10 * 1024 * 1024);
    
        const request = {
            file: { buffer: largeBuffer },
        };
        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    
        getPlyServices.processZipFile.mockResolvedValue({
            message: 'Processed large file',
            status: 200,
        });
    
        await getPlyController(request, response);
    
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith({
            message: 'Processed large file',
        });
    });

    it('should return 400 if file is provided but buffer is missing', async () => {
        const request = {
            file: {},
        };
        const response = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    
        await getPlyController(request, response);
    
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
    });
    
    it('should return 400 if request.file is null', async () => {
        const request = { file: null };
        const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    
        await getPlyController(request, response);
    
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
    });
    
    it('should return 400 if file.buffer is undefined', async () => {
        const request = { file: { buffer: undefined } };
        const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    
        await getPlyController(request, response);
    
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
    });
    
    it('should handle null return from processZipFile', async () => {
        const request = { file: { buffer: Buffer.from('valid') } };
        const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    
        getPlyServices.processZipFile.mockResolvedValue(null);
    
        await getPlyController(request, response);
    
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
    
    it('should catch errors thrown by processZipFile', async () => {
        const request = { file: { buffer: Buffer.from('valid') } };
        const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    
        getPlyServices.processZipFile.mockRejectedValue(new Error('ZIP parsing failed'));
    
        await getPlyController(request, response);
    
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
    
});
