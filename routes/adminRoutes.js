const express = require('express');
const {
    createNews,
    getNews,
    getVideoWithUserId,
    getAllVideos,
    updateVideo,
    getAllMessage,
    sendMessages
} = require('../controllers/adminControllers');
const router = express.Router();

router.post('/createNews', createNews);
router.post('/getNews', getNews);
router.post('/getVideoWithUserId', getVideoWithUserId);
router.post('/getAllVideos', getAllVideos);
router.post('/updateVideo', updateVideo);
router.post('/getAllMessage', getAllMessage);
router.post('/sendMessages', sendMessages);

module.exports = router;