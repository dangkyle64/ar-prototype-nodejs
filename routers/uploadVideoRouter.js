import express from 'express';
import multer from 'multer';
import { uploadVideoController } from '../controllers/uploadVideoController.js';
import { handleFileError } from './uploadVideoRouterUtils.js';

const storage = multer.memoryStorage();
const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: MAX_SIZE_BYTES,
    },
});

const uploadVideoRouter = express.Router();

uploadVideoRouter.post('/', upload.single('video'), handleFileError, uploadVideoController);

export default uploadVideoRouter;

