const products = require("../models/products")

exports.get = async (req, res) => {
    try {
        const productsAll = await products.find()
        res.json(productsAll)
    } catch(err) {
        res.status(500).json({'message': err.mesage})
    }
}

exports.getById = async(req,res) => {
    try {
        const product = await products.findById(res.params.id)
        if (good == null) {
            return res.status(404).json({message: "Cannot find good with id " + req.params.id})   
        }
    } catch (err) {
        res.status(500).json({'message': err.mesage})
    }
    res.product = product
    next()
}

exports.post = async (req, res) => {
    const newProduct = new products({
        id: req.body._id,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        weight: req.body.weight,
        category: req.body.category
    })
    try {
        const addedProduct = await newProduct.save()
        res.status(201).json(addedProduct)
    } catch (err) {
        res.status(400).json({'message': err.message})
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
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(400).json({ 'message': err.message });
    }
}
