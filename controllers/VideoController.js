const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const s3Client = require('../config/awsS3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const Video = require('../models/Video');
const User = require('../models/User');

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
        const userName = await User.findOne({ _id: userId });
        // Process Video Upload
        const videoFile = req.files['video'][0];
        console.log(videoFile);
        const videoFileName = `videos/${uuidv4()}${path.extname(videoFile.originalname)}`;
        const videoS3Response = await uploadFileToS3(videoFile.buffer, videoFileName, videoFile.mimetype);
        console.log('Video uploaded to S3:', videoS3Response);
        const videoUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoFileName}`;


        const thumbnailFile = req.files['thumbnail'][0];
        const thumbnailFileName = `thumbnails/${uuidv4()}_thumbnail.png`;

        const thumbnailsS3Response = await uploadFileToS3(thumbnailFile.buffer, thumbnailFileName, thumbnailFile.mimetype);
        console.log('Thumbnail uploaded to S3:', thumbnailsS3Response);
        const thumbnailsUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailFileName}`;

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
            posterId: userId,
            posterName: userName.name,
            likes: 0,
            views: 0
        });

        await newVideo.save();

        const user = await User.findOne({ _id: userId });
        user.uploads.push(posterCounts + 1);
        await user.save();

        res.status(200).json({ message: 'Video and screenshot uploaded successfully!', videoUrl, thumbnailsUrl });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
};

const getVideos = async (req, res) => {
    console.log("getVideos controller")
    const { page, perPage, sort } = req.body;
    console.log(req.body)
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
const getPosterVideos = async (req, res) => {
    console.log("getPosterVideos controller")
    const { page, perPage, sort } = req.body;
    const userId = req.userId;
    try {
        const skip = (page - 1) * perPage;
        const videos = await Video.find({posterId: userId}).sort({ [sort]: -1 }).skip(skip).limit(perPage);
        const totalVideos = videos.countDocuments();
        const unPaidVideos = await Video.find({ posterId: userId, status: "未払い" }).countDocuments();
        const paidVideos = await Video.find({ posterId: userId, status: "支払い" }).countDocuments();
        const totalPaidMounts = paidVideos * 1000 / 10000;
        res.status(200).json({
            videos,
            currentPage: page,
            totalPages: Math.ceil(totalVideos / perPage),
            unPaidVideos,
            paidVideos,
            totalPaidMounts
        });
    } catch {
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}

const searchVideos = async (req, res) => {
    console.log("searchVideos controller")
    console.log(req.body)
    const { selectedCategories, selectedSubCategories, currentPage, selectedKeys } = req.body;
    const perPage = 20;
    const skip = (currentPage - 1) * perPage;
    const sort = selectedKeys?.currentKey || 'uploadDate';
    console.log(selectedCategories, selectedSubCategories, skip, sort)

    let videos = [];

    try {

        if (selectedSubCategories.length > 0) {
            console.log("selectedSubCategories.length > 0")
            selectedSubCategories.map(async (item, index) => {
                const { mainCategory, subCategory } = item;
                const temp = await Video.find({ selectedCategory: mainCategory, selectedSubCategory: subCategory });
                console.log(videos, "I am here!")
                videos = videos.concat(temp);
                return;
            })
        } else if (selectedCategories.length > 0 && selectedSubCategories.length === 0) {
            console.log("selectedCategories.length > 0 && selectedSubCategories.length === 0")
            videos = await Video.find({ selectedCategory: { $in: selectedCategories } }).sort({ [sort]: -1 }).skip(skip).limit(perPage);
        } else if (selectedCategories.length === 0 && selectedSubCategories.length === 0) {
            console.log("selectedCategories.length === 0 && selectedSubCategories.length === 0")
            videos = await Video.find().sort({ [sort]: -1 }).skip(skip).limit(perPage);
        }

        const totalVideos = videos.length;

        res.status(200).json({
            videos,
            totalPages: Math.ceil(totalVideos / perPage)
        });
    } catch {
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}

module.exports = { uploadVideoAndScreenshot, getVideos, searchVideos, getPosterVideos };