const express = require('express');
const upload = require('../middlewares/multer');
const {uploadVideoAndScreenshot, getVideos, searchVideos, getPosterVideos} = require('../controllers/VideoController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// POST route for video and screenshot uploads
router.post('/upload',
    authMiddleware,
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]),
    uploadVideoAndScreenshot
);

// router.post('/getVideos',authMiddleware, getVideos);
router.post('/getVideos', getVideos);
router.post('/getVideos',authMiddleware, getPosterVideos);
router.post('/search', authMiddleware, searchVideos);

module.exports = router;
