import axios from 'axios';
import mockFs from 'mock-fs';
import axiosMockAdapter from 'axios-mock-adapter';
import { uploadZippedDirectory } from '../../../../services/services_utils/zipImageDirectoryHelpers/uploadZippedDirectory';

const mock = new axiosMockAdapter(axios);

describe('uploadZippedDirectory', () => {

  beforeEach(() => {
    mockFs({
      '/path/to/zip.zip': 'dummy content of a zip file',
    });
  });

  afterEach(() => {
    mockFs.restore();
    mock.reset();
  });

  it('should successfully upload a zip file', async () => {
    const zipPath = '/path/to/zip.zip';
    const apiUrl = 'https://api.example.com/upload';

    mock.onPost(apiUrl).reply(200, { message: 'Upload successful' });

    const result = await uploadZippedDirectory(zipPath, apiUrl);

    expect(result).toEqual({ message: 'Upload successful' });
  });

  it('should throw an error when zip file does not exist', async () => {
    const zipPath = '/path/to/non-existent-zip.zip';
    const apiUrl = 'https://api.example.com/upload';

    await expect(uploadZippedDirectory(zipPath, apiUrl)).rejects.toThrowError('Failed to upload zip: Request failed with status code 404');
  });

  it('should throw an error if upload fails', async () => {
    const zipPath = '/path/to/zip.zip';
    const apiUrl = 'https://api.example.com/upload';

    mock.onPost(apiUrl).reply(500, { message: 'Server error' });

    await expect(uploadZippedDirectory(zipPath, apiUrl)).rejects.toThrowError('Request failed with status code 500');
  });

  it('should throw an error if axios request fails', async () => {
    const zipPath = '/path/to/zip.zip';
    const apiUrl = 'https://api.example.com/upload';

    mock.onPost(apiUrl).networkError();

    await expect(uploadZippedDirectory(zipPath, apiUrl)).rejects.toThrowError('Failed to upload zip: Network Error');
  });

});
