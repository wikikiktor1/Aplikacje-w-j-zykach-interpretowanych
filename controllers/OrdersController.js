const Order = require("../models/Order");
const OrderStatus = require("../models/OrderStatus");
const Product = require("../models/Product");
const { StatusCodes } = require('http-status-codes');

exports.getAll = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('status')
            .populate('items.product');
            res.status(StatusCodes.OK).json(orders);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
}

exports.getById = async (req, res, next) => {
    let order;
    try {
        order = await Order.findById(req.params.id)
            .populate('status')
            .populate('items.product');
        if (!order) return res.status(StatusCodes.NOT_FOUND).json({ message: "Cannot find order with id " + req.params.id });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
    res.order = order;
    next();
}

exports.create = async (req, res) => {
    try {
        for (const item of req.body.items) {
            const productExists = await Product.findById(item.product);
            if (!productExists) return res.status(StatusCodes.NOT_FOUND).json({ message: `Product ${item.product} not found` });
            if (!Number.isInteger(item.quantity) || item.quantity <= 0)
                return res.status(StatusCodes.BAD_REQUEST).json({ message: `Invalid quantity for product ${item.product}` });
        }

        const pendingStatus = await OrderStatus.findOne({ name: 'PENDING' });

        const newOrder = new Order({
            approvedAt: null,
            status: pendingStatus._id,
            userName: req.body.userName,
            email: req.body.email,
            phone: req.body.phone,
            items: req.body.items
        });

        const addedOrder = await newOrder.save();
        res.status(StatusCodes.CREATED).json(addedOrder);
    } catch (err) {
       return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
}

exports.updateStatus = async (req, res) => {
    const order = res.order;

    try {
        const newStatus = await OrderStatus.findById(req.body.status);
        if (!newStatus) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid status' });

        const currentStatus = await OrderStatus.findById(order.status);
        if (currentStatus.name === 'CANCELLED' && newStatus.name === 'COMPLETED') {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Cannot complete a cancelled order' });
        }

        order.status = newStatus._id;
        if (newStatus.name === 'APPROVED') order.approvedAt = new Date();

        const updatedOrder = await order.save();
        res.status(StatusCodes.OK).json(updatedOrder);
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
}

exports.getByStatus = async (req, res) => {
    try {
        const status = await OrderStatus.findById(req.params.id);
        if (!status) return res.status(404).json({ message: 'Status not found' });

        const orders = await Order.find({ status: status._id })
            .populate('status')
            .populate('items.product');
        res.json(orders);
    } catch (err) {
       return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
}

exports.getAllStatuses = async (req, res) => {
    try {
        const statuses = await OrderStatus.find();
        res.json(statuses);
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
}
