const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { uploadVideo } = require('../controllers/VideoController');
const authMiddleware = require('../middleware/authMiddleware');

// POST route for uploading video
router.post('/upload', authMiddleware, upload.single('video'), uploadVideo);

module.exports = router;