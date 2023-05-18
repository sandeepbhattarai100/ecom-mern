const express = require('express');
const { createProduct, getAllProducts, getProduct, updateProduct, deleteProduct } = require('../controller/productController');
const router = express.Router();
const { isAdmin,authMiddleware } = require('../middlewares/authMiddleware');

router.post('/create-product',authMiddleware,isAdmin, createProduct);
router.get('/get-products', getAllProducts);
router.get('/:id', getProduct);//for single products
router.put('/:id',authMiddleware,isAdmin, updateProduct);//for single products
router.delete('/:id',authMiddleware,isAdmin, deleteProduct);

module.exports = router;