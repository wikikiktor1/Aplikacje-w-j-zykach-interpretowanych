const express = require('express')
const router =  express.Router();

const ProductsController = require('../controllers/ProductsController');
const CategoriesController = require('../controllers/CategoriesController');
const OrdersController = require('../controllers/OrdersController');
const StatusController = require('../controllers/StatusController');

// Dodaj auth middleware/ kontroler
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

// Auth endpoints
router.post('/login', AuthController.login);
router.post('/token', AuthController.refreshToken);
router.post('/logout', auth.authorize(), AuthController.logout); // authorize() sprawdza token, bez ograniczenia roli

// Produkty
router.get('/products', ProductsController.getAll);
router.get('/products/:id', ProductsController.getById);
// tworzenie/edycja produktów - tylko PRACOWNIK
router.post('/products', auth.authorize('PRACOWNIK'), ProductsController.create);
router.put('/products/:id', auth.authorize('PRACOWNIK'), ProductsController.put);
router.get('/:id/seo-description', ProductsController.getSeoDescription)

// Kategorie (publiczne)
router.get('/categories', CategoriesController.getAll);

// Zamówienia
// listowanie zamówień - tylko PRACOWNIK
router.get('/orders', auth.authorize('PRACOWNIK'), OrdersController.getAll);
// tworzenie zamówienia - KLIENT lub PRACOWNIK
router.post('/orders', auth.authorize('KLIENT','PRACOWNIK'), OrdersController.create);
// aktualizacja statusu - tylko PRACOWNIK
router.patch('/orders/:id', auth.authorize('PRACOWNIK'), OrdersController.updateStatus);
router.get('/orders/status/:id', auth.authorize('PRACOWNIK'), OrdersController.getByStatus);

// Dodawanie opinii do zamówienia (tylko właściciel zamówienia)
router.post('/orders/:id/opinions', auth.authorize('KLIENT','PRACOWNIK'), OrdersController.addOpinion);

router.get('/status', StatusController.getAllStatuses);

// Inicjalizacja bazy produktów (tylko PRACOWNIK)
router.post('/init', auth.authorize('PRACOWNIK'), ProductsController.initProducts);


module.exports = router;