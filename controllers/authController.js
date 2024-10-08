const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

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

  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  const token = generateToken(user._id);

  res.status(201).json(
    {
      message: 'User registered. Check email for verification.',
      token: token,
      user: {
        name: name,
        email: email,
        avatar: user.avatar
      },
    }
  );
};

exports.login = async (req, res) => {
  console.log(req.userId)
  const { email, password } = req.body;
  console.log(req.body);

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials or email not verified' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user._id);
  console.log(token);

  res.status(200).json(
    {
      message: 'User registered.',
      token: token,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    }
  );
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    // const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    // user.verificationCode = verificationCode;
    await user.save();
    // sendVerificationEmail(email, verificationCode);
    res.status(200).json({ message: 'Verification email sent' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}