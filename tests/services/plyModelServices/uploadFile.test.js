//comment to make sure mocks stay on top
vi.mock('fs');
vi.mock('../../../awsS3Setup.js', () => ({
    default: {
        upload: vi.fn(),
    }
}));
vi.mock('../../../models/plyModel.js', () => ({
    default: {
        create: vi.fn(),
    }
}));

import path from 'path';
import fs from 'fs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadFile } from '../../../services/plyModelServices.js';
import S3 from '../../../awsS3Setup.js';
import PlyModel from '../../../models/plyModel.js';

describe('uploadFile', () => {
    let R2_BUCKET;

    beforeEach(() => {
        R2_BUCKET = 'mock-bucket';
        vi.clearAllMocks();
        process.env.R2_BUCKET = R2_BUCKET;
    });

    it('should successfully upload a file and save to the DB', async () => {
        const mockFileBuffer = Buffer.from('file content');
        fs.readFileSync.mockReturnValue(mockFileBuffer);

        S3.upload.mockReturnValue({
            promise: () => Promise.resolve({ Location: 'https://mock-location.com/fused.ply' })
        });
          

        PlyModel.create.mockResolvedValueOnce({ name: 'mock-file-name' });

        await uploadFile();

        expect(fs.readFileSync).toHaveBeenCalledWith(path.join('./ply', 'fused.ply'));
        expect(S3.upload).toHaveBeenCalledWith({
            Bucket: process.env.R2_BUCKET,
            Key: expect.any(String),
            Body: mockFileBuffer,
            ContentType: 'application/octet-stream',
        });
        expect(PlyModel.create).toHaveBeenCalledWith({
            name: expect.stringContaining('_fused.ply'),
        });
        console.log('Upload success test passed!');
    });

    it('should handle S3 upload failure gracefully', async () => {
        const mockFileBuffer = Buffer.from('file content');
        fs.readFileSync.mockReturnValue(mockFileBuffer);

        S3.upload.mockReturnValue({
            promise: () => Promise.reject(new Error('S3 upload failed'))
        });

        PlyModel.create.mockResolvedValueOnce({ name: 'mock-file-name' });

        await uploadFile();

        expect(S3.upload).toHaveBeenCalledTimes(1);
        expect(PlyModel.create).not.toHaveBeenCalled();
        console.error('Upload failed:', 'S3 upload failed');
    });

    it('should handle database save failure', async () => {
        S3.upload.mockReturnValue({
            promise: () => Promise.resolve({})
        });

        const mockFileBuffer = Buffer.from('fake file data');

        vi.spyOn(fs, 'readFileSync').mockReturnValue(mockFileBuffer);

        PlyModel.create.mockRejectedValue(new Error('Database save failed'));

        await uploadFile();

        expect(PlyModel.create).toHaveBeenCalledTimes(1);
    });

    it('should handle missing R2_BUCKET environment variable', async () => {
        const originalBucket = process.env.R2_BUCKET;
        delete process.env.R2_BUCKET;

        const mockFileBuffer = Buffer.from('file content');
        fs.readFileSync.mockReturnValue(mockFileBuffer);

        S3.upload.mockReturnValue({
            promise: () => Promise.resolve({ Location: 'https://mock-location.com/fused.ply' })
        });

        await expect(uploadFile()).rejects.toThrow('Missing S3 bucket in environment');
        
        process.env.R2_BUCKET = originalBucket;
    });

    it('should ensure file buffer is read correctly', async () => {
        const mockFileBuffer = Buffer.from('file content');
        fs.readFileSync.mockReturnValue(mockFileBuffer);

        S3.upload.mockReturnValue({
            promise: () => Promise.resolve({ Location: 'https://mock-location.com/fused.ply' })
        });
          
        await uploadFile();

        expect(S3.upload).toHaveBeenCalledWith(expect.objectContaining({
            Body: mockFileBuffer
        }));
    });

    it('should handle missing file error from fs.readFileSync', async () => {
        fs.readFileSync.mockImplementation(() => {
            throw new Error('ENOENT: no such file or directory');
        });

        try {
            await uploadFile();
        } catch (err) {
            expect(err.message).toMatch(/ENOENT/)
        };

        expect(S3.upload).not.toHaveBeenCalled();
        expect(PlyModel.create).not.toHaveBeenCalled();
    });

    it('should throw if R2_BUCKET is an empty string', async () => {
        process.env.R2_BUCKET = '';

        const mockFileBuffer = Buffer.from('file content');
        fs.readFileSync.mockReturnValue(mockFileBuffer);

        await expect(uploadFile()).rejects.toThrow('Missing S3 bucket in environment');
    });

    it('should handle synchronous error thrown from S3.upload', async () => {
        const mockFileBuffer = Buffer.from('file content');
        fs.readFileSync.mockReturnValue(mockFileBuffer);

        S3.upload.mockImplementation(() => {
            throw new Error('S3 crashed');
        });

        await uploadFile();

        expect(PlyModel.create).not.toHaveBeenCalled();
    });
});
