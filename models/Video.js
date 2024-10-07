const mongoose = require('mongoose');

// Define the video schema
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoDuration: { type: String },
  videoCode: { type: String },
  machineName: { type: String },
  format: { type: String },
  manufacturer: { type: String },
  selectedCategory: { type: String },
  selectedSubCategory: { type: String },
  thumbnailsUrl: { type: String, required: true },  // URL for the locally stored image
  videoUrl: { type: String, required: true },  // URL for the S3 video
  posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // User ID of uploader
  uploadDate: { type: Date, default: Date.now },
});

// Create the Video model
const Video = mongoose.model('Video', videoSchema);

module.exports = Video;