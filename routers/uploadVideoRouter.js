import express from 'express';
import multer from 'multer';
import { uploadVideoController } from '../controllers/uploadVideoController.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadVideoRouter = express.Router();

uploadVideoRouter.post('/', upload.single('video'), uploadVideoController);

export default uploadVideoRouter;