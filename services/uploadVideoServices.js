export const processVideo = async (buffer, mimetype) => {
    try {
        console.log({
            mimetype: mimetype,
            size: buffer.length,
            message: 'Video processed in-memory',
        });
    } catch(error) {
        console.error({
            error: 'Error processing video',
        });
    };
};

//docker run --gpus all -it colmap/colmap bash
//nvidia-smi