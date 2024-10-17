const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: '無料会員'
  },
  avatar: {
    type: String
  },
  posterCounts: {
    type: Number,
    default: 0
  },
  viewCounts: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    default: null
  }],
  expired: {
    start: {
      type: Date
    },
    end: {
      type: Date
    }
  },
  uploads:{type:Number, default:0}
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);