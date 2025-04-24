import express from 'express';
import { getAllPlyFilesFromS3, streamPlyFileFromS3 } from '../controllers/plyModelController.js';

const getPlyFromS3Router = express.Router();

getPlyFromS3Router.get('/ply/:filename', streamPlyFileFromS3);
getPlyFromS3Router.get('/ply/', getAllPlyFilesFromS3);

export default getPlyFromS3Router;