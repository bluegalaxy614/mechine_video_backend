const s3 = require('../config/s3');
const Video = require('../models/Video');
const { v4: uuidv4 } = require('uuid');

// Video upload handler
exports.uploadVideo = async (req, res) => {
  const { title, description } = req.body;

  // S3 upload parameters
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uuidv4()}.mp4`, // Unique file name
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  };

  try {
    // Upload video to S3
    const data = await s3.upload(params).promise();

    // Save video metadata to MongoDB
    const newVideo = new Video({
      title,
      description,
      videoUrl: data.Location // S3 URL
    });

    await newVideo.save();

    res.status(200).json({ message: 'Upload successful', videoUrl: data.Location });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Upload failed', error });
  }
};
