const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const posterControllers = require('../controllers/posterController');
const upload = require('../middlewares/multer');

const router = express.Router();

router.post('/updateProfile',
    authMiddleware,
    upload.fields([
        { name: 'avatar', maxCount: 1 },
    ]),
    posterControllers.updateProfile);

module.exports = router;
