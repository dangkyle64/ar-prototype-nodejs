import path from 'path';
import { describe, it, expect } from 'vitest';
import { generateOutputPath } from '../../../services/services_utils/getOutputPath.js';

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