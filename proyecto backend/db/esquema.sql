-- ESQUEMA DE BASE DE DATOS PARA SUPERMERCADO ONLINE
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Tabla de categorías
CREATE TABLE categorias (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL
);

-- 2. Tabla de productos
CREATE TABLE productos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  imagen_url TEXT,
  categoria_id BIGINT REFERENCES categorias(id),
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. Tabla de perfiles
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nombre TEXT,
  rol TEXT DEFAULT 'cliente'
);

-- 4. Tabla de pedidos
CREATE TABLE pedidos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id),
  total NUMERIC(10,2) NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  creado TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de pedido_items
CREATE TABLE pedido_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id BIGINT REFERENCES pedidos(id),
  producto_id BIGINT REFERENCES productos(id),
  cantidad INT NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL
);

-- Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para permitir lectura pública de categorías y productos
CREATE POLICY "Permitir lectura pública de categorías" ON categorias FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de productos" ON productos FOR SELECT USING (true);

-- Políticas para perfiles
CREATE POLICY "Usuarios pueden ver su propio perfil" ON perfiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden insertar su propio perfil" ON perfiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para pedidos
CREATE POLICY "Usuarios pueden ver sus propios pedidos" ON pedidos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios pueden crear sus propios pedidos" ON pedidos FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Políticas para pedido_items
CREATE POLICY "Usuarios pueden ver items de sus pedidos" ON pedido_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = pedido_items.pedido_id AND pedidos.usuario_id = auth.uid())
);
CREATE POLICY "Usuarios pueden crear items en sus pedidos" ON pedido_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = pedido_items.pedido_id AND pedidos.usuario_id = auth.uid())
);

-- INSERT inicial de categorías
INSERT INTO categorias (nombre) VALUES 
('Carnes'),
('Gaseosas'),
('Lácteos'),
('Snacks'),
('Productos de Limpieza');

-- INSERT inicial de productos
INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, activo) VALUES 
('Tapa de Asado (1 kg)', 'Tapa de asado fresca', 8500.00, 15, 1, true),
('Milanesas de Peceto (1 kg)', 'Milanesas de peceto tiernas', 9200.00, 10, 1, true),
('Gaseosa Cola 2.25L', 'Gaseosa cola sabor original', 2800.00, 50, 2, true),
('Agua Saborizada Manzana 1.5L', 'Agua saborizada sabor manzana', 1800.00, 30, 2, true),
('Leche Entera 1L', 'Leche entera pasteurizada', 1200.00, 40, 3, true),
('Queso Cremoso (1 kg)', 'Queso cremoso semi-duro', 7500.00, 8, 3, true),
('Papas Fritas Clásicas 85g', 'Papas fritas clásicas crujientes', 1900.00, 25, 4, true),
('Maní Salado 100g', 'Maní salado tostado', 1100.00, 0, 4, true),
('Detergente Lavavajillas 750ml', 'Detergente concentrado para vajilla', 2100.00, 20, 5, true),
('Lavandina Concentrada 1L', 'Lavandina concentrada desinfectante', 1300.00, 35, 5, true);

-- Actualizar imagen_url apuntando al bucket público productos
UPDATE productos SET imagen_url = 'https://<PROYECTO_ID>.supabase.co/storage/v1/object/public/productos/' || id || '1.jpg';
