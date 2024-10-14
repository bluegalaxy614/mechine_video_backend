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
  thumbnailsUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
  posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // User ID of uploader
  posterName: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  status:{type:String, default:'保留中'},
  revenue:{type:Number, default:0}
});

// Create the Video model
const Video = mongoose.model('Video', videoSchema);

module.exports = Video;