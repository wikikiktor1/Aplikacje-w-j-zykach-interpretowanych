const Product = require("../models/products")
const { StatusCodes } = require('http-status-codes');
const axios = require('axios')
const { parse } = require('csv-parse/sync');

exports.getAll = async (req, res) => {
    try {
        const productsAll = await Product.find({});
        res.json(productsAll);
    } catch(err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
}

exports.getById = async (req, res) => {
    let product;
    try {
        product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Cannot find product with id " + req.params.id });
        }
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
    res.status(StatusCodes.OK).json(product);
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
    if (req.body.name === "") res.status(StatusCodes.BAD_REQUEST).json({ message: "Name cannot be empty" });
    if (req.body.description === "") res.status(StatusCodes.BAD_REQUEST).json({ message: "Description cannot be empty" });
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

    if (req.body.name != null && req.body.name !== "") product.name = req.body.name;
    if (req.body.description != null && req.body.description !== "") product.description = req.body.description;
    if (req.body.price != null && req.body.price > 0) product.price = req.body.price;
    if (req.body.weight != null &&  req.body.weight > 0) product.weight = req.body.weight;
    if (req.body.category != null ) product.category = req.body.category;

    try {
        const updatedProduct = await product.save();
        res.status(StatusCodes.OK).json(updatedProduct);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 'message': err.message });
    }
}

exports.getSeoDescription = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({message: `Produkt o ID ${req.params.id} nie został znaleziony`});
        }
        const prompt = `
            Jesteś ekspertem SEO i copywriterem e-commerce. 
            Stwórz atrakcyjny opis produktu w formacie HTML (użyj tagów takich jak <h2>, <p>, <ul>, <li>, <strong>) dla produktu o nazwie "${product.name}".
            
            Dane produktu:
            - Kategoria: ${product.category ? product.category.name : 'Ogólna'}
            - Cena: ${product.price} PLN
            - Waga: ${product.weight}
            - Krótki opis techniczny: ${product.description}
            
            Wymagania:
            - Opis ma być zachęcający do zakupu.
            - Tekst musi być sformatowany w czystym HTML (bez znaczników html na początku).
            - Podkreśl zalety produktu.
            `;

        const aiResp = await axios.post("https://api.groq.com/openai/v1/chat/completions",{
            model: "openai/gpt-oss-120b",
            messages: [
                {
                role: "user",
                content: prompt
            }
            ]}, {
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        const data = await aiResp.data.choices[0].message.content;
        res.status(StatusCodes.OK).json({
            productId: product._id,
            seoDescription: data
        });

        } catch (err) {
        console.log("Mój klucz to:", process.env.GROQ_API_KEY);
        console.error("Błąd:", err.response ? err.response.data : err.message);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Wystąpił błąd podczas generowania opisu",
            error: err.response ? err.response.data : err.message
        });
    }
}

exports.initProducts = async (req, res) => {
    try {
        const existingCount = await Product.countDocuments();
        if (existingCount > 0) {
            return res.status(409).json({ message: 'Baza produktów została już zainicjalizowana.' });
        }

        let productsData = [];
        if (req.is('application/json')) {
            productsData = Array.isArray(req.body) ? req.body : [req.body];
        } else if (req.is('text/csv')) {
            productsData = parse(req.body, {
                columns: true,
                skip_empty_lines: true
            });
        } else {
            return res.status(400).json({ message: 'Obsługiwane formaty: application/json, text/csv' });
        }

        await Product.insertMany(productsData);
        return res.status(200).json({ message: 'Inicjalizacja produktów zakończona sukcesem.' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
