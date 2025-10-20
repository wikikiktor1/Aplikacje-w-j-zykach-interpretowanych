const categories = require("../models/categories");
const { StatusCodes } = require('http-status-codes');

exports.getAll = async (req, res) => {
    try {
        const categoriesAll = await categories.find();
        res.status(StatusCodes.OK).json(categoriesAll);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
}
