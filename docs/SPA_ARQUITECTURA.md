# DEBORA v2 - Arquitectura SPA (Single Page Application)

## 🎯 ¿Qué es una SPA?

Una **SPA (Single Page Application)** es una aplicación web que:
- ✅ Carga **UNA SOLA página HTML** (app.html)
- ✅ Renderiza contenido **dinámicamente** sin recargar
- ✅ Navega **internamente** sin cambiar de URL base
- ✅ Mantiene el **estado** entre navegaciones
- ✅ Es más **rápida** y **fluida**

### Comparación

**Anterior (Multi-página):**
```
index.html → admin.html → vendedor.html → catalogo.html
(Recargas la página cada vez)
```

**Ahora (SPA):**
```
app.html → (renderiza componentes internamente)
(Cambios suaves sin recargas)
```

---

## 📁 Nueva Estructura

```
frontend/public/
├── app.html                    ← PÁGINA ÚNICA (punto de entrada)
├── index.html                  ← LOGIN (obsoleto, usar app.html)
├── admin.html                  ← (NO necesario, en app.html)
├── vendedor.html               ← (NO necesario, en app.html)
└── catalogo.html               ← (NO necesario, en app.html)

frontend/js/
├── config.js                   ← Configuración Firebase (sin cambios)
├── router.js                   ← Sistema de routing
├── app.js                      ← Aplicación principal (TODO en uno)
```

---

## 🔄 Cómo Funciona

### 1. Usuario abre app.html

```
Usuario escribea: https://debora.com/app.html
                          ↓
                   Se carga UNA página
                          ↓
            Se inicializa la app (app.js)
                          ↓
            Verifica si hay sesión activa
                          ↓
            Renderiza LOGIN o DASHBOARD
```

### 2. Usuario navega dentro de la app

```
Usuario hace click en "Dashboard"
           ↓
app.navigate('dashboard')
           ↓
Router cambia el componente
           ↓
Se renderiza nueva UI
           ↓
Sin recargar la página (cambio suave)
```

### 3. La URL cambia pero sin recargar

```
app.html?route=login
app.html?route=dashboard
app.html?route=misventas
```

---

## 🏗️ Componentes Principales

### router.js
El **sistema de navegación**

```javascript
router.register('login', LoginComponent);
router.register('dashboard', DashboardComponent);
router.navigate('dashboard');  // Cambiar a dashboard
```

### app.js
La **aplicación principal**

```javascript
class DeboraApp {
  init()              // Inicializar
  navigate(path)      // Navegar
  login()             // Login
  logout()            // Logout
  loadDashboard()     // Cargar datos
  // ... más métodos
}

const app = new DeboraApp();
app.init();
```

### Componentes (Funciones que retornan HTML)

```javascript
function LoginComponent() {
  return `<html aquí>`;
}

function DashboardComponent() {
  return `<html aquí>`;
}

// Cada componente es una función que retorna HTML
```

---

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────┐
│         User Click "Dashboard"          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    app.navigate('dashboard')            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  router.navigate('dashboard')           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Renderizar DashboardComponent()        │
│  (Retorna HTML del dashboard)           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Insertar HTML en #app-root             │
│  (Sin recargar página)                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Adjuntar event listeners               │
│  (Botones, formularios, etc)            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  ✅ Dashboard renderizado y funcional   │
└─────────────────────────────────────────┘
```

---

## 🎯 Ventajas de esta Arquitectura

| Ventaja | Explicación |
|---------|-------------|
| **Sin recargas** | Cambios suaves e instantáneos |
| **Una sola página** | Menos archivos, más simple |
| **Mejor UX** | No esperas a que cargue |
| **Fácil de mantener** | Código centralizado |
| **Escalable** | Agrega componentes fácilmente |
| **Responde rápido** | Solo re-renderiza lo necesario |

---

## 🚀 Usar la SPA

### Acceso

En lugar de:
```
https://debora.com/index.html
https://debora.com/admin.html
https://debora.com/vendedor.html
```

Ahora solo:
```
https://debora.com/app.html
```

### El flujo interno es:

1. `app.html?route=login` → Muestra login
2. Usuario hace login
3. `app.html?route=dashboard` → Muestra dashboard
4. Usuario navega en el panel
5. Todo sin recargar la página

---

## 💻 Cómo Agregar un Nuevo Componente

### 1. Crear la función componente

```javascript
function MiNuevoComponente(params = {}) {
  return `
    <div>Mi contenido aquí</div>
  `;
}
```

### 2. Registrar en el router

```javascript
// En app.init()
router.register('mi-ruta', MiNuevoComponente);
```

### 3. Navegar a ella

```javascript
app.navigate('mi-ruta');
```

**¡Listo! Ya funciona.**

---

## 📱 Estructura de Componentes Actuales

```
app.html (PÁGINA ÚNICA)
│
├─ LoginComponent
│   └─ Login / Registro
│
├─ DashboardComponent
│   ├─ TopBar
│   └─ Estadísticas Admin
│
├─ ProductosComponent
│   ├─ TopBar
│   ├─ Tabla de productos
│   └─ Modal crear/editar
│
├─ VendedoresComponent
│   ├─ TopBar
│   └─ Grid de vendedores
│
├─ MisVentasComponent
│   ├─ TopBar
│   └─ Tabla de mis ventas
│
└─ CatalogoComponent
    └─ Grid de productos públicos
```

---

## 🔐 Autenticación en SPA

```javascript
// Login exitoso
const user = {
  id: "uid123",
  name: "Juan",
  role: "ADMIN"
};

// Guardar
localStorage.setItem('debora_user', JSON.stringify(user));

// Recuperar
const user = JSON.parse(localStorage.getItem('debora_user'));

// Router lo verifica automáticamente
// Si no hay usuario, redirige a login
```

---

## 🎨 Temas/Modos (Futuro)

Como es una SPA, agregar temas es más fácil:

```javascript
function cambiarTema(tema) {
  document.body.classList.add(`theme-${tema}`);
  localStorage.setItem('debora_theme', tema);
}
```

No necesitas recargar nada.

---

## 📊 Renderizado Condicional

Según el usuario, muestra diferente UI:

```javascript
// En TopbarComponent()
${user.role === 'ADMIN' ? `
  <button>Dashboard</button>
  <button>Vendedores</button>
` : `
  <button>Mis Ventas</button>
`}
```

---

## ⚡ Performance

### Antes (Multi-página)
```
Click → Recargar página → Esperar → Nuevos scripts → Renderizar
(Lento, parpadeos)
```

### Ahora (SPA)
```
Click → Cambiar componente → Renderizar
(Instantáneo, suave)
```

---

## 🔍 Debugging

### Ver ruta actual
```javascript
console.log(router.getCurrentRoute());
```

### Ver usuario
```javascript
console.log(router.getUser());
```

### Ver logs
```javascript
// Los logs están en console (F12)
```

---

## 🛠️ Modificar Componentes

Cada componente es una función. Modificar es simple:

```javascript
// Antes
function DashboardComponent() {
  return `<h1>Dashboard</h1>`;
}

// Ahora
function DashboardComponent() {
  return `
    <h1>Mi Dashboard Personalizado</h1>
    <p>Texto nuevo aquí</p>
  `;
}

// ¡Automáticamente se actualiza!
```

---

## 🚀 Deployar SPA

Es lo mismo que antes:

```bash
# Netlify
netlify deploy --prod --dir=frontend/public

# Firebase
firebase deploy --only hosting
```

Incluye app.html en lugar de index.html.

---

## 📋 Checklist SPA

- ✅ Una sola página HTML (app.html)
- ✅ Router para navegación sin recargas
- ✅ Componentes como funciones
- ✅ Estado centralizado (currentUser, etc)
- ✅ LocalStorage para persistencia
- ✅ Renderizado dinámico

---

## 🎯 Próximas Mejoras (Opcional)

- [ ] Animaciones entre componentes
- [ ] Lazy loading de componentes
- [ ] State management (Vuex/Redux)
- [ ] PWA (Progressive Web App)
- [ ] Service Workers

---

## 💡 Diferencias Clave

| Aspecto | Multi-página | SPA |
|--------|--------------|-----|
| Archivos HTML | Múltiples | 1 |
| Recargas | Sí, frecuentes | No |
| Velocidad | Lenta | Rápida |
| UX | Parpadeos | Suave |
| Mantenimiento | Difícil | Fácil |
| Escalabilidad | Media | Alta |

---

**Versión**: 2.0.0 (SPA)  
**Status**: ✅ Listo  
**Última actualización**: Septiembre 2026

**¡DEBORA ahora es una SPA moderna y fluida!** 🚀
