// DEBORA v2 - App Mejorada con Imágenes y PDF
// Este archivo reemplaza app.js y agrega:
// - Subida de imágenes a Cloud Storage
// - Descarga de catálogo en PDF
// - Preview de imágenes antes de subir

// Se importa en app.html DESPUÉS de app.js

// ============================================
// MÉTODOS ADICIONALES PARA LA CLASE DeboraApp
// ============================================

// Extender clase DeboraApp con nuevos métodos
Object.assign(DeboraApp.prototype, {
  // Preview de imagen
  previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      StorageUtils.validateImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('image-preview');
        if (preview) {
          preview.src = e.target.result;
          preview.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      this.showError(error.message);
    }
  },

  // Guardar producto CON IMAGEN
  async saveProducto() {
    try {
      const fileInput = document.getElementById('form-image');
      const code = document.getElementById('form-code').value;
      const name = document.getElementById('form-name').value;
      const category = document.getElementById('form-category').value;
      const description = document.getElementById('form-description')?.value || '';
      const price = parseFloat(document.getElementById('form-price').value);
      const stock = parseInt(document.getElementById('form-stock').value);

      if (!code || !name || !category || !price) {
        this.showError('Completa los campos requeridos');
        return;
      }

      let imageUrl = null;

      // Subir imagen si existe
      if (fileInput && fileInput.files[0]) {
        try {
          this.showSuccess('Subiendo imagen...');
          const uploadResult = await StorageUtils.uploadImage(fileInput.files[0]);
          imageUrl = uploadResult.url;
        } catch (error) {
          this.showError('Error al subir imagen: ' + error.message);
          return;
        }
      }

      // Crear producto con imagen
      const result = await callFunction('productos-createProducto', {
        code,
        name,
        category,
        description,
        price,
        stock,
        imageUrl, // Nueva propiedad
      });

      if (result.success) {
        this.showSuccess('Producto creado con imagen');
        this.closeModal();
        this.loadProductos();
      }
    } catch (error) {
      this.showError('Error: ' + error.message);
    }
  },

  // Guardar categoría CON IMAGEN
  async saveCategoria() {
    try {
      const fileInput = document.getElementById('form-cat-image');
      const name = document.getElementById('categoria-name').value;
      const description = document.getElementById('categoria-description')?.value || '';

      if (!name) {
        this.showError('Nombre requerido');
        return;
      }

      let imageUrl = null;

      // Subir imagen si existe
      if (fileInput && fileInput.files[0]) {
        try {
          this.showSuccess('Subiendo imagen...');
          const uploadResult = await StorageUtils.uploadImage(fileInput.files[0]);
          imageUrl = uploadResult.url;
        } catch (error) {
          this.showError('Error al subir imagen: ' + error.message);
          return;
        }
      }

      // Crear categoría con imagen
      const result = await callFunction('admin-createCategoria', {
        name,
        description,
        imageUrl, // Nueva propiedad
      });

      if (result.success) {
        this.showSuccess('Categoría creada con imagen');
        this.closeModal();
        this.loadCategorias();
      }
    } catch (error) {
      this.showError('Error: ' + error.message);
    }
  },

  // Descargar catálogo como PDF
  async descargarPDF(tipo = 'catalogo') {
    try {
      this.showSuccess('Generando PDF...');

      // Obtener todos los productos
      const result = await callFunction('productos-getProductos', {});

      if (!result.success) {
        this.showError('Error al obtener productos');
        return;
      }

      // Generar PDF
      const doc = PDFGenerator.generateCatalogoPDF(
        result.data,
        'DEBORA - Catálogo de Productos'
      );

      // Descargar
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `catalogo_debora_${fecha}.pdf`;
      PDFGenerator.downloadPDF(doc, nombreArchivo);

      this.showSuccess('PDF descargado');
    } catch (error) {
      console.error('Error:', error);
      this.showError('Error al generar PDF: ' + error.message);
    }
  },

  // Eliminar producto
  async deleteProducto(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const result = await callFunction('productos-deleteProducto', {
        productoId: id,
      });

      if (result.success) {
        this.showSuccess('Producto eliminado');
        this.loadProductos();
      }
    } catch (error) {
      this.showError('Error: ' + error.message);
    }
  },

  // Cargar categorías (para mostrar al crear producto)
  async loadCategorias() {
    try {
      const result = await callFunction('admin-getCategorias', {});
      if (result.success) {
        const list = document.getElementById('categorias-list');
        if (list) {
          list.innerHTML = result.data.map((cat) => `
            <div class="card">
              ${cat.imageUrl ? `<img src="${cat.imageUrl}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">` : ''}
              <h3>${cat.name}</h3>
              <p style="color: #b8acba; font-size: 12px;">${cat.description || 'Sin descripción'}</p>
              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button class="btn-secondary" onclick="app.editCategoria('${cat.id}')">Editar</button>
                <button class="btn-danger" onclick="app.deleteCategoria('${cat.id}')">Eliminar</button>
              </div>
            </div>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  },

  // Editar categoría
  editCategoria(id) {
    console.log('Editar categoría:', id);
    // Implementar después
  },

  // Eliminar categoría
  async deleteCategoria(id) {
    if (!confirm('¿Estás seguro?')) return;

    try {
      const result = await callFunction('admin-deleteCategoria', {
        categoriaId: id,
      });

      if (result.success) {
        this.showSuccess('Categoría eliminada');
        this.loadCategorias();
      }
    } catch (error) {
      this.showError('Error: ' + error.message);
    }
  },

  // Editar producto
  editProducto(id) {
    console.log('Editar producto:', id);
    // Implementar después
  },

  // Actualizar openModal para incluir campos de imagen
  openModal_actualizado(type) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');

    if (type === 'crearProducto') {
      modalBody.innerHTML = `
        <h2>Nuevo Producto</h2>
        <div class="form-group">
          <label>📸 Imagen del Producto</label>
          <input type="file" id="form-image" accept="image/*" onchange="app.previewImage(event)" required>
          <img id="image-preview" style="margin-top: 10px; max-width: 100%; max-height: 200px; display: none; border-radius: 8px;">
          <small style="color: #b8acba;">JPG, PNG o WEBP (máx 5MB)</small>
        </div>
        <div class="form-group">
          <label>Código</label>
          <input type="text" id="form-code" placeholder="DE-001" required>
        </div>
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" id="form-name" placeholder="Nombre del producto" required>
        </div>
        <div class="form-group">
          <label>Categoría</label>
          <input type="text" id="form-category" placeholder="Categoría" required>
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea id="form-description" placeholder="Descripción del producto" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Precio (COP)</label>
          <input type="number" id="form-price" placeholder="0" required>
        </div>
        <div class="form-group">
          <label>Stock</label>
          <input type="number" id="form-stock" placeholder="0" required>
        </div>
        <div class="form-actions">
          <button class="btn-primary" onclick="app.saveProducto()">Guardar Producto</button>
          <button class="btn-secondary" onclick="app.closeModal()">Cancelar</button>
        </div>
      `;
    }

    if (type === 'crearCategoria') {
      modalBody.innerHTML = `
        <h2>Nueva Categoría</h2>
        <div class="form-group">
          <label>📸 Imagen de la Categoría</label>
          <input type="file" id="form-cat-image" accept="image/*" onchange="app.previewImage(event)">
          <img id="image-preview" style="margin-top: 10px; max-width: 100%; max-height: 200px; display: none; border-radius: 8px;">
          <small style="color: #b8acba;">JPG, PNG o WEBP (máx 5MB)</small>
        </div>
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" id="categoria-name" placeholder="Nombre de la categoría" required>
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea id="categoria-description" placeholder="Descripción" rows="3"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-primary" onclick="app.saveCategoria()">Guardar Categoría</button>
          <button class="btn-secondary" onclick="app.closeModal()">Cancelar</button>
        </div>
      `;
    }

    if (type === 'crearVendedor') {
      modalBody.innerHTML = `
        <h2>Nuevo Vendedor</h2>
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" id="vendedor-name" placeholder="Nombre completo" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="vendedor-email" placeholder="email@ejemplo.com" required>
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" id="vendedor-password" placeholder="••••••••" required>
        </div>
        <div class="form-actions">
          <button class="btn-primary" onclick="app.saveVendedor()">Crear Vendedor</button>
          <button class="btn-secondary" onclick="app.closeModal()">Cancelar</button>
        </div>
      `;
    }

    modal.classList.add('active');
  },
});

// Sobreescribir openModal con la versión mejorada
DeboraApp.prototype.openModal = DeboraApp.prototype.openModal_actualizado;
