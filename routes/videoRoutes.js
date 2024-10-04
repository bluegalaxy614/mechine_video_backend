const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { uploadVideo } = require('../controllers/VideoController');

// POST route for uploading video
router.post('/upload', upload.single('video'), uploadVideo);

module.exports = router;