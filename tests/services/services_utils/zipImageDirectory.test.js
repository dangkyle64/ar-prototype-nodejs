import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOutputStream, createZipArchive, handleArchiveError } from '../../../services/services_utils/zipImageDirectory.js';
import archiver from 'archiver';
import fs from 'fs';
import { PassThrough } from 'stream';

describe('handleArchiveError', () => {

    it('should call reject with a new error when an error is passed', () => {
        const reject = vi.fn();
        const error = new Error('Test archiver error');

        const errorHandler = handleArchiveError(reject);
        errorHandler(error);

        expect(reject).toHaveBeenCalledWith(new Error('Archiver error: Test archiver error'));
    });

    it('should throw an error if reject is not a function', () => {
        const reject = undefined; // reject is not a function

        const errorHandler = handleArchiveError(reject);

        expect(() => errorHandler(new Error('Test archiver error')))
        .toThrow('reject is not a function');
    });

    it('should throw an error if no error is provided', () => {
        const reject = vi.fn();

        const errorHandler = handleArchiveError(reject);

        expect(() => errorHandler())
        .toThrow('No error provided');
    });

    it('should handle error objects with no message property', () => {
        const reject = vi.fn();
        const error = { code: 'ERR_ARCHIVE_WRITE' };

        const errorHandler = handleArchiveError(reject);
        errorHandler(error);

        expect(reject).toHaveBeenCalledWith(new Error('Archiver error: Unknown archiver error'));
    });

    it('should use the default message if error.message is empty or undefined', () => {
        const reject = vi.fn();
        const error = { message: '' };

        const errorHandler = handleArchiveError(reject);
        errorHandler(error);

        expect(reject).toHaveBeenCalledWith(new Error('Archiver error: '));
    });

    it('should handle thrown errors inside reject', () => {
        const reject = vi.fn(() => {
        throw new Error('Reject function failed!');
        });
        const error = new Error('Test archiver error');

        const errorHandler = handleArchiveError(reject);

        try {
        errorHandler(error);
        } catch (err) {
        expect(err.message).toBe('Reject function failed!');
        }
    });
});

describe('createOutputStream', () => {
    const mockReject = vi.fn();
  
    afterEach(() => {
      vi.restoreAllMocks();
      mockReject.mockReset();
    });
  
    it('should return a writable stream when fs.createWriteStream succeeds', () => {
        const fakeStream = { write: vi.fn() };
    
        vi.spyOn(fs, 'createWriteStream').mockReturnValue(fakeStream);
    
        const result = createOutputStream('some/output.txt', mockReject);
    
        expect(fs.createWriteStream).toHaveBeenCalledWith('some/output.txt');
        expect(result).toBe(fakeStream);
        expect(mockReject).not.toHaveBeenCalled();
    });
  
    it('should call reject with an Error when fs.createWriteStream throws', () => {
        const fakeError = new Error('permission denied');
        vi.spyOn(fs, 'createWriteStream').mockImplementation(() => {
            throw fakeError;
        });
    
        const result = createOutputStream('some/output.txt', mockReject);
    
        expect(result).toBeUndefined();
        expect(mockReject).toHaveBeenCalledWith(
            new Error(`Failed to create write stream: ${fakeError.message}`)
        );
    });
});

vi.mock('archiver', () => ({
  default: vi.fn(),
}));

describe('createZipArchive', () => {
  let archiveMock;
  let outputStream;
  let rejectMock;

  beforeEach(() => {
    archiveMock = {
      pipe: vi.fn(),
      on: vi.fn(),
      directory: vi.fn(),
      finalize: vi.fn()
    };
    archiver.mockReturnValue(archiveMock);

    outputStream = new PassThrough(); // acts like a real stream
    rejectMock = vi.fn();
  });

  it('should create a zip archive and set it up correctly', () => {
    createZipArchive('/path/to/dir', rejectMock, outputStream);

    expect(archiver).toHaveBeenCalledWith('zip', { zlib: { level: 9 } });
    expect(archiveMock.pipe).toHaveBeenCalledWith(outputStream);
    expect(archiveMock.directory).toHaveBeenCalledWith('/path/to/dir', false);
    expect(archiveMock.finalize).toHaveBeenCalled();
  });

  it('should attach an error handler', () => {
    createZipArchive('/some/dir', rejectMock, outputStream);
  
    expect(archiveMock.on).toHaveBeenCalledWith('error', expect.any(Function));
  });
  

  it('should call reject when an error occurs', () => {
    const fakeError = new Error('oops');
  
    // Call createZipArchive with rejectMock (no need for handleArchiveError mock)
    createZipArchive('/path/to/dir', rejectMock, outputStream);
  
    // Simulate archiver emitting an error
    const onErrorCallback = archiveMock.on.mock.calls.find(
      ([event]) => event === 'error'
    )[1];
  
    onErrorCallback(fakeError);
  
    // Assert rejectMock was called with the error
    expect(rejectMock).toHaveBeenCalled();
    expect(rejectMock.mock.calls[0][0].message).toContain('oops');
  });
});
