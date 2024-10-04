const mongoose = require('mongoose');

const vidoeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mainCategory: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: 'visitor'//admin || poster
  },
  poster: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
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

module.exports = mongoose.model('Vodeo', vidoeSchema);