const Order = require("../models/Order");
const OrderStatus = require("../models/OrderStatus");
const Product = require("../models/Product");

exports.getAll = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('status')
            .populate('items.product');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.getById = async (req, res, next) => {
    let order;
    try {
        order = await Order.findById(req.params.id)
            .populate('status')
            .populate('items.product');
        if (!order) return res.status(404).json({ message: "Cannot find order with id " + req.params.id });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.order = order;
    next();
}

exports.create = async (req, res) => {
    try {
        for (const item of req.body.items) {
            const productExists = await Product.findById(item.product);
            if (!productExists) return res.status(400).json({ message: `Product ${item.product} not found` });
            if (!Number.isInteger(item.quantity) || item.quantity <= 0)
                return res.status(400).json({ message: `Invalid quantity for product ${item.product}` });
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
        res.status(201).json(addedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

exports.updateStatus = async (req, res) => {
    const order = res.order;

    try {
        const newStatus = await OrderStatus.findById(req.body.status);
        if (!newStatus) return res.status(400).json({ message: 'Invalid status' });

        const currentStatus = await OrderStatus.findById(order.status);
        if (currentStatus.name === 'CANCELLED' && newStatus.name === 'COMPLETED') {
            return res.status(400).json({ message: 'Cannot complete a cancelled order' });
        }

        order.status = newStatus._id;
        if (newStatus.name === 'APPROVED') order.approvedAt = new Date();

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
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
        res.status(500).json({ message: err.message });
    }
}

exports.getAllStatuses = async (req, res) => {
    try {
        const statuses = await OrderStatus.find();
        res.json(statuses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
