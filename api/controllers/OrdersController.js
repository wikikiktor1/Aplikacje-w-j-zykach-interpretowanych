
const Order = require("../models/orders");
const OrderStatus = require("../models/OrderStatus");
const Product = require("../models/products");
const { StatusCodes } = require('http-status-codes');
const { sendProblemDetails } = require('../utils/problemDetails');

exports.getAll = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === 'KLIENT') {
            filter.email = req.user.email;
        }
        const orders = await Order.find(filter)
            .populate('status')
            .populate('items.product');
        res.status(StatusCodes.OK).json(orders);
    } catch (err) {
        sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
}

exports.getById = async (req, res, next) => {
    let order;
    try {
        order = await Order.findById(req.params.id)
            .populate('status')
            .populate('items.product');
        if (!order) {
            return sendProblemDetails(res, {
                type: '/problems/order-not-found',
                title: 'Zamówienie nie znalezione',
                status: StatusCodes.NOT_FOUND,
                detail: "Cannot find order with id " + req.params.id,
                instance: req.originalUrl
            });
        }
    } catch (err) {
        return sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
    res.order = order;
    next();
}

exports.create = async (req, res) => {
    try {
        const { userName, email, phone, items } = req.body;
        if (!userName || !email || !phone) {
            return sendProblemDetails(res, {
                type: '/problems/validation-error',
                title: 'Błąd walidacji danych',
                status: StatusCodes.BAD_REQUEST,
                detail: "Pola użytkownika (userName, email, phone) nie mogą być puste",
                extras: { invalid_params: [{ name: 'userName' }, { name: 'email' }, { name: 'phone' }] },
                instance: req.originalUrl
            });
        }

        if (!/^\d+$/.test(phone)) {
            return sendProblemDetails(res, {
                type: '/problems/validation-error',
                title: 'Błąd walidacji danych',
                status: StatusCodes.BAD_REQUEST,
                detail: "Numer telefonu zawiera niedozwolone znaki",
                extras: { invalid_params: [{ name: 'phone', reason: 'digits only' }] },
                instance: req.originalUrl
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return sendProblemDetails(res, {
                type: '/problems/validation-error',
                title: 'Błąd walidacji danych',
                status: StatusCodes.BAD_REQUEST,
                detail: "Lista produktów nie może być pusta",
                extras: { invalid_params: [{ name: 'items', reason: 'must be non-empty array' }] },
                instance: req.originalUrl
            });
        }

        for (const item of items) {
            const productExists = await Product.findById(item.product);
            if (!productExists) {
                return sendProblemDetails(res, {
                    type: '/problems/product-not-found',
                    title: 'Produkt nie istnieje',
                    status: StatusCodes.NOT_FOUND,
                    detail: `Produkt o ID ${item.product} nie istnieje`,
                    instance: req.originalUrl
                });
            }
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                return sendProblemDetails(res, {
                    type: '/problems/validation-error',
                    title: 'Błąd walidacji danych',
                    status: StatusCodes.BAD_REQUEST,
                    detail: `Nieprawidłowa ilość produktu ${item.product}: ${item.quantity}`,
                    extras: { invalid_params: [{ name: 'quantity', product: item.product, reason: 'must be positive integer' }] },
                    instance: req.originalUrl
                });
            }
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
        return sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
}

exports.updateStatus = async (req, res) => {
    const order = res.order;

    try {
        const newStatus = await OrderStatus.findById(req.body.status);
        if (!newStatus) {
            return sendProblemDetails(res, {
                type: '/problems/validation-error',
                title: 'Błąd walidacji danych',
                status: StatusCodes.BAD_REQUEST,
                detail: 'Invalid status',
                extras: { invalid_params: [{ name: 'status' }] },
                instance: req.originalUrl
            });
        }

        const currentStatus = await OrderStatus.findById(order.status);
        if (currentStatus.name === 'CANCELLED' && newStatus.name === 'COMPLETED') {
            return sendProblemDetails(res, {
                type: '/problems/invalid-state-transition',
                title: 'Nieprawidłowa zmiana statusu',
                status: StatusCodes.BAD_REQUEST,
                detail: 'Cannot complete a cancelled order',
                instance: req.originalUrl
            });
        }

        const forbiddenTransitions = {
            'CANCELLED': ['COMPLETED', 'APPROVED', 'PENDING'],
            'COMPLETED': ['PENDING', 'APPROVED']
        };

        if (forbiddenTransitions[currentStatus.name]?.includes(newStatus.name)) {
            return sendProblemDetails(res, {
                type: '/problems/invalid-state-transition',
                title: 'Nieprawidłowa zmiana statusu',
                status: StatusCodes.BAD_REQUEST,
                detail: `Nie można zmienić statusu z ${currentStatus.name} na ${newStatus.name}`,
                instance: req.originalUrl
            });
        }

        order.status = newStatus._id;
        order.approvedAt = new Date();
        if (newStatus.name === 'APPROVED') order.approvedAt = new Date();

        const updatedOrder = await order.save();
        res.status(StatusCodes.OK).json(updatedOrder);
    } catch (err) {
        return sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
}

exports.getByStatus = async (req, res) => {
    try {
        const status = await OrderStatus.findById(req.params.id);
        if (!status) {
            return sendProblemDetails(res, {
                type: '/problems/status-not-found',
                title: 'Status nie znaleziony',
                status: StatusCodes.NOT_FOUND,
                detail: 'Status not found',
                instance: req.originalUrl
            });
        }

        const orders = await Order.find({ status: status._id })
            .populate('status')
            .populate('items.product');
        res.status(StatusCodes.OK).json(orders);
    } catch (err) {
        return sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
}

exports.getAllStatuses = async (req, res) => {
    try {
        const statuses = await OrderStatus.find();
        res.status(StatusCodes.OK).json(statuses);
    } catch (err) {
        return sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
}

exports.addOpinion = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { rating, content } = req.body;
        const userId = req.user?.id;

        if (!rating || !content) {
            return sendProblemDetails(res, {
                type: '/problems/validation-error',
                title: 'Błąd walidacji danych',
                status: StatusCodes.BAD_REQUEST,
                detail: 'Wymagane pola: ocena i treść opinii',
                extras: { invalid_params: [{ name: 'rating' }, { name: 'content' }] },
                instance: req.originalUrl
            });
        }
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return sendProblemDetails(res, {
                type: '/problems/validation-error',
                title: 'Błąd walidacji danych',
                status: StatusCodes.BAD_REQUEST,
                detail: 'Ocena musi być liczbą całkowitą z zakresu 1-5',
                extras: { invalid_params: [{ name: 'rating', reason: '1-5 integer' }] },
                instance: req.originalUrl
            });
        }

        const order = await Order.findById(orderId).populate('status');
        if (!order) {
            return sendProblemDetails(res, {
                type: '/problems/order-not-found',
                title: 'Zamówienie nie istnieje',
                status: StatusCodes.NOT_FOUND, // Poprawiono status code
                detail: 'Zamówienie nie istnieje',
                instance: req.originalUrl
            });
        }

        if (order.email !== req.user?.email && order.userName !== req.user?.userName) {
            return sendProblemDetails(res, {
                type: '/problems/forbidden',
                title: 'Brak uprawnień',
                status: StatusCodes.FORBIDDEN,
                detail: `Brak uprawnień do dodania opinii do tego zamówienia.`,
                instance: req.originalUrl
            });
        }

        const statusName = order.status?.name?.toUpperCase();
        const allowedStatuses = ['COMPLETED', 'CANCELLED', 'ZREALIZOWANE', 'ANULOWANE'];

        if (!allowedStatuses.includes(statusName)) {
            return sendProblemDetails(res, {
                type: '/problems/invalid-state',
                title: 'Nieprawidłowy stan zamówienia',
                status: StatusCodes.BAD_REQUEST,
                detail: 'Opinię można dodać tylko do zamówienia zrealizowanego lub anulowanego',
                instance: req.originalUrl
            });
        }

        if (order.opinions && order.opinions.length > 0) {
            return sendProblemDetails(res, {
                type: '/problems/conflict',
                title: 'Opinia już istnieje',
                status: StatusCodes.CONFLICT,
                detail: 'Opinia do tego zamówienia została już dodana.',
                instance: req.originalUrl
            });
        }

        order.opinions.push({
            rating,
            content,
            user: userId,
            createdAt: new Date()
        });

        await order.save();
        return res.status(StatusCodes.CREATED).json({ message: 'Opinia dodana pomyślnie' });

    } catch (err) {
        return sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
}

exports.getPublicReviews = async (req, res) => {
    try {
        const orders = await Order.find({ opinions: { $exists: true, $not: { $size: 0 } } })
            .select('userName opinions items createdAt')
            .populate('items.product', 'name');

        const reviews = [];

        orders.forEach(order => {
            if (order.opinions && Array.isArray(order.opinions)) {
                order.opinions.forEach(op => {
                    reviews.push({
                        orderId: order._id,
                        author: order.userName || "Anonimowy Klient",
                        rating: op.rating,
                        content: op.content,
                        createdAt: op.createdAt || order.createdAt,
                        items: order.items.map(i => ({
                            name: i.product?.name || 'Produkt'
                        }))
                    });
                });
            }
        });

        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(StatusCodes.OK).json(reviews);
    } catch (err) {
        sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd pobierania opinii',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
};