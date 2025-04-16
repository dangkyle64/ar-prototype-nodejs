import fs from 'fs';

import { describe, it, vi, beforeEach, expect } from 'vitest';
import { processVideo } from '../../services/uploadVideoServices.js';

import * as ffmpegFunctions from '../../services/services_utils/ffmpegFunctions.js';
import * as generateOutputPathFunctions from '../../services/services_utils/getOutputPath.js';
import * as uploadVideoServicesFFMPEGFunctions from '../../services/uploadVideoServicesFFMPEG.js';

describe('processVideo', () => {
    let consoleLog;
    let consoleError;
    const dummyBuffer = Buffer.alloc(1024);

    beforeEach(() => {
        consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
        vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
        vi.spyOn(fs, 'readFileSync').mockImplementation(() => {});

        vi.spyOn(ffmpegFunctions, 'isValidVideo').mockResolvedValue(true);
        vi.spyOn(generateOutputPathFunctions, 'generateOutputPath').mockReturnValue('mocked/output/path.mp4');
        vi.spyOn(uploadVideoServicesFFMPEGFunctions, 'extractFramesFromWebm').mockResolvedValue(undefined);
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

        expect(fs.writeFileSync).toHaveBeenCalledWith('mocked/output/path.mp4', dummyBuffer);
        expect(consoleError).not.toHaveBeenCalled();

        fs.writeFileSync.mockRestore();
        fs.mkdirSync.mockRestore();
        fs.readFileSync.mockRestore();
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
            'Unsupported mimetype'
        );
    });
});
