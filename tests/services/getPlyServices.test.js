// Comment here so the imports don't get above the mock
vi.mock('../../services/plyModelServices.js', () => ({
    uploadFile: vi.fn()
}));

import unzipper from 'unzipper';
import { describe, it, expect, vi } from 'vitest';
import { processZipFile } from '../../services/getPlyServices.js';
import { saveTempPlyFiles } from '../../services/services_utils/getPlyServiceHelpers/saveTempPlyFiles.js';

vi.mock('unzipper');
vi.mock('../../services/services_utils/getPlyServiceHelpers/saveTempPlyFiles.js');

describe('processZipFile', () => {
    it('should process a valid zip file and return success', async () => {
        const mockZipBuffer = Buffer.from('mock zip content');

        unzipper.Open.buffer.mockResolvedValue({
            files: [{ type: 'File', path: 'file1.ply' }]
        });

        saveTempPlyFiles.mockResolvedValue(true);

        const result = await processZipFile(mockZipBuffer);

        expect(result.status).toBe(200);
        expect(result.message).toBe('ZIP processed successfully');
        expect(unzipper.Open.buffer).toHaveBeenCalledWith(mockZipBuffer);
        expect(saveTempPlyFiles).toHaveBeenCalledTimes(1);
    });

    it('should return an error when ZIP file is empty', async () => {
        const mockZipBuffer = Buffer.from('mock empty zip content');
    
        unzipper.Open.buffer.mockResolvedValue({
            files: []
        });
    
        const result = await processZipFile(mockZipBuffer);
    
        expect(result.status).toBe(400);
        expect(result.error).toBe('Uploaded ZIP is empty');
        expect(unzipper.Open.buffer).toHaveBeenCalledWith(mockZipBuffer);
    });
    
    it('should return an error if invalid file type is in ZIP', async () => {
        const mockZipBuffer = Buffer.from('mock zip content');
    
        unzipper.Open.buffer.mockResolvedValue({
            files: [{ type: 'File', path: 'file1.txt' }]
        });
    
        const result = await processZipFile(mockZipBuffer);
    
        expect(result.status).toBe(400);
        expect(result.error).toBe('Unsupported file type inside ZIP');
    });
    
    it('should return an error if there is an error while processing the ZIP', async () => {
        const mockZipBuffer = Buffer.from('mock zip content');
    
        unzipper.Open.buffer.mockRejectedValue(new Error('Failed to unzip'));
    
        const result = await processZipFile(mockZipBuffer);
    
        expect(result.status).toBe(500);
        expect(result.error).toBe('Error processing ZIP');
    });
    
    it('should return error if saveTempPlyFiles fails', async () => {
        const mockZipBuffer = Buffer.from('mock zip content');
    
        unzipper.Open.buffer.mockResolvedValue({
            files: [{ type: 'File', path: 'file1.ply' }]
        });
    
        saveTempPlyFiles.mockRejectedValue(new Error('Failed to save file'));
    
        const result = await processZipFile(mockZipBuffer);
    
        expect(result.status).toBe(500);
        expect(result.error).toBe('Error processing ZIP');
    });
    
    it('should return an error when ZIP file is empty', async () => {
        const mockZipBuffer = Buffer.from('');
    
        unzipper.Open.buffer.mockResolvedValue({
            files: []
        });
    
        const result = await processZipFile(mockZipBuffer);
    
        expect(result.status).toBe(400);
        expect(result.error).toBe('Uploaded ZIP is empty');
    });
    
    it('should return an error if ZIP is corrupted or invalid', async () => {
        const mockZipBuffer = Buffer.from('corrupted data');
    
        unzipper.Open.buffer.mockRejectedValue(new Error('Invalid ZIP file'));
    
        const result = await processZipFile(mockZipBuffer);
    
        expect(result.status).toBe(500);
        expect(result.error).toBe('Error processing ZIP');
    });
});
