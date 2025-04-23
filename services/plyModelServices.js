import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import PlyModel from '../models/plyModel.js';
import S3 from '../awsS3Setup.js';

dotenv.config();

export const getPlyFileFromS3 = (fileName) => {

    if (!fileName || typeof fileName !== 'string') {
        throw new Error('Invalid or missing fileName');
    };

    if (!fileName.endsWith('.ply')) {
        throw new Error('Invalid file type');
    }
    
    if (!process.env.R2_BUCKET) {
        throw new Error('S3 bucket not configured');
    };
    
    const params = {
        Bucket: process.env.R2_BUCKET,
        Key: fileName,
    };

    return S3.getObject(params).createReadStream();
};

export const uploadFile = async () => {

    const filePath = path.join('./ply', 'fused.ply');
    const fileBuffer = fs.readFileSync(filePath);

    const uniqueFileName = `${Date.now()}_fused.ply`;

    const params = {
        Bucket: process.env.R2_BUCKET,
        Key: uniqueFileName,
        Body: fileBuffer,
        ContentType: 'application/octet-stream',
    };
        
    try {
        const data = await S3.upload(params).promise();
        console.log('Upload successful:', data);

        await PlyModel.create({
            name: uniqueFileName,
        });

        console.log('Saved the uniqueName in the DB');

    } catch (err) {
        console.error('Upload failed:', err);
    };
};
