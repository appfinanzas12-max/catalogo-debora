# 🔒 SEGURIDAD - DEBORA CATALOGO

## ⚠️ CREDENCIALES NUNCA EN EL CÓDIGO

**Las credenciales de Firebase NUNCA se hardcodean en el repositorio.**

### ✅ CÓMO CONFIGURAR SEGURAMENTE

#### 1. **Obtén tus credenciales de Firebase**
- Ve a https://console.firebase.google.com/
- Proyecto → Configuración → Mi aplicación → Web
- Copia los valores

#### 2. **Configura Variables en Netlify** (Recomendado)
- Abre https://app.netlify.com/
- Tu sitio → Configuración → Variables
- Agrega estas variables:

```
VITE_FIREBASE_API_KEY = AIzaSyB7kXhJ5zy5FMhmksPzdSleO1A7aWMbtu0
VITE_FIREBASE_AUTH_DOMAIN = deboracatalogo.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = deboracatalogo
VITE_FIREBASE_STORAGE_BUCKET = deboracatalogo.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 552563622109
VITE_FIREBASE_APP_ID = 1:552563622109:web:ce43fbb7ca5f581c8cdb34
```

#### 3. **Para desarrollo local**
- Crea archivo `.env.local` en la raíz:
```
VITE_FIREBASE_API_KEY=tu_valor
VITE_FIREBASE_AUTH_DOMAIN=tu_valor
...etc
```

- **NUNCA** commits `.env` o `.env.local`
- Está en `.gitignore` ✓

#### 4. **Verifica que está protegido**
```bash
git ls-files | grep -E "\.env|firebase-auth\.js" | grep -v "example"
```
No debe mostrar nada.

---

## 🔐 FIREBASE SECURITY RULES

En Firestore, configura estas reglas (opcional para futuro):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir sus datos
    match /vendors/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // El catálogo es público (lectura)
    match /products/{document=**} {
      allow read;
      allow write: if request.auth.uid != null;
    }
  }
}
```

---

## 🚨 SI EXPUSISTE CREDENCIALES

1. **Regenera inmediatamente en Firebase Console:**
   - Project → Configuración → Cuentas de servicio
   - Crea una nueva clave

2. **Revoke la anterior:**
   - Borra la clave expuesta

3. **Restablece en Netlify:**
   - Actualiza variables con nueva clave

---

## ✅ CHECKLIST DE SEGURIDAD

- [ ] Credenciales en variables de entorno (no en código)
- [ ] `.env` y `.env.local` en `.gitignore`
- [ ] `.env.example` tiene solo estructura, sin valores
- [ ] No hay credenciales en commits históricos
- [ ] Netlify tiene variables configuradas
- [ ] `firebase-auth.js` nunca expone keys directamente

---

## 📚 REFERENCIAS

- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/locations)
- [Protecting API Keys](https://cloud.google.com/docs/authentication/api-keys#api_key_restrictions)
- [Environment Variables en Vite](https://vitejs.dev/guide/env-and-modes.html)
