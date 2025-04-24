// Comment here so the import doesn't go above the mock
vi.mock('../../../awsS3Setup.js', () => ({
    default: {
        listObjectsV2: vi.fn()
    }
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllPlyFileKeys } from '../../../services/plyModelServices.js';
import S3 from '../../../awsS3Setup.js';


describe('getAllPlyFileKeys', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return an array of keys from S3', async () => {
        const mockKeys = [
            { Key: 'model1.ply' },
            { Key: 'model2.ply' },
            { Key: 'folder/model3.ply' }
        ];

        S3.listObjectsV2.mockReturnValueOnce({
            promise: vi.fn().mockResolvedValue({
                Contents: mockKeys
            })
        });

        const result = await getAllPlyFileKeys();
        expect(result).toEqual(mockKeys.map(obj => obj.Key));
        expect(S3.listObjectsV2).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no files are found', async () => {
        S3.listObjectsV2.mockReturnValueOnce({
            promise: vi.fn().mockResolvedValue({
                Contents: []
            })
        });

        const result = await getAllPlyFileKeys();
        expect(result).toEqual([]);
    });

    it('should handle errors and throw', async () => {
        S3.listObjectsV2.mockReturnValueOnce({
            promise: vi.fn().mockRejectedValue(new Error('S3 failure'))
        });

        await expect(getAllPlyFileKeys()).rejects.toThrow('S3 failure');
    });

    it('should return an empty array if Contents is undefined', async () => {
        S3.listObjectsV2.mockReturnValueOnce({
            promise: vi.fn().mockResolvedValue({})
        });
    
        const result = await getAllPlyFileKeys();
        expect(result).toEqual([]);
    });

    it('should skip entries without a Key', async () => {
        const mockKeys = [
            { Key: 'model1.ply' },
            { Size: 1234 }, // No Key!
            { Key: 'model2.ply' }
        ];
    
        S3.listObjectsV2.mockReturnValueOnce({
            promise: vi.fn().mockResolvedValue({ Contents: mockKeys })
        });
    
        const result = await getAllPlyFileKeys();
        expect(result).toEqual(['model1.ply', 'model2.ply']);
    });
    
    it('should warn if results are truncated (pagination needed)', async () => {
        const mockConsole = vi.spyOn(console, 'log').mockImplementation(() => {});
    
        S3.listObjectsV2.mockReturnValueOnce({
            promise: vi.fn().mockResolvedValue({
                Contents: [{ Key: 'model1.ply' }],
                IsTruncated: true
            })
        });
    
        const result = await getAllPlyFileKeys();
        expect(result).toEqual(['model1.ply']);
        expect(mockConsole).toHaveBeenCalledWith(expect.stringContaining('Results truncated'));
    
        mockConsole.mockRestore();
    });
    
    it('should throw if BUCKET name is missing from env', async () => {
        const originalBucket = process.env.R2_BUCKET;
        delete process.env.R2_BUCKET;
    
        await expect(getAllPlyFileKeys()).rejects.toThrow();
    
        process.env.R2_BUCKET = originalBucket; // restore
    });
    
});
