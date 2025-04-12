import { describe, it, vi, beforeEach, expect } from 'vitest';
import { processVideo } from '../../services/uploadVideoServices.js';

describe('processVideo', () => {
    let consoleLog;
    let consoleError;
    const dummyBuffer = Buffer.alloc(1024); // 1KB dummy buffer

    beforeEach(() => {
        consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should log success for supported mimetype video/mp4', async () => {
        await processVideo(dummyBuffer, 'video/mp4');

        expect(consoleLog).toHaveBeenCalledWith(
            expect.objectContaining({
                mimetype: 'video/mp4',
                size: dummyBuffer.length,
                message: 'Video processed in-memory',
            })
        );
        expect(consoleError).not.toHaveBeenCalled();
    });

    it('should log success for supported mimetype video/webm', async () => {
        await processVideo(dummyBuffer, 'video/webm');

        expect(consoleLog).toHaveBeenCalledWith(
            expect.objectContaining({
                mimetype: 'video/webm',
                size: dummyBuffer.length,
                message: 'Video processed in-memory',
            })
        );
        expect(consoleError).not.toHaveBeenCalled();
    });

    it('should log an error for unsupported mimetype', async () => {
        await processVideo(dummyBuffer, 'video/avi');

        expect(consoleError).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'Error processing video',
            })
        );
    });
});
