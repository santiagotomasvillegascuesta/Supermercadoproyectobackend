const CategoriasModel = require('../models/categoriasModel');

class CategoriasController {
  static async getAll(req, res) {
    try {
      const categorias = await CategoriasModel.getAll();
      res.status(200).json(categorias);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CategoriasController;
