import { describe, it, expect, vi } from 'vitest';
import { createOutputStream, handleArchiveError, handleOutputErrors } from '../../../services/services_utils/zipImageDirectory.js';
import fs from 'fs';

describe('handleOutputErrors', () => {
    it('should call reject with a new error when an error is passed', () => {
        const reject = vi.fn();

        const error = new Error('Some underlying error');

        const errorHandler = handleOutputErrors(reject);

        errorHandler(error);

        expect(reject).toHaveBeenCalledWith(new Error(`File write error: ${error.message}`));
    });

    it('should throw an error if reject is not a function', () => {
        const reject = undefined;
        
        const errorHandler = handleOutputErrors(reject);
        
        expect(() => errorHandler(new Error('Test error')))
            .toThrow('reject is not a function');
    });

    it('should throw an error if no error is provided', () => {
        const reject = vi.fn();
        
        const errorHandler = handleOutputErrors(reject);
        
        expect(() => errorHandler())
            .toThrow('No error provided');
    });

    it('should handle error objects with no message property', () => {
        const reject = vi.fn();
        const error = { code: 'ERR_FILE_WRITE' };
        
        const errorHandler = handleOutputErrors(reject);
        errorHandler(error);
        
        expect(reject).toHaveBeenCalledWith(new Error('File write error: Unknown error'));
    });

    it('should use the default message if error.message is empty or undefined', () => {
        const reject = vi.fn();
        const error = { message: '' };
        
        const errorHandler = handleOutputErrors(reject);
        errorHandler(error);
        
        expect(reject).toHaveBeenCalledWith(new Error('File write error: Unknown error'));
    });

    it('should correctly handle thrown errors inside reject', () => {
        const reject = vi.fn(() => {
            throw new Error('Reject function failed!');
        });
        const error = new Error('Test error');
      
        const errorHandler = handleOutputErrors(reject);
      
        try {
            errorHandler(error);
        } catch (err) {
            expect(err.message).toBe('Reject function failed!');
        }
    });
});

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