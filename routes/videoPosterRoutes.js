const express = require('express');
const { uploadVideo } = require('../controllers/uploadVideoController');

const router = express.Router();

// Route for generating pre-signed URL for S3 upload
router.post('/uploadVideo', uploadVideo);

module.exports = router;