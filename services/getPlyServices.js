import unzipper from 'unzipper';

export const processZipFile = async (buffer) => {
    try {
        const directory = await unzipper.Open.buffer(buffer);

        //console.log('ZIP contents:', directory.files);

        if (directory.files.length === 0) {
            return { status: 400, error: 'Uploaded ZIP is empty '};
        };

        directory.files.forEach(file => {
            console.log(`Found file: ${file.path}`);
        });

        return { status: 200, message: 'ZIP processed successfully' };
    } catch(error) {
        console.log(error);
        return { status: 500, error: 'Error processing ZIP' };
    };
};