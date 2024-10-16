// Models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
}, { timestamps: true });

module.exports  = mongoose.model('User', userSchema);

