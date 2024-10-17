const Chat = require('../models/Chat');
const User = require('../models/User');

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
    console.log("sendAskMessage")
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
    console.log("getUserMessage")
    const userId = req.userId;
    try {
        let chats = await Chat.findOne({ userId: userId });
        res.json({ chats: chats });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const giveStartToVideo = async (req, res) => {
    console.log("getUserMessage")
    const userId = req.userId;
    const { videoId } = req.body;
    console.log(req.body)
    try {
        const video = await Video.findOne({_id:videoId});
        const user = await User.findOne({_id : userId});
        video.stars += 1;
        user.likes.push(videoId);
        await video.save();
        await user.save();
        res.json({
            message:"You give the star!"
        })

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getUsers,
    sendAskMessage,
    getUserMessage,
    giveStartToVideo,
};