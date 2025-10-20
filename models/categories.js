const mongoose = require('mongoose')

const goodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model('Category', goodSchema)