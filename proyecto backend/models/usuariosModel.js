const supabase = require('../config/supabase');

class UsuariosModel {
  static async registrar(email, password, nombre) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    if (data.user) {
      const { error: perfilError } = await supabase
        .from('perfiles')
        .insert({
          id: data.user.id,
          nombre: nombre,
          rol: 'cliente'
        });

      if (perfilError) throw perfilError;
    }

    return data;
  }

  static async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  static async validarToken(token) {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) throw error;
    return data.user;
  }
}

module.exports = UsuariosModel;
