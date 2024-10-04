const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config();

// Create S3 client instance
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    requestHandler: {
        connectionTimeout: 300000,
        sockedTimeout: 300000
    }
});

// List buckets to verify connection
const checkConnection = async () => {
    try {
        const data = await s3Client.send(new ListBucketsCommand({}));
        console.log('AWS S3 connected successfully!');
    } catch (error) {
        console.log('AWS S3 not connected:', error);
    }
};

checkConnection();

module.exports = s3Client;