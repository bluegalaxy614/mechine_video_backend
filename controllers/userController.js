require('dotenv').config();
const Chat = require('../models/Chat');
const User = require('../models/User');
const Video = require('../models/Video');

const addDailyIncome = async (userId, date, amount) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
  
      // Add or update the daily income entry
      const existingIncome = user.dailyIncome.find(entry => entry.date.toISOString() === new Date(date).toISOString());
      if (existingIncome) {
        existingIncome.amount += amount; // Update income if date exists
      } else {
        user.dailyIncome.push({ date: new Date(date), amount }); // Add new income entry
      }
  
      // Update the total income
      user.totalIncome += amount;
  
      await user.save();
      console.log('Daily income updated successfully');
    } catch (err) {
      console.error(err);
    }
};

const getUsers = async (req, res) => {
    const { perPage, page, sort } = req.body;
    const skip = (page - 1) * perPage;
    try {
        const users = await User.find().sort({ [sort]: -1 }).skip(skip).limit(perPage);
        const totalPages = Math.ceil(await User.countDocuments() / perPage);
        res.json({ users: users, totalPages: totalPages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const sendAskMessage = async (req, res) => {
    const userId = req.userId;
    const { content } = req.body;
    console.log(content)
    try {
        const user = await User.findOne({ _id: userId });
        if (!user) {
            throw new Error("ユーザーが見つかりません。");
        }

        let chat = await Chat.findOne({ userId: userId });
        console.log(chat)
        if (!chat) {
            // Create a new chat if it doesn't exist
            chat = new Chat({
                userId: userId,
                userName: user.name,
                userAvatar: user.avatar,
                messages: [{
                    from: userId,
                    content: content,
                }],
                unread: 1,  // Initial unread count
            });
        } else {
            // Update existing chat
            chat.messages.push({
                from: userId,
                content: content
            });
            chat.unread += 1;  // Increment unread count
        }

        // Save the chat (either a new one or the updated one)
        await chat.save();

        res.json({ message: "送信に成功しました。" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUserMessage = async (req, res) => {
    const userId = req.userId;
    try {
        let chats = await Chat.findOne({ userId: userId });
        res.json({ chats: chats });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const giveStarToVideo = async (req, res) => {
    const userId = req.userId;
    const { videoId } = req.body;
    try {
        const video = await Video.findOne({ _id: videoId }); // This will now work since Video is imported
        const user = await User.findOne({ _id: userId });     // Ensure the User model is also imported

        // Check if the video and user exist
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the stars for the video and add the videoId to the user's liked videos
        video.stars += 1;
        user.likes.push(videoId);

        // Save the updated video and user documents
        await video.save();
        await user.save();

        res.json({
            message: "You gave the star!"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const readMessage = async (req, res) => {
    const userId = req.userId;
    try {
        const chat = await Chat.findById({ userId: userId });
        chat.new = false;
        await chat.save()
        res.json({
            message: "Read Messsage!"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPaid = async (req, res) => {
    const userId = req.userId;
    try {
    const user = await User.findById({_id : userId});
        user.requestAction = true;
        await user.save();
        res.json({
            message: "Request sent!"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const sendTimer = async (req, res) => {
    const userId = req.userId;
    const {PlayedTime, videoId} = req.body;
    try {
        
        const video = await Video.findById(videoId);
        video.views += 1;
        video.videoDuration += Number(PlayedTime).toFixed(2);
        video.revenue += Number(PlayedTime * process.env.PRICEPERSECOND);
        
        await video.save();

        const user = await User.findById(userId);
        user.totalPlayedTime += Number(PlayedTime).toFixed(2);
        user.totalIncome += Number(PlayedTime * process.env.PRICEPERSECOND);
        await user.save();

        const dailyIncome = Number(PlayedTime * process.env.PRICEPERSECOND).toFixed(2);
        await addDailyIncome(userId, new Date(), parseFloat(dailyIncome));
        
        res.json({
            message: "ok"
        })

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = {
    getUsers,
    sendAskMessage,
    getUserMessage,
    giveStarToVideo,
    readMessage,
    sendTimer,
    getPaid
};