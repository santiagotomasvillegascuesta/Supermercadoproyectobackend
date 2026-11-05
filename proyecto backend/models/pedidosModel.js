const supabase = require('../config/supabase');
const ProductosModel = require('./productosModel');

class PedidosModel {
  static async create(usuarioId, items) {
    if (!items || items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    let total = 0;
    const itemsConPrecio = [];

    for (const item of items) {
      const producto = await ProductosModel.getById(item.producto_id);
      
      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre}`);
      }
      
      const precioUnitario = producto.precio;
      total += precioUnitario * item.cantidad;
      itemsConPrecio.push({
        producto_id: producto.id,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario
      });
    }

    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        usuario_id: usuarioId,
        total: total,
        estado: 'pendiente'
      })
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    const itemsToInsert = itemsConPrecio.map(item => ({
      ...item,
      pedido_id: pedido.id
    }));

    const { error: itemsError } = await supabase
      .from('pedido_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    for (const item of items) {
      await ProductosModel.updateStock(item.producto_id, item.cantidad);
    }

    return pedido;
  }
}

module.exports = PedidosModel;
