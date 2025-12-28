const OrderStatus = require('../models/OrderStatus');
const { StatusCodes } = require('http-status-codes');
const { sendProblemDetails } = require('../utils/problemDetails');

exports.getAllStatuses = async (req, res) => {
    try {
        const statuses = await OrderStatus.find({});
        res.status(StatusCodes.OK).json(statuses);
    } catch (err) {
        sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
};