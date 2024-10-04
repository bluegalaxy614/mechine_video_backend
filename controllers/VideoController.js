const s3Client = require('../config/s3');
const Video = require('../models/Video');
const { v4: uuidv4 } = require('uuid');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

// Video upload handler
exports.uploadVideo = async (req, res) => {
    console.log("video upload controller")
    const {
        title,
        description,
        videoDuration,
        youtubeLink,
        videoCode,
        machineName,
        format,
        manufacturer,
        selectedCategory,
        selectedSubCategory
    } = req.body;

    console.log(req.body)

    // S3 upload parameters
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.mp4`, // Unique file name
        Body: req.file.buffer,
        ContentType: req.file.mimetype
    };

    try {
        // Upload video to S3 using v3 command
        const data = await s3Client.send(new PutObjectCommand(params));
        // Save video metadata to MongoDB
        const newVideo = new Video({
            title,
            description,
            videoDuration,
            youtubeLink,
            videoCode,
            machineName,
            format,
            manufacturer,
            selectedCategory,
            selectedSubCategory,
            videoUrl: data.Location,
            posterId:userId,
        });

        await newVideo.save();
        console.log('Video uploaded successfully');
        res.status(200).json({ message: 'Upload successful', videoUrl: data.Location });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ message: 'Upload failed', error });
    }
};
