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
    if (req.body.price <= 0) res.status(StatusCodes.BAD_REQUEST).json({ message: "Price must be greater than 0" });
    if (req.body.weight <= 0) res.status(StatusCodes.BAD_REQUEST).json({ message: "Weight must be greater than 0" });
    if (req.body.name == "") res.status(StatusCodes.BAD_REQUEST).json({ message: "Name cannot be empty" });
    if (req.body.description == "") res.status(StatusCodes.BAD_REQUEST).json({ message: "Description cannot be empty" });
    try {
        const addedProduct = await newProduct.save();
        res.status(StatusCodes.CREATED).json(addedProduct);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
}

exports.put = async (req, res) => {

    const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({message: `Produkt o ID ${req.params.id} nie istnieje`
            });
        }if (res.product.i)

    if (req.body.name != null && req.body.name != "") product.name = req.body.name;
    if (req.body.description != null && req.body.description != "") product.description = req.body.description;
    if (req.body.price != null && price > 0) product.price = req.body.price;
    if (req.body.weight != null &&  weight > 0) product.weight = req.body.weight;
    if (req.body.category != null ) product.category = req.body.category;

    try {
        const updatedProduct = await product.save();
        res.status(StatusCodes.OK).json(updatedProduct);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 'message': err.message });
    }
}
