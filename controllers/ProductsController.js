
const Product = require("../models/products");
const { StatusCodes } = require('http-status-codes');
const axios = require('axios');
const { parse } = require('csv-parse/sync');
const { sendProblemDetails } = require('../utils/problemDetails');

exports.getAll = async (req, res) => {
    try {
        const productsAll = await Product.find({});
        res.json(productsAll);
    } catch (err) {
        sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return sendProblemDetails(res, {
                type: '/problems/product-not-found',
                title: 'Produkt nie znaleziony',
                status: StatusCodes.NOT_FOUND,
                detail: `Produkt o ID ${req.params.id} nie został znaleziony.`,
                instance: req.originalUrl
            });
        }
        res.status(StatusCodes.OK).json(product);
    } catch (err) {
        return sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
};

exports.create = async (req, res) => {
    // walidacja wejścia - użyj Problem Details dla błędów 400
    if (req.body.price == null || req.body.price <= 0) {
        return sendProblemDetails(res, {
            type: '/problems/validation-error',
            title: 'Błąd walidacji danych',
            status: StatusCodes.BAD_REQUEST,
            detail: 'Price must be greater than 0',
            extras: { invalid_params: [{ name: 'price', reason: 'must be > 0' }] },
            instance: req.originalUrl
        });
    }
    if (req.body.weight == null || req.body.weight <= 0) {
        return sendProblemDetails(res, {
            type: '/problems/validation-error',
            title: 'Błąd walidacji danych',
            status: StatusCodes.BAD_REQUEST,
            detail: 'Weight must be greater than 0',
            extras: { invalid_params: [{ name: 'weight', reason: 'must be > 0' }] },
            instance: req.originalUrl
        });
    }
    if (req.body.name == null || req.body.name === "") {
        return sendProblemDetails(res, {
            type: '/problems/validation-error',
            title: 'Błąd walidacji danych',
            status: StatusCodes.BAD_REQUEST,
            detail: 'Name cannot be empty',
            extras: { invalid_params: [{ name: 'name', reason: 'cannot be empty' }] },
            instance: req.originalUrl
        });
    }
    if (req.body.description == null || req.body.description === "") {
        return sendProblemDetails(res, {
            type: '/problems/validation-error',
            title: 'Błąd walidacji danych',
            status: StatusCodes.BAD_REQUEST,
            detail: 'Description cannot be empty',
            extras: { invalid_params: [{ name: 'description', reason: 'cannot be empty' }] },
            instance: req.originalUrl
        });
    }

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
        sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
};

exports.put = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return sendProblemDetails(res, {
                type: '/problems/product-not-found',
                title: 'Produkt nie istnieje',
                status: StatusCodes.NOT_FOUND,
                detail: `Produkt o ID ${req.params.id} nie istnieje`,
                instance: req.originalUrl
            });
        }

        if (req.body.name != null && req.body.name !== "") product.name = req.body.name;
        if (req.body.description != null && req.body.description !== "") product.description = req.body.description;
        if (req.body.price != null && req.body.price > 0) product.price = req.body.price;
        if (req.body.weight != null && req.body.weight > 0) product.weight = req.body.weight;
        if (req.body.category != null) product.category = req.body.category;

        const updatedProduct = await product.save();
        res.status(StatusCodes.OK).json(updatedProduct);
    } catch (err) {
        sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
};

exports.getSeoDescription = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return sendProblemDetails(res, {
                type: '/problems/product-not-found',
                title: 'Produkt nie znaleziony',
                status: StatusCodes.NOT_FOUND,
                detail: `Produkt o ID ${req.params.id} nie został znaleziony`,
                instance: req.originalUrl
            });
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

        const aiResp = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }]
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        const data = aiResp.data.choices[0].message.content;
        res.status(StatusCodes.OK).json({
            productId: product._id,
            seoDescription: data
        });
    } catch (err) {
        console.error("Błąd:", err.response ? err.response.data : err.message);
        sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd generowania opisu SEO',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.response ? JSON.stringify(err.response.data) : err.message,
            instance: req.originalUrl
        });
    }
};

exports.initProducts = async (req, res) => {
    try {
        const existingCount = await Product.countDocuments();
        if (existingCount > 0) {
            return sendProblemDetails(res, {
                type: '/problems/already-initialized',
                title: 'Baza produktów już zainicjalizowana',
                status: StatusCodes.CONFLICT,
                detail: 'Baza produktów została już zainicjalizowana.',
                instance: req.originalUrl
            });
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
            return sendProblemDetails(res, {
                type: '/problems/unsupported-media-type',
                title: 'Nieobsługiwany format danych',
                status: StatusCodes.BAD_REQUEST,
                detail: 'Obsługiwane formaty: application/json, text/csv',
                instance: req.originalUrl
            });
        }

        await Product.insertMany(productsData);
        return res.status(StatusCodes.OK).json({ message: 'Inicjalizacja produktów zakończona sukcesem.' });
    } catch (err) {
        return sendProblemDetails(res, {
            type: '/problems/internal-server-error',
            title: 'Błąd serwera',
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            detail: err.message,
            instance: req.originalUrl
        });
    }
};
