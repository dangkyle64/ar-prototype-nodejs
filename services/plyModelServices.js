import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import PlyModel from '../models/plyModel.js';
import S3 from '../awsS3Setup.js';

dotenv.config();

export const getPlyFileFromS3 = (fileName, R2_BUCKET) => {

    if (!fileName || typeof fileName !== 'string') {
        throw new Error('Invalid or missing fileName');
    };

    if (!fileName.endsWith('.ply')) {
        throw new Error('Invalid file type');
    }
    
    const baseName = fileName.replace(/\.ply$/, '');
    if (baseName.length > 20) {
        throw new Error('Filename is too long');
    };

    if (!R2_BUCKET) {
        throw new Error('S3 bucket not configured');
    };

    if (fileName.includes('/') || fileName.includes('..') || fileName.includes(' ')) {
        throw new Error('Invalid file name');
    };

    try {
        const params = {
            Bucket: R2_BUCKET,
            Key: fileName,
        };

        const plyFile = S3.getObject(params);
        if (!plyFile || typeof plyFile.createReadStream !== 'function') {
            throw new Error('Malformed S3 response');
        };

        return plyFile.createReadStream();
    } catch(error) {
        if (error.code === 'NoSuchKey') {
            throw new Error('File not found in S3');
        }
        throw error;
    };
};

// didnt check for if process.env.R2_BUCKET was valid first 
export const getAllPlyFileKeys = async () => {
    const params = {
        Bucket: process.env.R2_BUCKET,
    };

    try {
        const response = await S3.listObjectsV2(params).promise();

        if (response.IsTruncated) {
            console.log('Results truncated — pagination not implemented yet.');
        };
        
        const keys = [];

        if (response.Contents) {
            for (let obj of response.Contents) {
                if (obj.Key) {
                    keys.push(obj.Key);
                };
            };
        };

        console.log("Keys found are: ", keys);
        return keys;
    } catch (err) {
        console.error("Error fetching S3 keys:", err);
        throw err;
    }
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
        //const data = await S3.upload(params).promise();
        //console.log('Upload successful:', data);

        await PlyModel.create({
            name: uniqueFileName,
        });

        console.log('Saved the uniqueName in the DB');

    } catch (err) {
        console.error('Upload failed:', err);
    };
};