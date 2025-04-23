// Mocking S3 first (Comment here to stop the imports from being hoisted to the top of the file)
vi.mock('../../awsS3Setup', () => {
    return {
        default: {
            getObject: vi.fn().mockReturnValue({
                createReadStream: () => {
                    const mockStream = new Readable();
                    mockStream._read = () => {};
                    return mockStream;
                },
            }),
        },
    };
});

import { Readable } from 'stream';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPlyFileFromS3 } from '../../services/plyModelServices';
import S3 from '../../awsS3Setup';

describe('getPlyFileFromS3', () => {
    let mockStream;

    beforeEach(() => {
        mockStream = new Readable();
        mockStream._read = () => {};

        S3.getObject.mockReturnValue({
            createReadStream: () => mockStream,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should call S3.getObject with the correct bucket and key', () => {
        const fileName = 'example-file.ply';

        const result = getPlyFileFromS3(fileName);

        expect(S3.getObject).toHaveBeenCalledWith({
            Bucket: process.env.R2_BUCKET,
            Key: fileName,
        });

        expect(result).toBe(mockStream);
    });

    it('should return a readable stream', () => {
        const stream = getPlyFileFromS3('file.ply');

        expect(stream).toBeInstanceOf(Readable);
    });

    it('should throw an error if fileName is not provided', () => {
        expect(() => getPlyFileFromS3()).toThrow();
    });

    it('should throw if S3.getObject throws an error', () => {
        S3.getObject.mockImplementation(() => {
            throw new Error('S3 failure');
        });

        expect(() => getPlyFileFromS3('file.ply')).toThrow('S3 failure');
    });

    it('should return an empty stream if the file has no content', () => {
        const emptyStream = new Readable();
        emptyStream._read = () => {
            emptyStream.push(null);
        };

        S3.getObject.mockReturnValue({
            createReadStream: () => emptyStream,
        });

        const stream = getPlyFileFromS3('empty-file.ply');
        expect(stream.readable).toBe(true);
    });

    it('should pass the correct Bucket and Key from ENV and args', () => {
        const fileName = 'exact-match.ply';
        const expectedBucket = process.env.R2_BUCKET;

        getPlyFileFromS3(fileName);

        expect(S3.getObject).toHaveBeenCalledWith({
            Bucket: expectedBucket,
            Key: fileName,
        });
    });

    it('should throw or handle if the file does not exist', () => {
        S3.getObject.mockImplementation(() => {
            throw new Error('NoSuchKey: The specified key does not exist.');
        });

        expect(() => getPlyFileFromS3('nonexistent-file.ply')).toThrow('NoSuchKey');
    });

    it('should throw if the file is not a .ply file', () => {
        expect(() => getPlyFileFromS3('malicious.exe')).toThrow('Invalid file type');
    });

    it('should throw if S3 bucket name is not set in ENV', () => {
        const original = process.env.R2_BUCKET;
        delete process.env.R2_BUCKET;

        expect(() => getPlyFileFromS3('somefile.ply')).toThrow('S3 bucket not configured');

        process.env.R2_BUCKET = original;
    });

    it('should throw if S3 is not configured', () => {
        S3.getObject.mockImplementation(() => {
            throw new Error('Missing credentials');
        });

        expect(() => getPlyFileFromS3('somefile.ply')).toThrow('Missing credentials');
    });

    it('should retrieve a .ply model file successfully', () => {
        const fileName = 'scan123_model.ply';
        const stream = getPlyFileFromS3(fileName);

        expect(stream.readable).toBe(true);
    });
});
