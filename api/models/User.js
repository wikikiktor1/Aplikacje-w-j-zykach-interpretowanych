const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['KLIENT', 'PRACOWNIK'],
        required: true
    },
    refreshToken: {
        type: String, default: null
    },
    fullName: {
        type: String, default: ''
    },
    email: {
        type: String, default: ''
    },
    phone: {
        type: String, default: ''
    }
});

module.exports = mongoose.model('User', userSchema);