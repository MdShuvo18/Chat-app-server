// Models/User.js

const mongoose = require('mongoose');

const messagesSchema = new mongoose.Schema({
    conversationId: {
        type: String,
    },
    senderId: {
        type: String,
    },
    message: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messagesSchema);

