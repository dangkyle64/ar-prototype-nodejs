import fs from 'fs';
import path from 'path';

import { PassThrough } from 'stream';
import { saveTempPlyFiles } from '../../../../services/services_utils/getPlyServiceHelpers/saveTempPlyFiles';

vi.mock('fs');

describe('saveTempPlyFiles', () => {
    const mockWriteStream = new PassThrough();

    beforeEach(() => {
        vi.resetAllMocks();
        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementation(() => {});
        fs.createWriteStream.mockReturnValue(mockWriteStream);
    });

    it('should sanitize and save the file correctly', async () => {
        const mockStream = new PassThrough();
        const fileEntry = {
            path: '../../evil.jpg',
            stream: () => mockStream
        };

        const expectedPath = path.join('images', 'evil.jpg');

        const finished = new Promise((resolve) => {
            mockWriteStream.on('finish', resolve);
        });

        const savePromise = saveTempPlyFiles(fileEntry, 'images');

        mockStream.pipe(mockWriteStream);
        mockStream.emit('end');
        mockWriteStream.emit('finish');

        await finished;
        await savePromise;

        expect(fs.existsSync).toHaveBeenCalledWith('images');
        expect(fs.mkdirSync).toHaveBeenCalledWith('images', { recursive: true });
        expect(fs.createWriteStream).toHaveBeenCalledWith(expectedPath);
    });

    it('should skip directory creation if directory already exists', async () => {
        fs.existsSync.mockReturnValue(true);

        const mockStream = new PassThrough();
        const fileEntry = {
            path: 'evil.jpg',
            stream: () => mockStream
        };

        const savePromise = saveTempPlyFiles(fileEntry, 'images');
        
        expect(fs.mkdirSync).not.toHaveBeenCalled();
        await savePromise;
    });

    it('should handle error if file cannot be written', async () => {
        const mockStream = new PassThrough();
        const fileEntry = {
            path: 'evil.jpg',
            stream: () => mockStream
        };

        fs.createWriteStream.mockImplementationOnce(() => {
            throw new Error('Write permissions error');
        });

        await expect(saveTempPlyFiles(fileEntry, 'images')).rejects.toThrow('Server Error');
    });

    it('should handle error if file path is invalid', async () => {
        const fileEntry = {
            path: null,
            stream: () => new PassThrough()
        };
    
        await expect(saveTempPlyFiles(fileEntry, 'images')).rejects.toThrow('Server Error');
    });
    
    it('should handle permission errors when writing the file', async () => {
        fs.createWriteStream.mockImplementationOnce(() => {
            throw new Error('Permission denied');
        });
    
        const fileEntry = {
            path: 'valid.jpg',
            stream: () => new PassThrough()
        };
    
        await expect(saveTempPlyFiles(fileEntry, 'images')).rejects.toThrow('Server Error');
    });
    
    it('should handle filesystem error when creating the directory', async () => {
        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementationOnce(() => {
            throw new Error('Directory creation failed');
        });
    
        const fileEntry = {
            path: 'valid.jpg',
            stream: () => new PassThrough()
        };
    
        await expect(saveTempPlyFiles(fileEntry, 'images')).rejects.toThrow('Server Error');
    });
    
    it('should handle large file correctly without timing out', async () => {
        const largeStream = new PassThrough();
        const fileEntry = {
            path: 'largefile.jpg',
            stream: () => largeStream
        };
    
        const savePromise = saveTempPlyFiles(fileEntry, 'images');
    
        largeStream.pipe(mockWriteStream);
        largeStream.emit('end');
        mockWriteStream.emit('finish');
    
        await savePromise;
    
        expect(fs.createWriteStream).toHaveBeenCalled();
    });
    
    it('should handle invalid stream type gracefully', async () => {
        const fileEntry = {
            path: 'valid.jpg',
            stream: () => null
        };
    
        await expect(saveTempPlyFiles(fileEntry, 'images')).rejects.toThrow('Server Error');
    });
    
    it('should handle invalid output directory gracefully', async () => {
        const fileEntry = {
            path: 'valid.jpg',
            stream: () => new PassThrough()
        };
    
        await expect(saveTempPlyFiles(fileEntry, null)).rejects.toThrow('Server Error');
    });
});
