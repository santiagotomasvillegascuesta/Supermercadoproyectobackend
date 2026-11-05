const express = require('express');
const ProductosController = require('../controllers/productosController');

const router = express.Router();

router.get('/', ProductosController.getAll);
router.get('/:id', ProductosController.getById);

module.exports = router;
