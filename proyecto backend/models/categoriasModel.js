const supabase = require('../config/supabase');

class CategoriasModel {
  static async getAll() {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data;
  }
}

module.exports = CategoriasModel;
