import express from 'express';
import multer from 'multer';
import { getPlyController } from '../controllers/getPlyController.js';

const storage = multer.memoryStorage();
const MAX_SIZE_MB = 100;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// fileFilter callback to make it easier to confirm if the incoming is a proper zip or compressed zip and not another file
const upload = multer({ 
    storage: storage,
    limits: { fileSize: MAX_SIZE_BYTES },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/zip' && file.mimetype !== 'application/x-zip-compressed') {
            return cb(new Error('Only ZIP files are allowed'), false);
        }
        cb(null, true);
    }
});

const getPlyRouter = express.Router();

getPlyRouter.post('/', upload.single('zip'), getPlyController);

export default getPlyRouter;