const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  approvedAt: {
    type: Date,
    default: null
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderStatus',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],
  opinions: [
    {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model('Order', orderSchema);
