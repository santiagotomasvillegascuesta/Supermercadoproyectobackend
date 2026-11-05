const UsuariosModel = require('../models/usuariosModel');

class AuthController {
  static async registro(req, res) {
    try {
      const { email, password, nombre } = req.body;
      
      if (!email || !password || !nombre) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }
      
      const data = await UsuariosModel.registrar(email, password, nombre);
      res.status(201).json({ message: 'Usuario registrado exitosamente', data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }
      
      const data = await UsuariosModel.login(email, password);
      res.status(200).json({ message: 'Login exitoso', data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
