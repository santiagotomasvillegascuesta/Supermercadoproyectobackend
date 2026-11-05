const ProductosModel = require('../models/productosModel');

class ProductosController {
  static async getAll(req, res) {
    try {
      const { categoria } = req.query;
      const productos = await ProductosModel.getAll(categoria || null);
      res.status(200).json(productos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const producto = await ProductosModel.getById(id);
      res.status(200).json(producto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProductosController;
