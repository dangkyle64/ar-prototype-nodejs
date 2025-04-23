import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import PlyModel from '../models/plyModel.js';

dotenv.config();

const s3 = new AWS.S3({
    endpoint: process.env.DEFAULT,
    accessKeyId: process.env.ACCESS_CLOUD,
    secretAccessKey: process.env.SECRET_ACCESS_CLOUD,
    region: 'auto',
    signatureVersion: 'v4',
});

export const getPlyFileFromS3 = (fileName) => {
    const params = {
        Bucket: process.env.R2_BUCKET,
        Key: fileName,
    };

    return s3.getObject(params).createReadStream();
};

const uploadFile = async () => {

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
        //const data = await s3.upload(params).promise();
        //console.log('Upload successful:', data);

        await PlyModel.create({
            name: uniqueFileName,
        });

        console.log('Saved the uniqueName in the DB');

    } catch (err) {
        console.error('Upload failed:', err);
    };
};

uploadFile();
