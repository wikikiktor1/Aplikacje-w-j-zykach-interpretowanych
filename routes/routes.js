const express = require('express')
const router =  express.Router();

const ProductsController = require('../controllers/ProductsController');
const CategoriesController = require('../controllers/CategoriesController');
const OrdersController = require('../controllers/OrdersController');
const StatusController = require('../controllers/StatusController');

router.get('/products', ProductsController.getAll);
router.get('/products/:id', ProductsController.getById);
router.post('/products', ProductsController.create);
router.put('/products/:id', ProductsController.put);

router.get('/categories', CategoriesController.getAll);

router.get('/orders', OrdersController.getAll);
router.post('/orders', OrdersController.create);
router.patch('/orders/:id', OrdersController.updateStatus);
router.get('/orders/status/:id', OrdersController.getByStatus);

router.get('/status', StatusController.getAllStatuses);


module.exports = router;