const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const s3Client = require('../config/awsS3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const Video = require('../models/Video');
const { ListExportsCommand } = require('@aws-sdk/client-dynamodb');

// Function to upload file to S3
const uploadFileToS3 = async (fileBuffer, fileName, contentType) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ACL: 'public-read',  // Public access for the file
        ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    console.log(command);
    return s3Client.send(command);
};

// Controller to handle video and screenshot upload
const uploadVideoAndScreenshot = async (req, res) => {
    const {
        title, description, videoCode, machineName, format,
        manufacturer, selectedCategory, selectedSubCategory
    } = req.body;

    const userId = req.userId;

    console.log(req.body);

    try {
        // Process Video Upload
        const videoFile = req.files['video'][0];
        console.log(videoFile);
        const videoFileName = `videos/${uuidv4()}${path.extname(videoFile.originalname)}`;
        const videoS3Response = await uploadFileToS3(videoFile.buffer, videoFileName, videoFile.mimetype);
        console.log('Video uploaded to S3:', videoS3Response);
        const videoUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoFileName}`;

        // const videoUrl = "https://repairingvideobucket.s3.ap-northeast-1.amazonaws.com/videos/bandicam+2024-08-05+06-22-06-587.mp4";
        // const thumbnailsUrl = "https://repairingvideobucket.s3.ap-northeast-1.amazonaws.com/thumbnails/photo_2024-07-09_02-08-07.jpg"

        const thumbnailFile = req.files['thumbnail'][0];
        const thumbnailFileName = `thumbnails/${uuidv4()}_thumbnail.png`;

        const thumbnailsS3Response = await uploadFileToS3(thumbnailFile.buffer, thumbnailFileName, thumbnailFile.mimetype);
        console.log('Thumbnail uploaded to S3:', thumbnailsS3Response);
        const thumbnailsUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailFileName}`;
        // Process Screenshot Upload
        const screenshotFile = req.files['screenshot'][0];
        const screenshotFileName = `${uuidv4()}_thumbnail.png`;
        const screenshotPath = path.join(__dirname, '../public/thumbnails', screenshotFileName);

        // Ensure the thumbnails directory exists
        if (!fs.existsSync(path.dirname(screenshotPath))) {
            fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
        }

        // Save screenshot to local directory
        fs.writeFileSync(screenshotPath, screenshotFile.buffer);
        const screenshotUrl = `/thumbnails/${screenshotFileName}`;

        // Save video and screenshot URLs to MongoDB
        const newVideo = new Video({
            title,
            description,
            videoCode,
            machineName,
            format,
            manufacturer,
            category: selectedCategory,
            subCategory: selectedSubCategory,
            videoUrl,
            thumbnailsUrl,
            posterId: userId
        });

        await newVideo.save();

        res.status(200).json({ message: 'Video and screenshot uploaded successfully!', videoUrl, thumbnailsUrl });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
};

const getVideos = async (req, res) => {
    console.log("getVideos controller")
    const { page, perPage, sort } = req.body;
    try {
        const skip = (page - 1) * perPage;
        const videos = await Video.find().sort({ [sort]: -1 }).skip(skip).limit(perPage);
        const totalVideos = await Video.countDocuments();

        res.status(200).json({
            videos,
            currentPage: page,
            totalPages: Math.ceil(totalVideos / perPage)
        });
    } catch {
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}

module.exports = { uploadVideoAndScreenshot, getVideos };