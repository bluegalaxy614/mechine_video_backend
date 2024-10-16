const News = require('../models/News')
const Video = require('../models/Video')
const Chat = require('../models/Chat')
const User = require('../models/User')
const createNews = async (req, res) => {
    console.log("create News", req)
    const { title, content } = req.body
    console.log(req.body)
    try {
        const news = new News({
            title: title,
            content: content
        })
        await news.save()
        res.json({ message: 'News created successfully' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getNews = async (req, res) => {
    console.log("get News")
    const perPage = 10
    const page = req.body.currenPage
    const skip = (page - 1) * perPage

    try {
        const news = await News.find().skip(skip).limit(perPage)
        const totalPages = Math.ceil(await News.countDocuments() / perPage)
        res.json({
            news,
            totalPages
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
const getAllVideos = async (req, res) => {
    console.log("getVideos controller")
    const { page, perPage, sort } = req.body;
    console.log(req.body)
    try {
        const skip = (page - 1) * perPage;
        const videos = await Video.find().sort({ [sort]: -1 }).skip(skip).limit(perPage);
        const totalVideos = await Video.countDocuments();

        res.status(200).json({
            videos,
            currentPage: page,
            totalPages: Math.ceil(totalVideos / perPage)
        });
    } catch {
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}
const getVideoWithUserId = async (req, res) => {
    console.log("get Video")
    console.log(req.body)
    const { videoId } = req.body;
    try {
        console.log(videoId)
        const video = await Video.findById(videoId)
        console.log(video)
        res.json({
            video
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}
const updateVideo = async (req, res) => {
    console.log(req.body)
    const { id, selectedCategory, selectedSubCategory, status } = req.body;
    try {
        const video = await Video.findById(id)
        video.selectedCategory = selectedCategory
        video.selectedSubCategory = selectedSubCategory
        video.status = status
        await video.save()
        console.log(video)
        res.json({
            video
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}

const getAllMessage = async (req, res) => {
    console.log("get All messages")
    try {
        const chats = await Chat.find()
        console.log(chats)
        res.json({
            messages:chats
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}
const sendMessages = async (req, res) => {
    console.log(req.body)
    const { userId, content } = req.body;
    try {
        const chat = await Chat.findOne({ userId: userId })
        console.log(chat)
        chat.messages.push({
            from: "admin",
            content: content
        })
        await chat.save()
        res.json({
            message:"Successfully Sent!"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}
const deleteUserById = async (req, res) => {
    console.log(req.body)
    const { userId } = req.body;
    try {
        const user = await User.findOneAndDelete({ _id: userId })
        res.json({
            message: "Successfully Deleted"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}
const deleteVideoById = async (req, res) => {
    console.log(req.body)
    const { videoId } = req.body;
    try {
        const user = await Video.findOneAndDelete({ _id: videoId })
        res.json({
            message: "Successfully Deleted"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'An error occurred during the upload process.' });
    }
}

module.exports = {
    createNews,
    getNews,
    getVideoWithUserId,
    getAllVideos,
    updateVideo,
    getAllMessage,
    sendMessages,
    deleteUserById,
    deleteVideoById,
}