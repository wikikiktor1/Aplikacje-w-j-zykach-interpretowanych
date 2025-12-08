const express = require('express')
const router =  express.Router();

const ProductsController = require('../controllers/ProductsController');
const CategoriesController = require('../controllers/CategoriesController');
const OrdersController = require('../controllers/OrdersController');
const StatusController = require('../controllers/StatusController');

const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

router.post('/login', AuthController.login);
router.post('/token', AuthController.refreshToken);
router.post('/logout', auth.authorize(), AuthController.logout);
router.post('/register', AuthController.register);

router.get('/products', ProductsController.getAll);
router.get('/products/:id', ProductsController.getById);
router.post('/products', auth.authorize('PRACOWNIK'), ProductsController.create);
router.put('/products/:id', auth.authorize('PRACOWNIK'), ProductsController.put);
router.get('/:id/seo-description', ProductsController.getSeoDescription)

router.get('/categories', CategoriesController.getAll);
router.post('/categories', auth.authorize('PRACOWNIK'), CategoriesController.create);

router.get('/orders', auth.authorize('PRACOWNIK'), OrdersController.getAll);
router.post('/orders', auth.authorize('KLIENT','PRACOWNIK'), OrdersController.create);
router.patch('/orders/:id', auth.authorize('PRACOWNIK'), OrdersController.updateStatus);
router.get('/orders/status/:id', auth.authorize('PRACOWNIK'), OrdersController.getByStatus);

router.post('/orders/:id/opinions', auth.authorize('KLIENT','PRACOWNIK'), OrdersController.addOpinion);

router.get('/status', StatusController.getAllStatuses);

router.post('/init', auth.authorize('PRACOWNIK'), ProductsController.initProducts);

module.exports = router;