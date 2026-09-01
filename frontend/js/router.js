// Sistema de routing para SPA (una sola página)

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.currentUser = null;
  }

  // Registrar una ruta
  register(path, component) {
    this.routes[path] = component;
  }

  // Navegar a una ruta
  navigate(path, params = {}) {
    const route = this.routes[path];
    
    if (!route) {
      console.error(`Ruta no encontrada: ${path}`);
      return;
    }

    this.currentRoute = path;
    
    // Renderizar el componente
    this.render(route, params);
    
    // Actualizar historial del navegador (sin recargar)
    window.history.pushState({ path, params }, '', `?route=${path}`);
  }

  // Renderizar componente
  render(component, params = {}) {
    const root = document.getElementById('app-root');
    root.innerHTML = component(params);
    
    // Re-adjuntar event listeners después de renderizar
    this.attachEventListeners();
  }

  // Obtener usuario actual
  setUser(user) {
    this.currentUser = user;
  }

  getUser() {
    return this.currentUser;
  }

  // Adjuntar event listeners (será sobrescrito en app.js)
  attachEventListeners() {
    // Implementado en app.js
  }

  // Obtener ruta actual
  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Instancia global del router
const router = new Router();
