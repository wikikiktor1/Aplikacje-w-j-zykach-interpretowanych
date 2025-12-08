const categories = require("../models/categories");
const { StatusCodes } = require('http-status-codes');

exports.getAll = async (req, res) => {
    try {
        const categoriesAll = await categories.find({});
        res.status(StatusCodes.OK).json(categoriesAll);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
}

exports.create = async (req, res) => {
    try {
        const newCategory = new categories({
            name: req.body.name
        });
        const createdCategory = await newCategory.save();
        res.status(StatusCodes.CREATED).json(createdCategory);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
}
