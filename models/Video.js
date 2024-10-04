const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: true
  },
  videoUrl:{
    type: String,
    // required: true
  },
  mainCategory: {
    type: String,
    // required: true,
  },
  subCategory: {
    type: String,
    // required: true
  },
  description: {
    // type: String,
  },
  posterId: {
    type: String,
    // required: true
  },
  duration: {
    type: String,
    // required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  status:{
    type: String,
    default: 'penidng' //pending, approved, rejected
  },
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);