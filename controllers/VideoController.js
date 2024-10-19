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

const deleteFileFromS3 = async (key) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME, // S3 bucket name
        Key: key, // File name (or path) in the S3 bucket
    };

    try {
        // Create a DeleteObjectCommand and send it
        const command = new DeleteObjectCommand(params);
        const data = await s3Client.send(command);
        console.log("File deleted successfully:", data);
    } catch (err) {
        console.error("Error deleting file:", err.message);
    }
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
        // const videoFile = req.files['video'][0];
        // console.log(videoFile);
        // const videoFileName = `videos/${uuidv4}${path.extname(videoFile.originalname)}`;
        // const videoFileName = `videos/${uuidv4()}${path.extname(videoFile.originalname)}`;
        // const videoS3Response = await uploadFileToS3(videoFile.buffer, videoFileName, videoFile.mimetype);
        // console.log('Video uploaded to S3:', videoS3Response);
        // const videoUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoFileName}`;

        const videoUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
        const thumbnailsUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;


        // const thumbnailFile = req.files['thumbnail'][0];
        // const thumbnailFileName = `thumbnails/${uuidv4()}_thumbnail.png`;

        // const thumbnailsS3Response = await uploadFileToS3(thumbnailFile.buffer, thumbnailFileName, thumbnailFile.mimetype);
        // console.log('Thumbnail uploaded to S3:', thumbnailsS3Response);
        // const thumbnailsUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailFileName}`;

        // Save video and screenshot URLs to MongoDB
        const newVideo = new Video({
            title,
            description,
            videoCode,
            machineName,
            format,
            manufacturer,
            selectedCategory: selectedCategory,
            selectedSubCategory: selectedSubCategory,
            videoUrl,
            thumbnailsUrl,
            posterId: userId,
            posterName: userName.name,
            likes: 0,
            views: 0
        });

        await newVideo.save();

        userName.uploads += 1;
        await userName.save();

        res.status(200).json({ message: 'ビデオが正常にアップロードされました!', videoUrl, thumbnailsUrl });
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
const getPosterVideos = async (req, res) => {
    console.log("getPosterVideos controller");
    console.log(req.body);

    const { page = 1, perPage = 10, sort = 'uploadDate' } = req.body;
    const userId = req.userId;
    const skip = (page - 1) * perPage;

    try {
        // Run all queries concurrently to reduce execution time
        const [videos, totalVideos, unPaidVideos, paidVideos] = await Promise.all([
            // Fetch videos with pagination, sorting, and lean
            Video.find({ posterId: userId })
                .select('_id title videoDuration views revenue status')
                .sort({ [sort]: -1 })
                .skip(skip)
                .limit(perPage)
                .lean(),

            // Get total count of videos uploaded by the user
            Video.countDocuments({ posterId: userId }),

            // Count unpaid videos
            Video.countDocuments({ posterId: userId, status: "未払い" }),

            // Count paid videos
            Video.countDocuments({ posterId: userId, status: "支払い" })
        ]);

        // Calculate total paid amounts
        const totalPaidMounts = paidVideos * 1000 / 10000;

        // Respond with the data
        res.status(200).json({
            videos: videos,  // The list of videos
            currentPage: page,
            totalPages: Math.ceil(totalVideos / perPage),  // Calculate total pages for pagination
            unPaidVideos: unPaidVideos,  // Unpaid videos count
            paidVideos: paidVideos,    // Paid videos count
            totalPaidMounts: totalPaidMounts // Total paid amount in the specified unit
        });

    } catch (error) {
        console.error("Error in getPosterVideos:", error);
        res.status(500).json({ message: 'An error occurred while fetching the videos.' });
    }
};

const isStaredVideo = async (req, res) => {
    console.log("getPosterVideos controller")
    const { videoId } = req.body;
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        user.likes.push(videoId);
        await user.save();
        res.json({ message: "成功！" })
    } catch {
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}

const searchVideos = async (req, res) => {
    console.log("searchVideos controller");
    console.log(req.body);

    const { selectedCategories, selectedSubCategories, currentPage = 1, selectedKeys } = req.body;
    const perPage = 20;
    const skip = (currentPage - 1) * perPage;
    const sort = selectedKeys?.currentKey || 'uploadDate';
    console.log(selectedCategories, selectedSubCategories, skip, sort);

    try {
        let query = {};

        // Build query based on selected categories and subcategories
        if (selectedSubCategories.length > 0) {
            // Filter by selectedSubCategories using the $in operator
            query.selectedSubCategory = { $in: selectedSubCategories };
        } else if (selectedCategories.length > 0 && selectedSubCategories.length === 0) {
            // Filter by selectedCategories using the $in operator
            query.selectedCategory = { $in: selectedCategories };
        }

        console.log("Generated query:", query);

        // Fetch total count of matching documents
        const totalVideos = await Video.countDocuments(query);

        // Fetch paginated, sorted videos based on the query
        let videos = await Video.find(query)
            .sort({ [sort]: -1 })      // Sort by the selected key, default is 'uploadDate'
            .skip(skip)                // Skip documents for pagination
            .limit(perPage);           // Limit the result to `perPage`

        console.log(videos, totalVideos)

        // Respond with videos and total pages info
        res.status(200).json({
            video: videos,                         // The video results
            totalPages: Math.ceil(totalVideos / perPage), // Total pages for pagination
        });
    } catch (error) {
        console.error("Error in searchVideos: ", error);
        res.status(500).json({ message: 'An error occurred during the search process.' });
    }
};

const searchVideoInString = async (req, res) => {
    console.log("searchVideoInString controller");

    const { inputValue, currentPage, perPage, selectedKeys } = req.body;
    const skip = (currentPage - 1) * perPage;
    const sort = selectedKeys?.currentKey || 'uploadDate';

    try {
        // Use regex for case-insensitive search and optimize query with lean and selected fields
        const query = {
            searchField: new RegExp(inputValue, 'i'), // Precompiled regex for better performance
        };

        // Create a projection to only fetch necessary fields
        const projection = 'title description thumbnailsUrl videoUrl posterName uploadDate views stars';

        // Fetch the total count of matching documents
        const totalVideos = await Video.countDocuments(query);

        // Fetch the paginated and sorted videos
        const videos = await Video.find(query)
            .select(projection)       // Only select required fields
            .sort({ [sort]: -1 })     // Sort by the selected key
            .skip(skip)               // Skip documents for pagination
            .limit(perPage)           // Limit to `perPage`
            .lean();                  // Use lean for better performance

        // Send the response with videos and total pages for pagination
        res.status(200).json({
            video: videos,                            // Array of video results
            totalPages: Math.ceil(totalVideos / perPage),  // Total pages for pagination
        });
    } catch (error) {
        console.error("Error in searchVideoInString:", error);
        res.status(500).json({ message: 'An error occurred during the search process.' });
    }
};



const deleteUserById = async (req, res) => {
    console.log("deleteUserById")
    const { userId } = req.body;
    try {
        const video = await Video.find({ userId: userId });
        const thumbnailName = await video.thumbnailsUrl;
        const videoUrl = await video.videoUrl;
        const deleteVideo = await deleteFileFromS3(`videos/${videoUrl}`)
        const deleteThumb = await deleteFileFromS3(`thumbnails/${thumbnailName}`)
        const result = await User.findOneAndDelete({ _id: userId })
        res.json({
            message: "成功！"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}
const deleteVideoById = async (req, res) => {
    console.log("deleteVideoById")
    const { videoId } = req.body;
    try {
        const video = await Video.findById(videoId);
        const thumbnailName = await video.thumbnailsUrl;
        const videoUrl = await video.videoUrl;
        const deleteVideo = await deleteFileFromS3(`videos/${videoUrl}`)
        const deleteThumb = await deleteFileFromS3(`thumbnails/${thumbnailName}`)
        const result = await Video.findOneAndDelete({ _id: videoId })
        res.json({
            message: "成功！"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}
module.exports = {
    uploadVideoAndScreenshot,
    getVideos,
    searchVideos,
    getPosterVideos,
    isStaredVideo,
    deleteUserById,
    deleteVideoById,
    searchVideoInString
};