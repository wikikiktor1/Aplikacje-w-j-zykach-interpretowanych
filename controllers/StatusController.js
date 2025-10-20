const OrderStatus = require('../models/OrderStatus');

exports.getAllStatuses = async (req, res) => {
    try {
        const statuses = await OrderStatus.find();
        res.status(200).json(statuses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
