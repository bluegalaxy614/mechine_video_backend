const express = require('express');
const router = express.Router();
const userController  = require('../controllers/userController');

router.post('/getUsers', userController.getUsers);

module.exports = router;