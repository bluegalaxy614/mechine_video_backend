const express = require('express');
const {
    createNews,
    getNews,
    getVideoWithUserId,
    getAllVideos,
    updateVideo,
    getAllMessage,
    sendMessages,
    viewMessages,
    deleteAllChats,
    getAnalyseData
} = require('../controllers/adminControllers');
const { deleteUserById, deleteVideoById } = require('../controllers/VideoController');
const router = express.Router();

router.post('/createNews', createNews);
router.post('/getNews', getNews);
router.post('/getAnalyseData', getAnalyseData);
router.post('/getVideoWithUserId', getVideoWithUserId);
router.post('/getAllVideos', getAllVideos);
router.post('/updateVideo', updateVideo);
router.post('/getAllMessage', getAllMessage);
router.post('/sendMessages', sendMessages);
router.post('/deleteUserById', deleteUserById);
router.post('/deleteVideoById', deleteVideoById);
router.post('/viewMessages', viewMessages);
router.post('/deleteAllChats', deleteAllChats);

module.exports = router;