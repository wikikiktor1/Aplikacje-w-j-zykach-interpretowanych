
const categories = require("../models/categories");
const { StatusCodes } = require('http-status-codes');
const { sendProblemDetails } = require('../utils/problemDetails');

exports.getAll = async (req, res) => {
    try {
        const categoriesAll = await categories.find({});
        res.status(StatusCodes.OK).json(categoriesAll);
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

exports.create = async (req, res) => {
    try {
        if (!req.body || !req.body.name) {
            return sendProblemDetails(res, {
                type: '/problems/validation-error',
                title: 'Błąd walidacji danych',
                status: StatusCodes.BAD_REQUEST,
                detail: 'Pole name jest wymagane.',
                extras: { invalid_params: [{ name: 'name', reason: 'required' }] },
                instance: req.originalUrl
            });
        }

        const newCategory = new categories({
            name: req.body.name
        });
        const createdCategory = await newCategory.save();
        res.status(StatusCodes.CREATED).json(createdCategory);
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
