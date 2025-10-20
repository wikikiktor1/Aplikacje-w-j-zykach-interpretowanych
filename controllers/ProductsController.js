const products = require("../models/products")
const { StatusCodes } = require('http-status-codes');

exports.getAll = async (req, res) => {
    try {
        const productsAll = await Product.find();
        res.json(productsAll);
    } catch(err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
}

exports.getById = async (req, res, next) => {
    let product;
    try {
        product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Cannot find product with id " + req.params.id });
        }
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
    res.product = product;
    next();
}

exports.create = async (req, res) => {
    const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        weight: req.body.weight,
        category: req.body.category
    });

    try {
        const addedProduct = await newProduct.save();
        res.status(StatusCodes.CREATED).json(addedProduct);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
}

exports.put = async (req, res) => {
    const product = res.good;

    if (req.body.name != null) product.name = req.body.name;
    if (req.body.description != null) product.description = req.body.description;
    if (req.body.price != null) product.price = req.body.price;
    if (req.body.weight != null) product.weight = req.body.weight;
    if (req.body.category != null) product.category = req.body.category;

    try {
        const updatedProduct = await product.save();
        res.status(StatusCodes.OK).json(updatedProduct);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 'message': err.message });
    }
}
