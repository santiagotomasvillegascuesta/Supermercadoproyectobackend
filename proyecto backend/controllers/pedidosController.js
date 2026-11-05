const PedidosModel = require('../models/pedidosModel');

class PedidosController {
  static async create(req, res) {
    try {
      const { usuario_id, items } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'El carrito está vacío' });
      }
      
      const pedido = await PedidosModel.create(usuario_id, items);
      res.status(201).json({ message: 'Pedido creado exitosamente', pedido });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = PedidosController;
