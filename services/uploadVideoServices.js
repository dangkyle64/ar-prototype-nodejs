export const processVideo = async (videoBuffer) => {
    try {
        console.log({
            size: videoBuffer.length,
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