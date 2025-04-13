import path from 'path';
import fs from 'fs';

import { describe, it, vi, beforeEach, expect } from 'vitest';
import { processVideo } from '../../services/uploadVideoServices.js';
import { generateOutputPath } from '../../services/uploadVideoServicesUtils.js';
import * as utils from '../../services/uploadVideoServicesUtils.js';

describe('processVideo', () => {
    let consoleLog;
    let consoleError;
    const dummyBuffer = Buffer.alloc(1024); // 1KB dummy buffer

    beforeEach(() => {
        consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should log success for supported mimetype video/mp4', async () => {
        vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
        vi.spyOn(utils, 'isValidVideo').mockResolvedValue(true);

        await processVideo(dummyBuffer, 'video/mp4');

        expect(consoleLog).toHaveBeenCalledWith(
            expect.objectContaining({
                mimetype: 'video/mp4',
                size: dummyBuffer.length,
                message: 'Video processed in-memory',
            })
        );
        expect(fs.writeFileSync).toHaveBeenCalled();
        expect(consoleError).not.toHaveBeenCalled();

        fs.writeFileSync.mockRestore();
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

describe('generateOutputPath', () => {
    it('should generate the correct output path with valid directory and filename', () => {
        const outputDir = './services/temp_video_output';
        const filename = 'video_123';
        const expectedPath = path.join(outputDir, 'video_123.mp4');
        
        const result = generateOutputPath(outputDir, filename);
        
        expect(result).toBe(expectedPath);
    });

    it('should handle an empty directory correctly', () => {
        const outputDir = '';
        const filename = 'video_123';
        const expectedPath = path.join('', 'video_123.mp4');
        
        const result = generateOutputPath(outputDir, filename);
        
        expect(result).toBe(expectedPath);
    });

    it('should handle special characters in the filename', () => {
        const outputDir = './services/temp_video_output';
        const filename = 'video_@123#&$';
        const expectedPath = path.join(outputDir, 'video_@123#&$.mp4');
        
        const result = generateOutputPath(outputDir, filename);
        
        expect(result).toBe(expectedPath);
    });

    it('should handle spaces in the filename correctly', () => {
        const outputDir = './services/temp_video_output';
        const filename = 'video with spaces';
        const expectedPath = path.join(outputDir, 'video with spaces.mp4');
        
        const result = generateOutputPath(outputDir, filename);
        
        expect(result).toBe(expectedPath);
    });

    it('should normalize paths with different slashes (e.g., / vs \\)', () => {
        const outputDir = './services\\temp_video_output';
        const filename = 'video_123';
        const expectedPath = path.join('./services/temp_video_output', 'video_123.mp4');
        
        const result = generateOutputPath(outputDir, filename);
        
        expect(result).toBe(expectedPath);
    });

    it('should handle relative paths correctly', () => {
        const outputDir = 'services/temp_video_output';
        const filename = 'video_123';
        const expectedPath = path.join('services/temp_video_output', 'video_123.mp4');
        
        const result = generateOutputPath(outputDir, filename);
        
        expect(result).toBe(expectedPath);
    });
});