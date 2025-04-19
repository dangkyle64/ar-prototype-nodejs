import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PassThrough } from 'stream';
import archiver from 'archiver';
import { createZipArchive } from '../../../../services/services_utils/zipImageDirectoryHelpers/createZipArchive.js';
import { handleArchiveError } from '../../../../services/services_utils/zipImageDirectoryHelpers/handleArchiveErrors.js';

vi.mock('../../../../services/services_utils/zipImageDirectoryHelpers/handleArchiveErrors.js', () => ({
    handleArchiveError: vi.fn()
}));

vi.mock('archiver', () => ({
    default: vi.fn()
}));

describe('createZipArchive', () => {
    let archiveMock;
    let outputStream;
    let rejectMock;

    beforeEach(() => {
        outputStream = new PassThrough();
        rejectMock = vi.fn();

        archiveMock = {
        pipe: vi.fn(),
        on: vi.fn(),
        directory: vi.fn(),
        finalize: vi.fn()
        };

        archiver.mockReturnValue(archiveMock);
    });

    it('should correctly create and finalize a zip archive', () => {
        createZipArchive('/some/dir', rejectMock, outputStream);

        expect(archiver).toHaveBeenCalledWith('zip', { zlib: { level: 9 } });
        expect(archiveMock.pipe).toHaveBeenCalledWith(outputStream);
        expect(archiveMock.directory).toHaveBeenCalledWith('/some/dir', false);
        expect(archiveMock.finalize).toHaveBeenCalled();
    });

    it('should attach error handler from handleArchiveError', () => {
        const mockErrorHandler = vi.fn();
        handleArchiveError.mockReturnValue(mockErrorHandler);

        createZipArchive('/some/dir', rejectMock, outputStream);

        expect(handleArchiveError).toHaveBeenCalledWith(rejectMock);
        expect(archiveMock.on).toHaveBeenCalledWith('error', mockErrorHandler);
    });

    it('should trigger the error handler when archive emits an error', () => {
        const fakeError = new Error('oops');
        const mockErrorHandler = vi.fn();
        handleArchiveError.mockReturnValue(mockErrorHandler);

        createZipArchive('/some/dir', rejectMock, outputStream);

        const onErrorCallback = archiveMock.on.mock.calls.find(
        ([event]) => event === 'error'
        )[1];

        onErrorCallback(fakeError);

        expect(mockErrorHandler).toHaveBeenCalledWith(fakeError);
    });
});
