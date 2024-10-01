const express = require('express');
const { register, verifyEmail, login, forgotPassword } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

module.exports = router;