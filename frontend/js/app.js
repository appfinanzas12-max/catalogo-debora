// DEBORA v2 - Aplicación Principal (SPA - Una sola página)

// ============================================
// COMPONENTES (Templates)
// ============================================

// 1. COMPONENTE LOGIN
function LoginComponent(params = {}) {
  return `
    <div style="min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px;">
      <div class="login-container">
        <div class="login-header">
          <div class="brand-logo">DEBORA</div>
          <div class="brand-subtitle">Sistema de Gestión</div>
        </div>

        <div id="error-message" class="error-message"></div>
        <div id="success-message" class="success-message"></div>

        <form id="auth-form">
          <div id="name-field" class="form-group" style="display: none;">
            <label for="name">Nombre Completo</label>
            <input type="text" id="name" placeholder="Tu nombre" autocomplete="name" />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="tu@email.com" autocomplete="email" required />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" placeholder="••••••••" autocomplete="current-password" required />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-primary" id="submit-btn">Iniciar Sesión</button>
          </div>

          <div class="toggle-link" id="toggle-link">
            ¿No tienes cuenta? <a onclick="app.toggleLoginMode()">Regístrate</a>
          </div>
        </form>
      </div>
    </div>
  `;
}

// 2. COMPONENTE TOPBAR (Barra superior)
function TopbarComponent(user) {
  return `
    <header class="topbar">
      <div class="brand">DEBORA</div>
      <div class="topbar-actions">
        <span class="user-info">${user.name}</span>
        <div class="nav-buttons">
          ${user.role === 'ADMIN' ? `
            <button class="nav-btn" onclick="app.navigate('dashboard')">Dashboard</button>
            <button class="nav-btn" onclick="app.navigate('productos')">Productos</button>
            <button class="nav-btn" onclick="app.navigate('vendedores')">Vendedores</button>
          ` : `
            <button class="nav-btn" onclick="app.navigate('misventas')">Mis Ventas</button>
            <button class="nav-btn" onclick="app.navigate('catalogo-vendedor')">Catálogo</button>
          `}
          <button class="btn-logout" onclick="app.logout()">Salir</button>
        </div>
      </div>
    </header>
  `;
}

// 3. COMPONENTE DASHBOARD (Admin)
function DashboardComponent(params = {}) {
  return `
    ${TopbarComponent(router.getUser())}
    <main class="main-content">
      <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1>Dashboard</h1>
            <p>Resumen general del sistema</p>
          </div>
          <button class="btn-primary" onclick="app.descargarPDF('catalogo')">📥 Descargar Catálogo PDF</button>
        </div>
        
        <div class="grid-4">
          <div class="card">
            <div class="card-label">Productos</div>
            <div class="card-value" id="total-productos">0</div>
          </div>
          <div class="card">
            <div class="card-label">Stock Total</div>
            <div class="card-value" id="total-stock">0</div>
          </div>
          <div class="card">
            <div class="card-label">Vendedores</div>
            <div class="card-value" id="total-vendedores">0</div>
          </div>
          <div class="card">
            <div class="card-label">Total Vendido</div>
            <div class="card-value" id="total-ventas">$0</div>
          </div>
        </div>
      </div>
    </main>
  `;
}

// 4. COMPONENTE MIS VENTAS (Vendedor)
function MisVentasComponent(params = {}) {
  const user = router.getUser();
  return `
    ${TopbarComponent(user)}
    <main class="main-content">
      <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1>Mis Ventas</h1>
          <button class="btn-primary" onclick="app.descargarPDF('inventario')">📥 Descargar PDF</button>
        </div>
        <button class="btn-primary" onclick="app.navigate('registrar-venta')">+ Registrar Venta</button>
        
        <div class="table-container" style="margin-top: 20px;">
          <table class="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody id="ventas-list">
              <tr><td colspan="5" style="text-align: center; padding: 20px; color: #b8acba;">Cargando...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  `;
}

// 5. COMPONENTE CATÁLOGO PÚBLICO (SPA)
function CatalogoComponent(params = {}) {
  const user = router.getUser();
  const showTopbar = user ? true : false;

  return `
    ${showTopbar ? TopbarComponent(user) : ''}
    <main class="${showTopbar ? 'main-content' : ''}">
      <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1>Catálogo de Productos</h1>
          <button class="btn-primary" onclick="app.descargarPDF('catalogo')">📥 Descargar PDF</button>
        </div>
        <input 
          type="text" 
          class="search" 
          id="search-box"
          placeholder="Buscar producto..."
          onkeyup="app.searchProductos(event)"
        />
        
        <div id="categorias-grid" class="grid-2" style="margin-top: 20px;">
          <p style="color: #b8acba; grid-column: 1/-1;">Cargando categorías...</p>
        </div>

        <div id="productos-grid" class="products" style="margin-top: 30px;">
          <p style="color: #b8acba; grid-column: 1/-1;">Cargando productos...</p>
        </div>
      </div>
    </main>
  `;
}

// 6. COMPONENTE PRODUCTOS (Admin)
function ProductosComponent(params = {}) {
  return `
    ${TopbarComponent(router.getUser())}
    <main class="main-content">
      <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1>Productos</h1>
          <button class="btn-primary" onclick="app.openModal('crearProducto')">+ Nuevo Producto</button>
        </div>
        
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="productos-list">
              <tr><td colspan="7" style="text-align: center; padding: 20px;">Cargando...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div id="modal" class="modal">
      <div class="modal-content">
        <button class="modal-close" onclick="app.closeModal()">×</button>
        <div id="modal-body"></div>
      </div>
    </div>
  `;
}

// 7. COMPONENTE VENDEDORES (Admin)
function VendedoresComponent(params = {}) {
  return `
    ${TopbarComponent(router.getUser())}
    <main class="main-content">
      <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1>Vendedores</h1>
          <button class="btn-primary" onclick="app.openModal('crearVendedor')">+ Nuevo Vendedor</button>
        </div>
        
        <div id="vendedores-list" class="grid-2">
          <p style="color: #b8acba; grid-column: 1/-1;">Cargando...</p>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div id="modal" class="modal">
      <div class="modal-content">
        <button class="modal-close" onclick="app.closeModal()">×</button>
        <div id="modal-body"></div>
      </div>
    </div>
  `;
}

// ============================================
// CLASE PRINCIPAL DE LA APP
// ============================================

class DeboraApp {
  constructor() {
    this.currentMode = 'login'; // login o register
    this.currentUser = null;
    this.isInitialized = false;
  }

  // Inicializar app
  async init() {
    try {
      await initializeFirebase();
      
      // Registrar rutas
      router.register('login', LoginComponent);
      router.register('dashboard', DashboardComponent);
      router.register('productos', ProductosComponent);
      router.register('vendedores', VendedoresComponent);
      router.register('misventas', MisVentasComponent);
      router.register('catalogo', CatalogoComponent);
      
      // Verificar si hay sesión activa
      const user = JSON.parse(localStorage.getItem('debora_user') || 'null');
      
      if (user) {
        this.currentUser = user;
        router.setUser(user);
        
        // Redirigir según rol
        if (user.role === 'ADMIN') {
          this.navigate('dashboard');
        } else if (user.role === 'VENDEDOR') {
          this.navigate('misventas');
        }
      } else {
        // Mostrar login
        this.navigate('login');
      }

      this.isInitialized = true;
      console.log('✅ DEBORA App inicializada');
    } catch (error) {
      console.error('Error al inicializar:', error);
    }
  }

  // Navegación
  navigate(path) {
    if (!this.currentUser && path !== 'login' && path !== 'catalogo') {
      this.navigate('login');
      return;
    }

    router.navigate(path);
    this.setupEventListeners();
  }

  // Cambiar modo (login/registro)
  toggleLoginMode() {
    this.currentMode = this.currentMode === 'login' ? 'register' : 'login';
    
    const nameField = document.getElementById('name-field');
    const submitBtn = document.getElementById('submit-btn');
    const toggleLink = document.getElementById('toggle-link');

    if (this.currentMode === 'register') {
      nameField.style.display = 'block';
      submitBtn.textContent = 'Crear Cuenta';
      toggleLink.innerHTML = '¿Ya tienes cuenta? <a onclick="app.toggleLoginMode()">Inicia sesión</a>';
    } else {
      nameField.style.display = 'none';
      submitBtn.textContent = 'Iniciar Sesión';
      toggleLink.innerHTML = '¿No tienes cuenta? <a onclick="app.toggleLoginMode()">Regístrate</a>';
    }
  }

  // Login
  async login(email, password) {
    try {
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;

      const result = await callFunction('auth-login', { email, password });

      if (result.success) {
        this.currentUser = result.user;
        router.setUser(result.user);
        
        localStorage.setItem('debora_token', result.token);
        localStorage.setItem('debora_user', JSON.stringify(result.user));

        this.showSuccess('¡Bienvenido!');
        
        setTimeout(() => {
          if (result.user.role === 'ADMIN') {
            this.navigate('dashboard');
          } else {
            this.navigate('misventas');
          }
        }, 1000);
      }
    } catch (error) {
      this.showError(error.message || 'Error en login');
    } finally {
      document.getElementById('submit-btn').disabled = false;
    }
  }

  // Registro
  async register(email, password, name) {
    try {
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;

      const result = await callFunction('auth-register', {
        email,
        password,
        name,
        role: 'VENDEDOR',
      });

      if (result.success) {
        this.showSuccess('¡Cuenta creada! Inicia sesión');
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.getElementById('name').value = '';
        
        this.currentMode = 'register';
        this.toggleLoginMode();
      }
    } catch (error) {
      this.showError(error.message || 'Error en registro');
    } finally {
      document.getElementById('submit-btn').disabled = false;
    }
  }

  // Logout
  logout() {
    if (confirm('¿Estás seguro de que quieres salir?')) {
      localStorage.removeItem('debora_token');
      localStorage.removeItem('debora_user');
      this.currentUser = null;
      this.navigate('login');
    }
  }

  // Mensajes
  showError(message) {
    const errorMsg = document.getElementById('error-message');
    if (errorMsg) {
      errorMsg.textContent = message;
      errorMsg.classList.add('show');
      setTimeout(() => errorMsg.classList.remove('show'), 5000);
    }
  }

  showSuccess(message) {
    const successMsg = document.getElementById('success-message');
    if (successMsg) {
      successMsg.textContent = message;
      successMsg.classList.add('show');
      setTimeout(() => successMsg.classList.remove('show'), 3000);
    }
  }

  // Cargar dashboard
  async loadDashboard() {
    try {
      const result = await callFunction('admin-getDashboard', {});
      if (result.success) {
        document.getElementById('total-productos').textContent = result.data.totalProductos;
        document.getElementById('total-stock').textContent = result.data.totalStock;
        document.getElementById('total-vendedores').textContent = result.data.totalVendedores;
        document.getElementById('total-ventas').textContent = `$${result.data.totalVentas.toLocaleString('es-CO')}`;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Búsqueda de productos
  async searchProductos(evento) {
    const query = evento.target.value.toLowerCase();
    
    try {
      const result = await callFunction('productos-getProductos', {});
      
      if (result.success) {
        const filtrados = query === '' 
          ? result.data 
          : result.data.filter(p => 
              p.name.toLowerCase().includes(query) ||
              p.code.toLowerCase().includes(query)
            );

        this.renderProductos(filtrados);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  renderProductos(productos) {
    const grid = document.getElementById('productos-grid');
    
    if (productos.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #b8acba;">No hay productos</p>';
      return;
    }

    grid.innerHTML = productos.map(p => `
      <div class="product">
        <div class="product-media">📦</div>
        <div class="product-body">
          <h3>${p.name}</h3>
          <p style="color: #b8acba; font-size: 12px;">${p.category}</p>
          <p style="color: #f51b91; font-weight: 700; margin: 10px 0;">$${p.price.toLocaleString('es-CO')}</p>
          <button class="wa" ${p.stock === 0 ? 'disabled' : ''} onclick="app.contactarWhatsApp('${p.name}', ${p.price})">
            ${p.stock > 0 ? 'CONSULTAR' : 'AGOTADO'}
          </button>
        </div>
      </div>
    `).join('');
  }

  contactarWhatsApp(nombre, precio) {
    const whatsapp = '573224079955';
    const mensaje = encodeURIComponent(`Hola! Me interesa: ${nombre} - $${precio.toLocaleString('es-CO')}`);
    window.open(`https://wa.me/${whatsapp}?text=${mensaje}`, '_blank');
  }

  // Setup event listeners
  setupEventListeners() {
    const route = router.getCurrentRoute();

    if (route === 'login') {
      const submitBtn = document.getElementById('submit-btn');
      const passwordInput = document.getElementById('password');

      if (submitBtn) {
        submitBtn.onclick = (e) => {
          e.preventDefault();
          const email = document.getElementById('email').value.trim();
          const password = document.getElementById('password').value.trim();
          const name = document.getElementById('name').value.trim();

          if (!email || !email.includes('@')) {
            this.showError('Email inválido');
            return;
          }
          if (password.length < 6) {
            this.showError('Contraseña mínimo 6 caracteres');
            return;
          }

          if (this.currentMode === 'login') {
            this.login(email, password);
          } else {
            if (!name) {
              this.showError('Nombre requerido');
              return;
            }
            this.register(email, password, name);
          }
        };
      }

      if (passwordInput) {
        passwordInput.onkeypress = (e) => {
          if (e.key === 'Enter') submitBtn.click();
        };
      }
    }

    if (route === 'dashboard') {
      this.loadDashboard();
    }

    if (route === 'misventas') {
      this.loadMisVentas();
    }

    if (route === 'catalogo') {
      this.loadCatalogo();
    }

    if (route === 'productos') {
      this.loadProductos();
    }

    if (route === 'vendedores') {
      this.loadVendedores();
    }
  }

  // Cargar productos (admin)
  async loadProductos() {
    try {
      const result = await callFunction('productos-getProductos', {});
      if (result.success) {
        const tbody = document.getElementById('productos-list');
        tbody.innerHTML = result.data.map(p => {
          const imgSrc = p.imageUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22%3E%3Crect fill=%22%23333%22 width=%2250%22 height=%2250%22/%3E%3C/svg%3E';
          return `
          <tr>
            <td>
              <img src="${imgSrc}" 
                   style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; background: #1e1d20;">
            </td>
            <td>${p.code}</td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>$${p.price.toLocaleString('es-CO')}</td>
            <td>${p.stock}</td>
            <td>
              <button class="btn-secondary" onclick="app.editProducto('${p.id}')">Editar</button>
              <button class="btn-danger" onclick="app.deleteProducto('${p.id}')">Eliminar</button>
            </td>
          </tr>
          `;
        }).join('');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Cargar mis ventas (vendedor)
  async loadMisVentas() {
    try {
      const result = await callFunction('ventas-getVentasByVendedor', {
        vendedorId: this.currentUser.id,
      });

      if (result.success) {
        const tbody = document.getElementById('ventas-list');
        tbody.innerHTML = result.data.map(v => `
          <tr>
            <td>${v.productoId}</td>
            <td>${v.quantity}</td>
            <td>$${v.total.toLocaleString('es-CO')}</td>
            <td>${new Date(v.createdAt.seconds * 1000).toLocaleDateString('es-CO')}</td>
            <td>${v.status}</td>
          </tr>
        `).join('');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Cargar catálogo
  async loadCatalogo() {
    try {
      const result = await callFunction('productos-getProductos', {});
      if (result.success) {
        const categorias = [...new Set(result.data.map(p => p.category))];
        const categoriasGrid = document.getElementById('categorias-grid');
        categoriasGrid.innerHTML = categorias.map(cat => `
          <div class="card" onclick="app.filterByCategory('${cat}')">
            <h3>${cat}</h3>
            <p>${result.data.filter(p => p.category === cat).length} productos</p>
          </div>
        `).join('');

        this.renderProductos(result.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  filterByCategory(categoria) {
    // Implementar filtro por categoría
  }

  // Cargar vendedores (admin)
  async loadVendedores() {
    try {
      const result = await callFunction('vendedores-getVendedores', {});
      if (result.success) {
        const list = document.getElementById('vendedores-list');
        list.innerHTML = result.data.map(v => `
          <div class="card">
            <h3>${v.name}</h3>
            <p style="color: #b8acba;">${v.email}</p>
            <button class="btn-primary" onclick="app.deleteVendedor('${v.id}')">Eliminar</button>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  openModal(type) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');

    if (type === 'crearProducto') {
      modalBody.innerHTML = `
        <h2>Nuevo Producto</h2>
        <div class="form-group">
          <label>Código</label>
          <input type="text" id="form-code" placeholder="DE-001">
        </div>
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" id="form-name" placeholder="Nombre del producto">
        </div>
        <div class="form-group">
          <label>Categoría</label>
          <input type="text" id="form-category" placeholder="Categoría">
        </div>
        <div class="form-group">
          <label>Precio</label>
          <input type="number" id="form-price" placeholder="0">
        </div>
        <div class="form-group">
          <label>Stock</label>
          <input type="number" id="form-stock" placeholder="0">
        </div>
        <div class="form-actions">
          <button class="btn-primary" onclick="app.saveProducto()">Guardar</button>
          <button class="btn-secondary" onclick="app.closeModal()">Cancelar</button>
        </div>
      `;
    }

    modal.classList.add('active');
  }

  closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
  }

  async saveProducto() {
    try {
      const result = await callFunction('productos-createProducto', {
        code: document.getElementById('form-code').value,
        name: document.getElementById('form-name').value,
        category: document.getElementById('form-category').value,
        price: parseFloat(document.getElementById('form-price').value),
        stock: parseInt(document.getElementById('form-stock').value),
      });

      if (result.success) {
        this.showSuccess('Producto creado');
        this.closeModal();
        this.loadProductos();
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  editProducto(id) {
    console.log('Editar producto:', id);
  }

  async deleteVendedor(id) {
    if (!confirm('¿Estás seguro?')) return;

    try {
      const result = await callFunction('vendedores-deleteVendedor', {
        vendedorId: id,
      });

      if (result.success) {
        this.showSuccess('Vendedor eliminado');
        this.loadVendedores();
      }
    } catch (error) {
      this.showError(error.message);
    }
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

const app = new DeboraApp();

// Inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  await app.init();
});
