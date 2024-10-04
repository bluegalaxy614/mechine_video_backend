const express = require('express');
const { uploadVideo } = require('../controllers/s3Controller');

const router = express.Router();

// Route for generating pre-signed URL for S3 upload
router.put('/videoFile', uploadVideo);

module.exports = router;