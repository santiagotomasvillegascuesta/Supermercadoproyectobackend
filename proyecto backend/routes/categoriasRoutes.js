const express = require('express');
const CategoriasController = require('../controllers/categoriasController');

const router = express.Router();

router.get('/', CategoriasController.getAll);

module.exports = router;
