const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const posterControllers = require('../controllers/posterController');
const upload = require('../middlewares/multer');
const {
    uploadVideoAndScreenshot,
    getVideos,
    searchVideos,
    getPosterVideos,
    isStaredVideo,
    searchVideoInString
} = require('../controllers/VideoController');

router.post('/upload',
    authMiddleware,
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]),
    uploadVideoAndScreenshot
);

router.post('/updateProfile',
    authMiddleware,
    upload.fields([
        { name: 'avatar', maxCount: 1 },
    ]),
    posterControllers.updateProfile);
// router.post('/getVideos', authMiddleware, getVideos);
router.post('/getVideos', getVideos);
router.post('/getPosterVideos', authMiddleware, getPosterVideos);
router.post('/search', authMiddleware, searchVideos);
router.post('/getUsers', userController.getUsers);
router.post('/sendAskMessage', authMiddleware, userController.sendAskMessage);
router.post('/isStaredVideo', authMiddleware, isStaredVideo);
router.post('/getUserMessage', authMiddleware, userController.getUserMessage);
router.post('/giveStarToVideo', authMiddleware, userController.giveStarToVideo);
router.post('/sendTimer', authMiddleware, userController.sendTimer);
router.post('/searchVideoInString', authMiddleware, searchVideoInString);
router.post('/readMessage', authMiddleware, userController.readMessage);
router.post('/getPaid', authMiddleware, userController.getPaid);

module.exports = router;