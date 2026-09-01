# DEBORA API - Referencia Cloud Functions

## Autenticación

Todas las funciones se llaman desde el frontend usando:

```javascript
await callFunction('nombreFuncion', { parametros });
```

## 🔐 Auth

### `auth-login`
Inicia sesión un usuario

**Parámetros:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "token": "...",
  "user": {
    "id": "uid",
    "email": "...",
    "name": "...",
    "role": "ADMIN|VENDEDOR"
  }
}
```

---

### `auth-register`
Registra un nuevo usuario

**Parámetros:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "contraseña123",
  "name": "Nombre Completo",
  "role": "VENDEDOR"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "userId": "uid"
}
```

---

### `auth-logout`
Cierra la sesión

**Respuesta:**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

---

### `auth-getUser`
Obtiene datos del usuario autenticado

**Respuesta:**
```json
{
  "success": true,
  "user": {
    "id": "uid",
    "email": "...",
    "name": "...",
    "role": "...",
    "createdAt": "timestamp"
  }
}
```

---

## 📦 Productos

### `productos-getProductos`
Obtiene todos los productos

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "docId",
      "code": "DE-001",
      "name": "Producto",
      "category": "Categoría",
      "price": 55900,
      "stock": 10,
      "status": "Disponible"
    }
  ]
}
```

---

### `productos-getProducto`
Obtiene un producto específico

**Parámetros:**
```json
{
  "productoId": "docId"
}
```

---

### `productos-createProducto`
Crea nuevo producto (Admin only)

**Parámetros:**
```json
{
  "code": "DE-002",
  "name": "Producto Nuevo",
  "category": "Lencería Sexual",
  "price": 50000,
  "stock": 5,
  "description": "Descripción"
}
```

---

### `productos-updateProducto`
Actualiza un producto (Admin only)

**Parámetros:**
```json
{
  "productoId": "docId",
  "price": 60000,
  "stock": 15
}
```

---

### `productos-deleteProducto`
Elimina un producto (Admin only)

**Parámetros:**
```json
{
  "productoId": "docId"
}
```

---

### `productos-getProductosByCategoria`
Obtiene productos de una categoría

**Parámetros:**
```json
{
  "categoria": "Lencería Sexual"
}
```

---

## 👥 Vendedores

### `vendedores-getVendedores`
Lista todos los vendedores (Admin only)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uid",
      "name": "Vendedor",
      "email": "vendedor@ejemplo.com",
      "role": "VENDEDOR",
      "totalSales": 500000,
      "totalCommission": 50000
    }
  ]
}
```

---

### `vendedores-getVendedor`
Obtiene un vendedor específico (Admin only)

**Parámetros:**
```json
{
  "vendedorId": "uid"
}
```

---

### `vendedores-createVendedor`
Crea nuevo vendedor (Admin only)

**Parámetros:**
```json
{
  "email": "vendedor@ejemplo.com",
  "password": "contraseña123",
  "name": "Juan Perez"
}
```

---

### `vendedores-updateVendedor`
Actualiza un vendedor (Admin o vendedor)

**Parámetros:**
```json
{
  "vendedorId": "uid",
  "name": "Nuevo Nombre"
}
```

---

### `vendedores-deleteVendedor`
Elimina vendedor (Admin only)

**Parámetros:**
```json
{
  "vendedorId": "uid"
}
```

---

## 💰 Ventas

### `ventas-createVenta`
Registra una nueva venta

**Parámetros:**
```json
{
  "productoId": "docId",
  "quantity": 2,
  "vendedorId": "uid"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Venta registrada exitosamente",
  "ventaId": "docId",
  "total": 111800
}
```

---

### `ventas-getVenta`
Obtiene detalles de una venta

**Parámetros:**
```json
{
  "ventaId": "docId"
}
```

---

### `ventas-getAllVentas`
Lista todas las ventas (Admin only)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "docId",
      "productoId": "...",
      "vendedorId": "...",
      "quantity": 2,
      "price": 55900,
      "total": 111800,
      "status": "Completada",
      "createdAt": "timestamp"
    }
  ]
}
```

---

### `ventas-getVentasByVendedor`
Obtiene ventas de un vendedor

**Parámetros:**
```json
{
  "vendedorId": "uid"
}
```

---

### `ventas-cancelVenta`
Cancela una venta (devuelve stock)

**Parámetros:**
```json
{
  "ventaId": "docId"
}
```

---

## 💳 Comisiones

### `comisiones-getComisionSettings`
Obtiene configuración de comisiones

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "percentageDefault": 10,
    "percentageByVendedor": {
      "uid1": 12,
      "uid2": 15
    }
  }
}
```

---

### `comisiones-updateComisionSettings`
Actualiza configuración (Admin only)

**Parámetros:**
```json
{
  "percentageDefault": 12,
  "percentageByVendedor": {
    "uid1": 15,
    "uid2": 18
  }
}
```

---

### `comisiones-calculateComision`
Calcula comisión para una venta

**Parámetros:**
```json
{
  "ventaTotal": 100000,
  "vendedorId": "uid"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "percentage": 10,
    "comisionAmount": 10000,
    "ventaTotal": 100000
  }
}
```

---

### `comisiones-getComisionesByVendedor`
Obtiene comisiones de un vendedor

**Parámetros:**
```json
{
  "vendedorId": "uid"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "percentage": 10,
    "comisiones": [
      {
        "ventaId": "docId",
        "total": 111800,
        "comision": 11180,
        "percentage": 10,
        "createdAt": "timestamp"
      }
    ],
    "totalComision": 50000
  }
}
```

---

### `comisiones-getAllComisiones`
Reporte de todas comisiones (Admin only)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "vendedorId": "uid",
      "vendedorName": "Juan",
      "percentage": 10,
      "totalVentas": 500000,
      "totalComision": 50000
    }
  ]
}
```

---

## 🏛️ Admin

### `admin-getDashboard`
Obtiene estadísticas del dashboard

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalProductos": 45,
    "totalStock": 250,
    "totalVendedores": 5,
    "totalCategorias": 5,
    "totalVentas": 1500000,
    "totalComisiones": 150000
  }
}
```

---

### `admin-getCategorias`
Obtiene todas las categorías

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "docId",
      "name": "Lencería Sexual",
      "description": "..."
    }
  ]
}
```

---

### `admin-createCategoria`
Crea nueva categoría (Admin only)

**Parámetros:**
```json
{
  "name": "Nueva Categoría",
  "description": "Descripción"
}
```

---

### `admin-updateCategoria`
Actualiza categoría (Admin only)

**Parámetros:**
```json
{
  "categoriaId": "docId",
  "name": "Nombre Actualizado"
}
```

---

### `admin-deleteCategoria`
Elimina categoría (Admin only)

**Parámetros:**
```json
{
  "categoriaId": "docId"
}
```

---

### `admin-getVendedorStats`
Obtiene estadísticas de un vendedor (Admin only)

**Parámetros:**
```json
{
  "vendedorId": "uid"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "vendedorId": "uid",
    "vendedorName": "Juan Perez",
    "email": "juan@ejemplo.com",
    "totalVentas": 500000,
    "cantidadVentas": 10,
    "percentage": 10,
    "totalComision": 50000
  }
}
```

---

## 🔧 Códigos de Error

### Success (200)
```json
{
  "success": true,
  "data": {...}
}
```

### Errores

#### invalid-argument (400)
Parámetros inválidos o incompletos
```json
{
  "error": {
    "code": "invalid-argument",
    "message": "Descripción del error"
  }
}
```

#### unauthenticated (401)
Usuario no autenticado
```json
{
  "error": {
    "code": "unauthenticated",
    "message": "Usuario no autenticado"
  }
}
```

#### permission-denied (403)
Permisos insuficientes
```json
{
  "error": {
    "code": "permission-denied",
    "message": "Solo admins pueden..."
  }
}
```

#### not-found (404)
Recurso no encontrado
```json
{
  "error": {
    "code": "not-found",
    "message": "Recurso no encontrado"
  }
}
```

#### already-exists (409)
Recurso ya existe
```json
{
  "error": {
    "code": "already-exists",
    "message": "El email ya está registrado"
  }
}
```

#### internal (500)
Error interno del servidor

---

## 📝 Ejemplos de Uso

### Registrar una venta

```javascript
try {
  const result = await callFunction('ventas-createVenta', {
    productoId: 'product123',
    quantity: 2,
    vendedorId: 'vendor456'
  });

  if (result.success) {
    console.log('Venta registrada:', result.ventaId);
    console.log('Total: $' + result.total);
  }
} catch (error) {
  console.error('Error:', error.message);
}
```

### Obtener comisiones

```javascript
const result = await callFunction('comisiones-getComisionesByVendedor', {
  vendedorId: currentUser.id
});

console.log('Total comisión: $' + result.data.totalComision);
result.data.comisiones.forEach(c => {
  console.log(`Venta: $${c.total} → Comisión: $${c.comision}`);
});
```

### Crear producto (Admin)

```javascript
try {
  const result = await callFunction('productos-createProducto', {
    code: 'DE-025',
    name: 'Nuevo Producto',
    category: 'Lencería Sexual',
    price: 45000,
    stock: 20,
    description: 'Descripción del producto'
  });

  console.log('Producto creado:', result.productId);
} catch (error) {
  if (error.code === 'permission-denied') {
    alert('Solo admins pueden crear productos');
  }
}
```

---

**Versión API**: 2.0.0  
**Última actualización**: Septiembre 2026
