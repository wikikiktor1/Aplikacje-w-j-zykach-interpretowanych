const OrderStatus = require('../models/OrderStatus');
const { StatusCodes } = require('http-status-codes');

exports.getAllStatuses = async (req, res) => {
    try {
        const statuses = await OrderStatus.find({});
        res.status(StatusCodes.OK).json(statuses);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
};
