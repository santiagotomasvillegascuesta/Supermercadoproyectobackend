const supabase = require('../config/supabase');

class ProductosModel {
  static async getAll(categoriaId = null) {
    let query = supabase
      .from('productos')
      .select('*, categorias(nombre)')
      .eq('activo', true)
      .order('id', { ascending: true });
    
    if (categoriaId) {
      query = query.eq('categoria_id', categoriaId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias(nombre)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateStock(id, cantidad) {
    const producto = await this.getById(id);
    const nuevoStock = producto.stock - cantidad;
    
    if (nuevoStock < 0) {
      throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);
    }
    
    const { data, error } = await supabase
      .from('productos')
      .update({ stock: nuevoStock })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = ProductosModel;
