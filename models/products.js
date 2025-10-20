const mongoose = require('mongoose')

const goodSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    weight: {
        type: Double,
        required: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
})

module.exports = mongoose.model('Product', goodSchema)