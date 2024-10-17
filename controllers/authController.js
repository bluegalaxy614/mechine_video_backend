const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'パスワードが一致しません。' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'メールアドレスはすでに存在します。' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  const token = generateToken(user._id);

  res.status(201).json(
    {
      message: '正常にサインアップしました。',
      user: {
        token: token,
        name: name,
        email: email,
        avatar: user.avatar,
        role:user.role,
      },
    }
  );
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: '認証情報が無効か、メールが確認されていません。' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: '無効な資格情報。' });
  }

  const token = generateToken(user._id);
  console.log(token);

  res.status(200).json(
    {
      message: 'サインインに成功しました。',
      user: {
        token: token,
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
      return res.status(400).json({ message: 'ユーザーが見つかりません。' });
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