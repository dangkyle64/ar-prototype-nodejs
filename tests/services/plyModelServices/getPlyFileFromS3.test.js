// Comment to make sure mocks are on top
vi.mock('../../../awsS3Setup.js', () => ({
    default: {
        getObject: vi.fn(),
    },
}));

import { vi, expect, describe, it, beforeEach } from 'vitest';
import { getPlyFileFromS3 } from '../../../services/plyModelServices';
import S3 from '../../../awsS3Setup';

describe('getPlyFileFromS3', () => {

    let R2_BUCKET;
    beforeEach(() => {
        R2_BUCKET = 'mock-bucket';
    });

    it('throws an error if the fileName is invalid or missing', () => {
        expect(() => getPlyFileFromS3()).toThrow('Invalid or missing fileName');
        expect(() => getPlyFileFromS3(123)).toThrow('Invalid or missing fileName');
    });

    it('throws an error if the file type is not .ply', () => {
        expect(() => getPlyFileFromS3('test.txt', R2_BUCKET)).toThrow('Invalid file type');
    });

    it('throws an error if the S3 bucket is not configured', () => {
        expect(() => getPlyFileFromS3('test.ply')).toThrow('S3 bucket not configured');
    });

    it('calls S3.getObject() with the correct parameters', async () => {
        const mockStream = {};
        S3.getObject.mockReturnValueOnce({ createReadStream: () => mockStream });

        const result = getPlyFileFromS3('file.ply', R2_BUCKET);
        
        expect(S3.getObject).toHaveBeenCalledWith({
            Bucket: 'mock-bucket',
            Key: 'file.ply',
        });

        expect(result).toBe(mockStream);
    });

    it('throws an error if S3.getObject fails', async () => {
        S3.getObject.mockImplementationOnce(() => {
            throw new Error('S3 failure');
        });

        expect(() => getPlyFileFromS3('file.ply', R2_BUCKET)).toThrow('S3 failure');
    });

    it('throws an error if the filename is too long', () => {
        const longFilename = 'a'.repeat(256) + '.ply';
    
        expect(() => getPlyFileFromS3(longFilename, R2_BUCKET)).toThrow('Filename is too long');
    });
    
    it('throws an error if the bucket name is empty', () => {
        expect(() => getPlyFileFromS3('test.ply', '')).toThrow('S3 bucket not configured');
    });
    
    it('throws an error if S3 response is malformed and missing createReadStream method', async () => {
        S3.getObject.mockReturnValueOnce({});
    
        expect(() => getPlyFileFromS3('file.ply', R2_BUCKET)).toThrow('Malformed S3 response');
    });

    it('throws an error if the filename contains special characters or paths', () => {
        expect(() => getPlyFileFromS3('folder/../evil.ply', R2_BUCKET)).toThrow('Invalid file name');
        expect(() => getPlyFileFromS3('file with spaces.ply', R2_BUCKET)).toThrow('Invalid file name');
    });
    
    it('throws an error if S3.getObject fails due to file not found', async () => {
        S3.getObject.mockImplementationOnce(() => {
            throw new Error('No such key');
        });
    
        expect(() => getPlyFileFromS3('file.ply', R2_BUCKET)).toThrow('No such key');
    });
    
    it('does not throw an error if the filename is exactly at the limit', () => {
        S3.getObject.mockReturnValueOnce({ createReadStream: () => {} });
        const validFilename = 'a'.repeat(20) + '.ply';
        expect(() => getPlyFileFromS3(validFilename, R2_BUCKET)).not.toThrow();
    });
    
    it('throws an error if fileName is a non-string value', () => {
        expect(() => getPlyFileFromS3([])).toThrow('Invalid or missing fileName');
        expect(() => getPlyFileFromS3({})).toThrow('Invalid or missing fileName');
    });
    
    it('throws an error if file is not found in S3', async () => {
        S3.getObject.mockImplementationOnce(() => {
            const error = new Error('NoSuchKey');
            error.code = 'NoSuchKey';
            throw error;
        });
    
        expect(() => getPlyFileFromS3('nonexistent-file.ply', R2_BUCKET)).toThrow('File not found in S3');
    });
    
});
