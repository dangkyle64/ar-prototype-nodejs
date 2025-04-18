import { describe, it, expect, vi } from 'vitest';
import { handleArchiveError } from "../../../../services/services_utils/zipImageDirectory";

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