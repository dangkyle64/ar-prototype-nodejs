import { describe, it, expect, vi } from 'vitest';
import { createOutputStream } from "../../../../services/services_utils/zipImageDirectory";

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
});