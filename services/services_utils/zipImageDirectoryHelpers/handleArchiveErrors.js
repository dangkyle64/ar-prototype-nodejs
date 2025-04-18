export const handleArchiveError = (reject) => (error) => {

    if (typeof reject !== 'function') {
        throw new Error('reject is not a function');
    };

    if (!error) {
        throw new Error('No error provided');
    };

    let errorMessage;
    if (error && error.message || error.message === '') {
        errorMessage = error.message;
    } else {
        errorMessage = 'Unknown archiver error';
    };

    reject(new Error(`Archiver error: ${errorMessage}`));
};