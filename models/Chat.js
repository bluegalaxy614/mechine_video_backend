const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages:[{
        from: { type: String, required: true },
        message: { type: String, required: true },
        date: { type: Date, default: Date.now }
    }],
    unread: { type: Number, default: 0 }
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;