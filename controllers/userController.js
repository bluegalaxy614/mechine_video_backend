const User = require('../models/User');

const getUsers = async (req, res) => {
    const { perPage, page, sort } = req.body;
    const skip = (page - 1) * perPage;
    try {
        const users = await User.find().sort({ [sort]: -1 }).skip(skip).limit(perPage);
        const totalPages = Math.ceil(await User.countDocuments() / perPage);
        res.json({users : users,totalPages : totalPages});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getUsers
};