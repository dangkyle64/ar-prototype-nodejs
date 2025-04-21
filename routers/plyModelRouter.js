import express from 'express';
import { streamPlyFileFromS3 } from '../controllers/plyModelController.js';

const getPlyFromS3Router = express.Router();

getPlyFromS3Router.get('/ply/:filename', streamPlyFileFromS3);

export default getPlyFromS3Router;