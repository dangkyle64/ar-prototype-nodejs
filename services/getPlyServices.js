import unzipper from 'unzipper';
import { saveTempPlyFiles } from './services_utils/getPlyServiceHelpers/saveTempPlyFiles.js';

export const processZipFile = async (buffer) => {
    try {
        const directory = await unzipper.Open.buffer(buffer);

        //console.log('ZIP contents:', directory.files);

        if (directory.files.length === 0) {
            return { status: 400, error: 'Uploaded ZIP is empty '};
        };

        for (const fileEntry of directory.files) {
            if (fileEntry.type === 'File') {
                await saveTempPlyFiles(fileEntry);
            };
        };

        return { status: 200, message: 'ZIP processed successfully' };
    } catch(error) {
        console.log(error);
        return { status: 500, error: 'Error processing ZIP' };
    };
};