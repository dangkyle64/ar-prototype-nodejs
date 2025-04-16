import fs from 'fs/promises';
import path from 'path';
import { convertWebmToMp4, isValidVideo } from '../../../services/services_utils/ffmpegFunctions';

describe('Video Conversion', () => {
    let sampleWebmBuffer;

    beforeAll(async () => {
        // Load a small valid webm test file into a buffer
        sampleWebmBuffer = await fs.readFile(path.join(__dirname, 'test_resources', 'dummy.webm'));
    });

    it('converts a valid webm buffer to mp4', async () => {
        const outputPath = path.join(__dirname, 'test.mp4');
        await convertWebmToMp4(sampleWebmBuffer, outputPath);

        const stats = await fs.stat(outputPath);
        expect(stats.size).toBeGreaterThan(0);

        await fs.unlink(outputPath);
    });

    it('detects valid video with isValidVideo', async () => {
        const result = await isValidVideo(sampleWebmBuffer);
        expect(result).toBe(true);
    });

    it('returns false for non-video input', async () => {
        const invalidBuffer = Buffer.from('not a video');
        const result = await isValidVideo(invalidBuffer);
        expect(result).toBe(false);
    });
});
