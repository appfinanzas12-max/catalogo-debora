// ============================================
// CONFIGURACIÓN FIREBASE - SEGURA
// ============================================

// 🔒 CREDENCIALES DESDE VARIABLES DE ENTORNO
// (Nunca hardcodeadas en el frontend)

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "CREDENTIAL_MISSING",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "CREDENTIAL_MISSING",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "CREDENTIAL_MISSING",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "CREDENTIAL_MISSING",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "CREDENTIAL_MISSING",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "CREDENTIAL_MISSING"
};

// Validar que las credenciales estén configuradas
if (firebaseConfig.apiKey === "CREDENTIAL_MISSING") {
  console.error("❌ FIREBASE NOT CONFIGURED");
  console.error("Add environment variables to Netlify:");
  console.error("VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.");
}

// Inicializar Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized securely");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
}

const auth = firebase.auth();

const SESSION_DURATION_MS = 48 * 60 * 60 * 1000; // 48 horas en milisegundos
const SESSION_TIMESTAMP_KEY = 'debora_session_timestamp';
const REMEMBER_ME_KEY = 'debora_remember_me';

// Configurar persistencia LOCAL
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(error => console.error("Error setting persistence:", error));

// ============================================
// MONITOR DE AUTENTICACIÓN
// ============================================

auth.onAuthStateChanged(user => {
  if (user) {
    // Usuario autenticado
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    const now = Date.now();
    
    if (timestamp) {
      const sessionAge = now - parseInt(timestamp);
      
      // Verificar si la sesión expiró (48 horas)
      if (sessionAge > SESSION_DURATION_MS) {
        console.log("Sesión expirada después de 48 horas");
        auth.signOut();
        localStorage.removeItem(SESSION_TIMESTAMP_KEY);
        localStorage.removeItem(REMEMBER_ME_KEY);
        updateUILoggedOut();
        return;
      }
    }
    
    // Sesión válida - actualizar UI
    updateUILoggedIn(user);
  } else {
    // Usuario no autenticado
    updateUILoggedOut();
  }
});

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

function handleLogin() {
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;
  const rememberMe = document.getElementById('rememberMe')?.checked;
  
  if (!email || !password) {
    alert('Por favor completa email y contraseña');
    return;
  }
  
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      
      // Guardar timestamp si "Recuérdame" está activado
      if (rememberMe) {
        localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
      }
      
      console.log("Login exitoso:", user.email);
      closeLoginModal();
      alert(`¡Bienvenido ${user.email}! 🎉`);
    })
    .catch(error => {
      console.error("Error login:", error);
      alert(`Error: ${error.message}`);
    });
}

function openVendorRegisterModal() {
  closeLoginModal(); // Cerrar login si está abierto
  
  const modal = document.getElementById('vendorRegisterModal') || createVendorRegisterModal();
  modal.classList.add('open');
}

function closeVendorRegisterModal() {
  const modal = document.getElementById('vendorRegisterModal');
  if (modal) {
    modal.classList.remove('open');
  }
}

function createVendorRegisterModal() {
  const modal = document.createElement('div');
  modal.id = 'vendorRegisterModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-card" style="width:min(500px, 100%); padding:2rem;">
      <button type="button" class="close" onclick="closeVendorRegisterModal()">×</button>
      <h2 style="color:var(--pink);margin:0 0 1.5rem;text-align:center;">📱 Registro de Vendedor</h2>
      
      <form id="vendorRegisterForm" onsubmit="handleVendorRegister(event)" style="display:flex;flex-direction:column;gap:1rem;">
        <div>
          <label style="display:block;color:var(--text);font-size:0.9rem;margin-bottom:0.5rem;">Nombre Completo *</label>
          <input type="text" id="vendorName" placeholder="Tu nombre completo" required style="width:100%;padding:0.75rem;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:8px;">
        </div>
        
        <div>
          <label style="display:block;color:var(--text);font-size:0.9rem;margin-bottom:0.5rem;">Nombre de Empresa/Tienda *</label>
          <input type="text" id="vendorCompany" placeholder="Nombre de tu negocio" required style="width:100%;padding:0.75rem;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:8px;">
        </div>
        
        <div>
          <label style="display:block;color:var(--text);font-size:0.9rem;margin-bottom:0.5rem;">Email *</label>
          <input type="email" id="vendorEmail" placeholder="tu@email.com" required style="width:100%;padding:0.75rem;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:8px;">
        </div>
        
        <div>
          <label style="display:block;color:var(--text);font-size:0.9rem;margin-bottom:0.5rem;">Teléfono WhatsApp *</label>
          <input type="tel" id="vendorPhone" placeholder="573XXX" required style="width:100%;padding:0.75rem;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:8px;">
        </div>
        
        <div>
          <label style="display:block;color:var(--text);font-size:0.9rem;margin-bottom:0.5rem;">Contraseña (Mín. 6 caracteres) *</label>
          <input type="password" id="vendorPassword" placeholder="••••••" required minlength="6" style="width:100%;padding:0.75rem;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:8px;">
        </div>
        
        <div>
          <label style="display:block;color:var(--text);font-size:0.9rem;margin-bottom:0.5rem;">Confirmar Contraseña *</label>
          <input type="password" id="vendorPasswordConfirm" placeholder="••••••" required minlength="6" style="width:100%;padding:0.75rem;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:8px;">
        </div>
        
        <label style="display:flex;align-items:center;gap:0.5rem;color:var(--muted);font-size:0.85rem;margin:0.5rem 0;">
          <input type="checkbox" id="vendorRememberMe" style="width:18px;height:18px;cursor:pointer;">
          Recuérdame por 48 horas
        </label>
        
        <button type="submit" style="background:var(--pink);color:white;border:none;padding:1rem;border-radius:8px;font-weight:bold;font-size:0.95rem;cursor:pointer;margin-top:0.5rem;">
          Crear Cuenta 🎯
        </button>
      </form>
      
      <p style="text-align:center;color:var(--muted);font-size:0.85rem;margin-top:1rem;">
        ¿Ya tienes cuenta? <a href="#" onclick="closeVendorRegisterModal(); openLoginModal(); return false;" style="color:var(--pink);text-decoration:none;font-weight:bold;">Inicia sesión</a>
      </p>
    </div>
  `;
  
  document.body.appendChild(modal);
  return modal;
}

function handleVendorRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('vendorName').value;
  const company = document.getElementById('vendorCompany').value;
  const email = document.getElementById('vendorEmail').value;
  const phone = document.getElementById('vendorPhone').value;
  const password = document.getElementById('vendorPassword').value;
  const confirmPassword = document.getElementById('vendorPasswordConfirm').value;
  const rememberMe = document.getElementById('vendorRememberMe').checked;
  
  // Validaciones
  if (!name || !company || !email || !phone || !password) {
    alert('Por favor completa todos los campos');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }
  
  if (password.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  // Crear cuenta en Firebase
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      
      // Guardar datos del vendedor en localStorage (o Firestore en futuro)
      const vendorData = {
        uid: user.uid,
        name: name,
        company: company,
        email: email,
        phone: phone,
        registeredAt: new Date().toISOString(),
        role: 'vendor'
      };
      
      localStorage.setItem(`vendor_${user.uid}`, JSON.stringify(vendorData));
      
      // Guardar sesión si "Recuérdame" está activado
      if (rememberMe) {
        localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
      }
      
      console.log("Vendedor registrado:", vendorData);
      closeVendorRegisterModal();
      alert(`¡Bienvenido ${company}! 🎉\nCuenta creada exitosamente como vendedor.`);
      
      // Actualizar UI
      updateUILoggedIn(user, vendorData);
    })
    .catch(error => {
      console.error("Error registro:", error);
      
      // Mensajes de error amigables
      if (error.code === 'auth/email-already-in-use') {
        alert('Este email ya está registrado. Intenta con otro.');
      } else if (error.code === 'auth/weak-password') {
        alert('La contraseña es muy débil. Usa al menos 6 caracteres.');
      } else {
        alert(`Error: ${error.message}`);
      }
    });
}

function handleLogout() {
  auth.signOut()
    .then(() => {
      localStorage.removeItem(SESSION_TIMESTAMP_KEY);
      localStorage.removeItem(REMEMBER_ME_KEY);
      updateUILoggedOut();
      alert('Sesión cerrada ✓');
    })
    .catch(error => console.error("Error logout:", error));
}

// ============================================
// FUNCIONES DE UI
// ============================================

function updateUILoggedIn(user, vendorData = null) {
  const topActions = document.querySelector('.top-actions');
  if (!topActions) return;
  
  // Limpiar botones anteriores
  const existingAuthButtons = topActions.querySelectorAll('[data-auth-btn]');
  existingAuthButtons.forEach(btn => btn.remove());
  
  // Crear botones de usuario autenticado
  const userEmail = user.email || vendorData?.email;
  const userRole = vendorData?.role || 'admin';
  
  const userButton = document.createElement('button');
  userButton.setAttribute('data-auth-btn', 'true');
  userButton.className = 'ghost';
  userButton.innerHTML = `👤 ${userEmail.split('@')[0]}`;
  userButton.style.cursor = 'pointer';
  userButton.onclick = () => {
    if (userRole === 'vendor') {
      openVendorPanel(user.uid);
    } else {
      openAdminPanel();
    }
  };
  
  const logoutButton = document.createElement('button');
  logoutButton.setAttribute('data-auth-btn', 'true');
  logoutButton.className = 'ghost';
  logoutButton.style.borderColor = 'var(--pink)';
  logoutButton.innerHTML = '🚪 Salir';
  logoutButton.onclick = handleLogout;
  
  topActions.appendChild(userButton);
  topActions.appendChild(logoutButton);
}

function updateUILoggedOut() {
  const topActions = document.querySelector('.top-actions');
  if (!topActions) return;
  
  // Limpiar botones anteriores
  const existingAuthButtons = topActions.querySelectorAll('[data-auth-btn]');
  existingAuthButtons.forEach(btn => btn.remove());
  
  // Botón de login
  const loginButton = document.createElement('button');
  loginButton.setAttribute('data-auth-btn', 'true');
  loginButton.className = 'ghost';
  loginButton.innerHTML = '🔐 Ingresar';
  loginButton.onclick = openLoginModal;
  
  topActions.appendChild(loginButton);
}

// ============================================
// PANEL DE VENDEDOR (FUTURO)
// ============================================

function openVendorPanel(vendorUid) {
  alert('Panel de Vendedor - Próximamente 🎯\n\nUID: ' + vendorUid);
  // Implementar panel de vendedor aquí
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  console.log("🔥 Firebase Auth System Initialized");
  
  // Verificar si hay sesión activa
  const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
  if (timestamp) {
    const sessionAge = Date.now() - parseInt(timestamp);
    if (sessionAge <= SESSION_DURATION_MS) {
      console.log("Sesión restaurada - Quedan:", Math.round((SESSION_DURATION_MS - sessionAge) / 1000 / 60), "minutos");
    }
  }
});
