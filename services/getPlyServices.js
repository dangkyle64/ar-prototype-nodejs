import unzipper from 'unzipper';
import { saveTempPlyFiles } from './services_utils/getPlyServiceHelpers/saveTempPlyFiles.js';
import { uploadFile } from './plyModelServices.js';

export const processZipFile = async (buffer) => {
    try {
        const directory = await unzipper.Open.buffer(buffer);

        console.log('[Debug] Files in ZIP:');
        directory.files.forEach(file => {
            console.log(` - ${file.path} (${file.type})`);
        });
        
        if (directory.files.length === 0) {
            return { status: 400, error: 'Uploaded ZIP is empty' };
        };

        const files = directory.files.filter(file => file.type === 'File');

        if (files.length !== 1) {
            return { status: 400, error: 'Unsupported file type inside ZIP' };
        };

        const onlyFile = files[0];

        if (!onlyFile.path.endsWith('.ply')) {
            return { status: 400, error: 'Unsupported file type inside ZIP' };
        };

        const plyFile = directory.files.find(
            (file) => file.type === 'File' && file.path.endsWith('.ply')
        );

        await saveTempPlyFiles(plyFile);

        await uploadFile();

        return { status: 200, message: 'ZIP processed successfully' };
    } catch(error) {
        console.log(error);
        return { status: 500, error: 'Error processing ZIP' };
    };
};