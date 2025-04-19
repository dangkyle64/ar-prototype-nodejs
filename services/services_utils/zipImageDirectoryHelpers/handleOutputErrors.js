export const handleOutputErrors = (reject) => (error) => {

    if (typeof reject !== 'function') {
        throw new Error('reject is not a function');
    };

    if (!error) {
        throw new Error('No error provided');
    };

    let errorMessage;
    if (error && error.message) {
        errorMessage = error.message;
    } else {
        errorMessage = 'Unknown error';
    };

    reject(new Error(`File write error: ${errorMessage}`));
};