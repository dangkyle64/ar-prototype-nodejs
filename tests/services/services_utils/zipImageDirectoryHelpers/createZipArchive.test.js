import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PassThrough } from 'stream';
import archiver from 'archiver';

import { handleArchiveError } from '../../../../services/services_utils/zipImageDirectoryHelpers/handleArchiveErrors.js';
import { createZipArchive } from '../../../../services/services_utils/zipImageDirectoryHelpers/createZipArchive.js';

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

    it('should not call reject on successful archive creation', () => {
        createZipArchive('/some/dir', rejectMock, outputStream);
    
        expect(rejectMock).not.toHaveBeenCalled();
    });

    it('should call reject if archiver throws during creation', () => {
        archiver.mockImplementation(() => {
            throw new Error('Archiver broke');
        });
    
        createZipArchive('/some/dir', rejectMock, outputStream);
    
        expect(rejectMock).toHaveBeenCalledWith(expect.any(Error));
        expect(rejectMock.mock.calls[0][0].message).toMatch(/Archiver broke/);
    });
    
    it('should not call directory or finalize if archiver fails', () => {
        archiver.mockImplementation(() => {
            throw new Error('Archiver broke');
        });
    
        createZipArchive('/some/dir', rejectMock, outputStream);
    
        expect(archiveMock.directory).not.toHaveBeenCalled();
        expect(archiveMock.finalize).not.toHaveBeenCalled();
    });
    
    it('should initialize archiver with correct compression settings', () => {
        createZipArchive('/some/dir', rejectMock, outputStream);
    
        expect(archiver).toHaveBeenCalledWith('zip', { zlib: { level: 9 } });
    });
});
