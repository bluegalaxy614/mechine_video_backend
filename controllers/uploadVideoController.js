const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const Video = require('../models/Video');

exports.uploadVideo = async (req, res) => {
    const data = req.body;
    console.log(data)
    const video = new Video(data);
    await video.save();
    res.status(201).json({ message: 'Video uploaded successfully' });
}