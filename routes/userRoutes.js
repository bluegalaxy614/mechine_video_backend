const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController  = require('../controllers/userController');

router.post('/getUsers', userController.getUsers);
router.post('/sendAskMessage', authMiddleware, userController.sendAskMessage);

module.exports = router;