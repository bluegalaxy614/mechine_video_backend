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
    posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    posterName: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    status: { type: String, default: '保留中' },
    revenue: { type: Number, default: 0 },
    stars: { type: Number, default: 0 },
    searchField: { type: String },
});

// Pre-save middleware to dynamically set searchField
videoSchema.pre('save', function (next) {
    this.searchField = `${this.title} ${this.description} ${this.machineName} ${this.manufacturer} ${this.selectedCategory} ${this.selectedSubCategory}`;
    next();
});

// Add indexes to frequently queried fields
videoSchema.index({ searchField: 'text' });
videoSchema.index({ uploadDate: -1 });

// Create the Video model
const Video = mongoose.model('Video', videoSchema);

module.exports = Video;