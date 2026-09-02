// ============================================
// MODAL DE LOGIN - INTERFAZ
// ============================================

function createLoginModal() {
  const modal = document.createElement('div');
  modal.id = 'loginModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-card" style="width:min(420px, 100%); padding:2rem;">
      <button type="button" class="close" onclick="closeLoginModal()">×</button>
      
      <h2 style="color:var(--pink);margin:0 0 1.5rem;text-align:center;">🔐 Inicia Sesión</h2>
      
      <form id="loginForm" onsubmit="handleLogin(event)" style="display:flex;flex-direction:column;gap:1rem;">
        <div>
          <label style="display:block;color:var(--text);font-size:0.9rem;margin-bottom:0.5rem;">Email *</label>
          <input type="email" id="loginEmail" placeholder="tu@email.com" required style="width:100%;padding:0.75rem;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:8px;font-size:1rem;">
        </div>
        
        <div>
          <label style="display:block;color:var(--text);font-size:0.9rem;margin-bottom:0.5rem;">Contraseña *</label>
          <input type="password" id="loginPassword" placeholder="••••••" required style="width:100%;padding:0.75rem;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:8px;font-size:1rem;">
        </div>
        
        <label style="display:flex;align-items:center;gap:0.75rem;color:var(--muted);font-size:0.85rem;margin:0.5rem 0;">
          <input type="checkbox" id="rememberMe" style="width:18px;height:18px;cursor:pointer;accent-color:var(--pink);">
          Recuérdame por 48 horas
        </label>
        
        <button type="submit" style="background:var(--pink);color:white;border:none;padding:0.85rem;border-radius:8px;font-weight:bold;font-size:0.95rem;cursor:pointer;margin-top:0.5rem;transition:all 0.2s;">
          🔓 Ingresar
        </button>
      </form>
      
      <hr style="border:none;border-top:1px solid var(--line);margin:1.5rem 0;">
      
      <div style="text-align:center;margin-bottom:1rem;">
        <p style="color:var(--text);margin:0 0 0.75rem;">¿Eres vendedor?</p>
        <button type="button" onclick="openVendorRegisterModal()" style="background:transparent;color:var(--pink);border:2px solid var(--pink);padding:0.75rem 1.5rem;border-radius:8px;cursor:pointer;font-weight:bold;font-size:0.9rem;width:100%;transition:all 0.2s;">
          Registrarse como Vendedor 🎯
        </button>
      </div>
      
      <p style="text-align:center;color:#888;font-size:0.75rem;margin:1rem 0 0;">
        Demo: admin@debora.com / Admin@2026
      </p>
    </div>
  `;
  
  document.body.appendChild(modal);
  return modal;
}

function openLoginModal() {
  let modal = document.getElementById('loginModal');
  if (!modal) {
    modal = createLoginModal();
  }
  modal.classList.add('open');
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.remove('open');
  }
}

// Insertar modal al cargar
document.addEventListener('DOMContentLoaded', () => {
  // Solo crear si no existe
  if (!document.getElementById('loginModal')) {
    createLoginModal();
  }
  
  // Actualizar botón de login en topbar
  updateLoginButton();
});

function updateLoginButton() {
  const topActions = document.querySelector('.top-actions');
  if (!topActions) return;
  
  // Buscar botón existente
  let loginBtn = topActions.querySelector('[data-login-btn]');
  if (!loginBtn) {
    loginBtn = document.createElement('button');
    loginBtn.setAttribute('data-login-btn', 'true');
    loginBtn.className = 'ghost';
    loginBtn.innerHTML = '🔐 Ingresar';
    loginBtn.onclick = openLoginModal;
    topActions.appendChild(loginBtn);
  }
}
