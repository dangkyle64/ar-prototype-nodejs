import { describe, it, expect, vi } from 'vitest';
import { streamPlyFileFromS3 } from '../../controllers/plyModelController.js';
import { getPlyFileFromS3 } from '../../services/plyModelServices.js';
import { Readable } from 'stream';

vi.mock('../../services/plyModelServices.js', () => ({
    getPlyFileFromS3: vi.fn(),
}));

describe('plyModelController', () => {
    it('should stream the PLY file when found', () => {
        const mockStream = new Readable({
            read() {
                this.push('mock ply file data');
                this.push(null);
            }
        });
    
        getPlyFileFromS3.mockReturnValue(mockStream);
    
        const request = { params: { filename: 'fused.ply' } };
        const response = {
            setHeader: vi.fn(),
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            pipe: vi.fn(), 
        };
    
        mockStream.pipe = vi.fn();
    
        streamPlyFileFromS3(request, response);
    
        expect(getPlyFileFromS3).toHaveBeenCalledWith('fused.ply');
        expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
        expect(mockStream.pipe).toHaveBeenCalledWith(response);
    });
    
    it('should return 404 when the file is not found', () => {
        getPlyFileFromS3.mockImplementation(() => {
            throw new Error('File not found');
        });
    
        const request = { params: { filename: 'missing.ply' } };
        const response = {
            setHeader: vi.fn(),
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    
        streamPlyFileFromS3(request, response);
    
        expect(getPlyFileFromS3).toHaveBeenCalledWith('missing.ply');
        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({ error: 'File not found' });
    });
    
    it('should return 400 when filename param is missing', () => {
        const request = { params: {} };
        const response = {
            setHeader: vi.fn(),
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    
        streamPlyFileFromS3(request, response);
    
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({ error: 'Filename is required' });
    });
    
    it('should return 500 for unexpected errors in stream', () => {
        getPlyFileFromS3.mockImplementation(() => {
            throw new Error('Something bad happened');
        });
    
        const request = { params: { filename: 'fused.ply' } };
        const response = {
            setHeader: vi.fn(),
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    
        streamPlyFileFromS3(request, response);
    
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
    
    it('should return 400 for invalid filenames', () => {
        const request = { params: { filename: '../../hack.ply' } };
        const response = {
            setHeader: vi.fn(),
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    
        streamPlyFileFromS3(request, response);
    
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({ error: 'Invalid filename' });
    });
    
});