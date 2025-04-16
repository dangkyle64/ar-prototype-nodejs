const deleteOldFrames = async () => {
    const framesDir = path.resolve('./frames_output');

    try {
        await rm(framesDir, { recursive: true });
        console.log('Frames folder deleted');
    } catch(error) {
        console.error('Failed to delete frames folder: ', error);
    };
};