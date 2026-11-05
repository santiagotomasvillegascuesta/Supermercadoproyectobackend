const express = require('express');
const PedidosController = require('../controllers/pedidosController');

const router = express.Router();

router.post('/', PedidosController.create);

module.exports = router;
