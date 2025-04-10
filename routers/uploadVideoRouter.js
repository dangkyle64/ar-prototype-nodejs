import express from 'express';
import multer from 'multer';
import { uploadVideoController } from '../controllers/uploadVideoController';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/', upload.single('video'), uploadVideoController);

export default router;