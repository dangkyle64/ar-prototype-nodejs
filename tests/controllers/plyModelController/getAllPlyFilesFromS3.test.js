// Mock the function `getAllPlyFileKeys` to control its behavior in tests
vi.mock('../../../services/plyModelServices.js', () => ({
    getAllPlyFileKeys: vi.fn()
}));

import { describe, it, expect, vi } from 'vitest';
import * as plyModelServices from '../../../services/plyModelServices.js';
import { getAllPlyFilesFromS3 } from '../../../controllers/plyModelController.js';

describe('getAllPlyFilesFromS3', () => {
    it('should return an array of file keys when S3 returns keys', async () => {
        plyModelServices.getAllPlyFileKeys.mockResolvedValue(['model1.ply', 'model2.ply']);

        const request = {};
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getAllPlyFilesFromS3(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith(['model1.ply', 'model2.ply']);
    });

    it('should return an empty array when no files are found in S3', async () => {
        plyModelServices.getAllPlyFileKeys.mockResolvedValue([]);

        const request = {};
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getAllPlyFilesFromS3(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors and return a 500 status', async () => {
        plyModelServices.getAllPlyFileKeys.mockRejectedValue(new Error('Error fetching S3 keys'));

        const request = {};
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getAllPlyFilesFromS3(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({
            data: [],
            error: 'Internal server error',
        });
    });

    it('should handle case when getAllPlyFileKeys throws a "not found" error', async () => {
        plyModelServices.getAllPlyFileKeys.mockRejectedValue(new Error('Files not found'));

        const request = {};
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getAllPlyFilesFromS3(request, response);

        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({ error: 'Files not found' });
    });

    it('should handle a malformed response with missing `Contents` field', async () => {
        plyModelServices.getAllPlyFileKeys.mockResolvedValue(undefined);

        const request = {};
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getAllPlyFilesFromS3(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({
            data: [],
            error: 'Internal server error',
        });
    });

    it('should handle network-related errors (e.g., timeouts, rate-limiting)', async () => {
        plyModelServices.getAllPlyFileKeys.mockRejectedValue(new Error('Network timeout'));

        const request = {};
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getAllPlyFilesFromS3(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({
            data: [],
            error: 'Internal server error',
        });
    });

    it('should handle permission errors (AccessDenied)', async () => {
        plyModelServices.getAllPlyFileKeys.mockRejectedValue(new Error('AccessDenied'));

        const request = {};
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getAllPlyFilesFromS3(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({
            data: [],
            error: 'Internal server error',
        });
    });

    it('should handle unexpected return values (e.g., null or non-array)', async () => {
        plyModelServices.getAllPlyFileKeys.mockResolvedValue(null);

        const request = {};
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getAllPlyFilesFromS3(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({
            data: [],
            error: 'Internal server error',
        });
    });

    it('should handle malformed keys (undefined or null keys)', async () => {
        plyModelServices.getAllPlyFileKeys.mockResolvedValue([undefined, 'model1.ply', null, 'model2.ply']);

        const request = {};
        const response = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };

        await getAllPlyFilesFromS3(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith(['model1.ply', 'model2.ply']);
    });
});
