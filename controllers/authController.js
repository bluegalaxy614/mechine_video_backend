const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const Chat = require('../models/Chat');

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
        role: user.role,
        paymentStatus: user.paymentStatus,
        cardNumber:user.paymentInfo.cardNumber
      },
      unread: 0,
    }
  );
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  let unread = false;
  if (!user) {
    return res.status(400).json({ message: '認証情報が無効か、メールが確認されていません。' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: '無効な資格情報。' });
  }

  const chat = await Chat.findOne({ userId: user._id });
  if(chat){
    unread = chat?.new;
  }

  user.status = true;
  await user.save();

  const token = generateToken(user._id);
  res.status(200).json(
    {
      message: 'サインインに成功しました。',
      user: {
        token: token,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      unread: unread
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

    user.password = "";
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

exports.logOut = async (req, res) => {
  const {email} = req.body;

  try{
    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({message: 'ユーザーが見つかりません。'})
    }
    user.status = false;
    await user.save();
    return res.status(200).json({message:"ok"});
  }catch(err){
    res.status(500).json({message : "Internal server error"})
  }
}