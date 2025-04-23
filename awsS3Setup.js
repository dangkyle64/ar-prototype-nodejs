import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

console.log("-------------------------------------------------------------------------------------------------------");
console.log("Real S3 client initialized");
console.log("-------------------------------------------------------------------------------------------------------");

const S3 = new AWS.S3({
    endpoint: process.env.DEFAULT,
    accessKeyId: process.env.ACCESS_CLOUD,
    secretAccessKey: process.env.SECRET_ACCESS_CLOUD,
    region: 'auto',
    signatureVersion: 'v4',
});

export default S3;