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
    default: 'visitor'//admin || poster
  },
  avatar: {
    type: String
  },
  expired: {
    start: {
      type: Date
    },
    end: {
      type: Date
    }
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);