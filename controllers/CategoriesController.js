const categories = require("../models/categories")

exports.getAll = async (req, res) => {
    try {
        const categoriesAll = await categories.find()
        res.json(categoriesAll)
    } catch(err) {
        res.status(500).json({'message': err.mesage})
    }
}