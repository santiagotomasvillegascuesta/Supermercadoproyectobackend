let productos = [];
let categorias = [];
let carrito = [];
let usuario = null;
let categoriaSeleccionada = 'todos';

async function cargarCategorias() {
    try {
        const response = await fetch('/api/categorias');
        categorias = await response.json();
        mostrarFiltrosCategorias();
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

function mostrarFiltrosCategorias() {
    const filtrosDiv = document.getElementById('filtrosCategorias');
    
    categorias.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filtro-btn';
        btn.textContent = cat.nombre;
        btn.dataset.categoria = cat.id;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            categoriaSeleccionada = cat.id;
            cargarProductos();
        });
        filtrosDiv.appendChild(btn);
    });
}

async function cargarProductos() {
    try {
        let url = '/api/productos';
        if (categoriaSeleccionada !== 'todos') {
            url += `?categoria=${categoriaSeleccionada}`;
        }
        const response = await fetch(url);
        productos = await response.json();
        mostrarProductos();
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function mostrarProductos() {
    const grid = document.getElementById('productosGrid');
    grid.innerHTML = '';
    
    if (productos.length === 0) {
        grid.innerHTML = '<p>No hay productos en esta categoría</p>';
        return;
    }
    
    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        
        const sinStock = producto.stock === 0;
        const imagenUrl = producto.imagen_url || 'https://via.placeholder.com/280x200?text=Sin+Imagen';
        
        card.innerHTML = `
            <img src="${imagenUrl}" alt="${producto.nombre}" class="producto-imagen" onerror="this.src='https://via.placeholder.com/280x200?text=Sin+Imagen'">
            <div class="producto-info">
                <div class="producto-nombre">${producto.nombre}</div>
                <span class="producto-categoria">${producto.categorias ? producto.categorias.nombre : ''}</span>
                <div class="producto-precio">$${parseFloat(producto.precio).toLocaleString('es-AR')}</div>
                <div class="producto-stock ${sinStock ? 'sin-stock' : ''}">
                    ${sinStock ? 'Sin stock' : `Stock disponible: ${producto.stock}`}
                </div>
                <button class="btn btn-agregar" 
                    onclick="agregarAlCarrito(${producto.id})" 
                    ${sinStock ? 'disabled' : ''}>
                    ${sinStock ? 'Sin Stock' : 'Agregar al Carrito'}
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto || producto.stock === 0) return;
    
    const itemExistente = carrito.find(item => item.producto_id === productoId);
    
    if (itemExistente) {
        if (itemExistente.cantidad < producto.stock) {
            itemExistente.cantidad++;
        } else {
            alert('No hay más stock disponible');
            return;
        }
    } else {
        carrito.push({
            producto_id: productoId,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
            stock: producto.stock
        });
    }
    
    actualizarCarrito();
}

function actualizarCarrito() {
    const count = document.getElementById('carritoCount');
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    count.textContent = carrito.reduce((sum, item) => sum + item.cantidad, 0);
}

function mostrarCarrito() {
    const modal = document.getElementById('modalCarrito');
    const body = document.getElementById('carritoBody');
    const totalSpan = document.getElementById('carritoTotal');
    
    body.innerHTML = '';
    
    if (carrito.length === 0) {
        body.innerHTML = '<p>El carrito está vacío</p>';
        totalSpan.textContent = '0';
        modal.classList.add('active');
        return;
    }
    
    let total = 0;
    carrito.forEach((item, index) => {
        total += item.precio * item.cantidad;
        const div = document.createElement('div');
        div.className = 'carrito-item';
        div.innerHTML = `
            <div class="carrito-item-info">
                <div class="carrito-item-nombre">${item.nombre}</div>
                <div class="carrito-item-precio">$${parseFloat(item.precio).toLocaleString('es-AR')} c/u</div>
            </div>
            <div class="carrito-item-cantidad">
                <button class="btn-cantidad" onclick="cambiarCantidad(${index}, -1)">-</button>
                <span>${item.cantidad}</span>
                <button class="btn-cantidad" onclick="cambiarCantidad(${index}, 1)">+</button>
                <button class="btn" style="margin-left: 10px; background-color: #f44336;" onclick="eliminarDelCarrito(${index})">Eliminar</button>
            </div>
        `;
        body.appendChild(div);
    });
    
    totalSpan.textContent = total.toLocaleString('es-AR');
    modal.classList.add('active');
}

function cambiarCantidad(index, cambio) {
    const item = carrito[index];
    const producto = productos.find(p => p.id === item.producto_id);
    
    const nuevaCantidad = item.cantidad + cambio;
    
    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(index);
        return;
    }
    
    if (nuevaCantidad > producto.stock) {
        alert('No hay más stock disponible');
        return;
    }
    
    item.cantidad = nuevaCantidad;
    mostrarCarrito();
    actualizarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    mostrarCarrito();
    actualizarCarrito();
}

async function realizarCompra() {
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    if (!usuario) {
        alert('Debes iniciar sesión para realizar la compra');
        document.getElementById('modalCarrito').classList.remove('active');
        document.getElementById('modalLogin').classList.add('active');
        return;
    }
    
    try {
        const items = carrito.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad
        }));
        
        const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: usuario.id,
                items: items
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('¡Compra realizada exitosamente!');
            carrito = [];
            actualizarCarrito();
            document.getElementById('modalCarrito').classList.remove('active');
            cargarProductos();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error al realizar compra:', error);
        alert('Error al procesar la compra');
    }
}

document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('registroNombre').value;
    const email = document.getElementById('registroEmail').value;
    const password = document.getElementById('registroPassword').value;
    
    try {
        const response = await fetch('/api/auth/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            document.getElementById('modalRegistro').classList.remove('active');
            document.getElementById('formRegistro').reset();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error en registro:', error);
        alert('Error al registrarse');
    }
});

document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            usuario = data.data.user;
            alert('¡Bienvenido!');
            document.getElementById('modalLogin').classList.remove('active');
            document.getElementById('formLogin').reset();
            document.getElementById('btnLogin').style.display = 'none';
            document.getElementById('btnRegistro').style.display = 'none';
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error en login:', error);
        alert('Error al iniciar sesión');
    }
});

document.getElementById('btnCarrito').addEventListener('click', mostrarCarrito);
document.getElementById('closeCarrito').addEventListener('click', () => {
    document.getElementById('modalCarrito').classList.remove('active');
});
document.getElementById('btnComprar').addEventListener('click', realizarCompra);

document.getElementById('btnLogin').addEventListener('click', () => {
    document.getElementById('modalLogin').classList.add('active');
});
document.getElementById('closeLogin').addEventListener('click', () => {
    document.getElementById('modalLogin').classList.remove('active');
});

document.getElementById('btnRegistro').addEventListener('click', () => {
    document.getElementById('modalRegistro').classList.add('active');
});
document.getElementById('closeRegistro').addEventListener('click', () => {
    document.getElementById('modalRegistro').classList.remove('active');
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

document.querySelector('.filtro-btn[data-categoria="todos"]').addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filtro-btn[data-categoria="todos"]').classList.add('active');
    categoriaSeleccionada = 'todos';
    cargarProductos();
});

document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    cargarProductos();
    actualizarCarrito();
});
