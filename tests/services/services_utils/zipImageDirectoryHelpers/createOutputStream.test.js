import { describe, it, expect, vi } from 'vitest';
import { createOutputStream } from '../../../../services/services_utils/zipImageDirectoryHelpers/createOutputStream';
import fs from 'fs';

describe('createOutputStream', () => {
    const mockReject = vi.fn();
  
    afterEach(() => {
      vi.restoreAllMocks();
      mockReject.mockReset();
    });
  
    it('should return a writable stream when fs.createWriteStream succeeds', () => {
        const fakeStream = { write: vi.fn() };
    
        vi.spyOn(fs, 'createWriteStream').mockReturnValue(fakeStream);
    
        const result = createOutputStream('some/output.txt', mockReject);
    
        expect(fs.createWriteStream).toHaveBeenCalledWith('some/output.txt');
        expect(result).toBe(fakeStream);
        expect(mockReject).not.toHaveBeenCalled();
    });
  
    it('should call reject with an Error when fs.createWriteStream throws', () => {
        const fakeError = new Error('permission denied');
        vi.spyOn(fs, 'createWriteStream').mockImplementation(() => {
            throw fakeError;
        });
    
        const result = createOutputStream('some/output.txt', mockReject);
    
        expect(result).toBeUndefined();
        expect(mockReject).toHaveBeenCalledWith(
            new Error(`Failed to create write stream: ${fakeError.message}`)
        );
    });

    it('should throw if reject is not a function', () => {
        const fakeError = new Error('fail');
        vi.spyOn(fs, 'createWriteStream').mockImplementation(() => {
            throw fakeError;
        });
    
        expect(() => createOutputStream('some/output.txt', null)).toThrow();
    });
    
    it('should throw if reject itself throws an error', () => {
        const fakeError = new Error('fail');
        vi.spyOn(fs, 'createWriteStream').mockImplementation(() => {
            throw fakeError;
        });
    
        const brokenReject = () => { throw new Error('Reject failed') };
    
        expect(() => createOutputStream('some/output.txt', brokenReject)).toThrow('Reject failed');
    });
    
    it('should reject when fs.createWriteStream throws a path error', () => {
        const error = new Error('ENOENT: no such file or directory');
        vi.spyOn(fs, 'createWriteStream').mockImplementation(() => { throw error });
    
        const result = createOutputStream('/invalid/path/file.txt', mockReject);
        
        expect(mockReject).toHaveBeenCalledWith(
            new Error('Failed to create write stream: ENOENT: no such file or directory')
        );
    });
});