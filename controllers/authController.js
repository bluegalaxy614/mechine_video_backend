const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    sendEmail(email, verificationCode);

    res.status(201).json({ message: 'User registered. Check email for verification.' });
};

exports.verifyEmail = async (req, res) => {
    const { email, verificationCode } = req.body;

    const user = await User.findOne({ email, verificationCode });
    if (!user) {
        return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
        return res.status(400).json({ message: 'Invalid credentials or email not verified' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, message: 'Login successful' });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try{
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;
        await user.save();
        sendVerificationEmail(email, verificationCode);
        res.status(200).json({ message: 'Verification email sent' });
    }catch(err){
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}