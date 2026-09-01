# DEBORA v2 - Guía de Deploy a Producción

## 📋 Prerrequisitos

- ✅ Proyecto Firebase creado y configurado (ver SETUP.md)
- ✅ Cloud Functions deployadas localmente probadas
- ✅ Frontend configurado con credenciales Firebase
- ✅ Git configurado (opcional pero recomendado)

---

## 🚀 Opción 1: Deploy Completo (Recomendado)

### Netlify (Frontend) + Firebase (Backend)

#### Paso 1: Preparar el repositorio Git

```bash
cd c:\Users\Admin\Desktop\catalogo

# Inicializar git (si no lo está)
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "DEBORA v2 - Sistema de gestión de catálogo"

# Crear repositorio en GitHub (opcional pero recomendado)
# 1. Ir a github.com y crear nuevo repo
# 2. Nombre: debora-v2
# 3. Hacer push:
git remote add origin https://github.com/tu-usuario/debora-v2.git
git branch -M main
git push -u origin main
```

#### Paso 2: Deploy Backend (Cloud Functions)

```bash
cd backend

# Login en Firebase
firebase login

# Deploy las functions
firebase deploy --only functions

# Esperar a que termine. Verás algo como:
# ✓ functions[auth-login] deployed successfully
# ✓ functions[productos-getProductos] deployed successfully
# ... etc
```

**Verificar deployment:**
```bash
firebase functions:log
```

#### Paso 3: Deploy Frontend en Netlify

**Opción A: Desde línea de comandos**

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login en Netlify
netlify login

# Deploy del frontend
cd c:\Users\Admin\Desktop\catalogo\frontend
netlify deploy --prod --dir=public

# Se te dará una URL como: https://debora-xyz.netlify.app
```

**Opción B: Desde interfaz web (más fácil)**

1. Ir a [netlify.com](https://netlify.com)
2. Hacer login
3. Click "Add new site"
4. Seleccionar "Deploy manually"
5. Arrastrar carpeta `frontend/public` o hacer zip
6. ¡Listo!

---

## 🔧 Opción 2: Deploy Solo Backend (Si frontend está estático)

```bash
cd backend
firebase deploy --only functions
```

Luego abrir Firebase Console → Hosting y seguir instrucciones para frontend.

---

## 🌐 Opción 3: Todo en Firebase

### Deploy tanto frontend como backend en Firebase

#### Paso 1: Configurar Firebase Hosting

```bash
cd backend

firebase init hosting

# Preguntas:
# - What do you want to use as your public directory? → ../frontend/public
# - Configure as a single-page app? → Yes
```

#### Paso 2: Deploy todo

```bash
firebase deploy
```

Esto despliega:
- ✅ Cloud Functions (backend)
- ✅ Frontend HTML/CSS/JS
- ✅ Firestore

Tu URL será: `https://tu-proyecto.web.app`

---

## 📊 Verificación Post-Deploy

### 1. Verificar que el sitio está up

```bash
# Si usaste Netlify
open https://tu-site.netlify.app

# Si usaste Firebase
open https://tu-proyecto.web.app
```

### 2. Probar Login

1. Ir a `/index.html`
2. Ingresar credenciales:
   - Email: `admin@debora.com`
   - Password: `admin123`
3. Debería redirigir a `/admin.html`

### 3. Probar Catálogo Público

1. Ir a `/catalogo.html`
2. Deberías ver categorías y productos cargados desde Firestore
3. Intentar búsqueda
4. Hacer click en "CONSULTAR" → debe abrir WhatsApp

### 4. Verificar Cloud Functions

```bash
# Ver logs en tiempo real
firebase functions:log

# O en Firebase Console:
# Build → Functions → Ver logs de cada función
```

### 5. Probar Operaciones

**Como Admin:**
- Crear producto
- Crear categoría
- Crear vendedor
- Ver dashboard

**Como Vendedor:**
- Ver catálogo
- Registrar venta
- Ver comisiones

---

## 🔒 Seguridad en Producción

### 1. Cambiar contraseña de admin

```bash
# En Firebase Console:
# Authentication → Usuarios → Buscar admin@debora.com
# Click en los 3 puntos → "Reset password"
# O cambiar desde el panel (cuando esté implementado)
```

### 2. Verificar Firestore Security Rules

```bash
# En Firebase Console:
# Firestore Database → Reglas
# Verificar que las reglas sean restrictivas
```

### 3. Habilitar facturación (si es necesario)

- Cloud Functions: El plan Spark es suficiente para empezar
- Si necesitas más, upgradearte al plan Blaze (pago por uso)

### 4. Configurar dominio personalizado

**Netlify:**
1. Settings → Domain management
2. Add custom domain
3. Actualizar DNS en tu registrador

**Firebase:**
1. Hosting → Domains
2. Add custom domain
3. Seguir instrucciones de verificación DNS

---

## 🔄 Actualizaciones en Producción

### Actualizar Backend

```bash
# Hacer cambios en /backend/functions
# Commit
git add backend/
git commit -m "Descripción de cambio"

# Deploy
cd backend
firebase deploy --only functions
```

### Actualizar Frontend

**Si está en Netlify:**
```bash
# Los cambios en el repo se despliegan automáticamente
# (si conectaste GitHub)
# O:
netlify deploy --prod --dir=frontend/public
```

**Si está en Firebase:**
```bash
cd backend
firebase deploy --only hosting
```

---

## 🚨 Troubleshooting

### Problema: "Functions not deploying"

```bash
# Verificar que esté en la carpeta correcta
cd backend

# Reinstalar dependencias
cd functions
npm install

# Intentar deploy de nuevo
cd ..
firebase deploy --only functions
```

### Problema: "Frontend no carga datos"

1. Verificar que `config.js` tiene credenciales correctas
2. Verificar que Cloud Functions está deployada
3. Revisar la consola (F12 → Console)
4. Ver logs: `firebase functions:log`

### Problema: "Error en autenticación"

1. Verificar Firestore Security Rules
2. Verificar que usuario admin existe en `/users/{uid}`
3. Probar logout y login nuevamente
4. Limpiar localStorage: `localStorage.clear()`

### Problema: "CORS errors"

No debería haber si está todo configurado correctamente. Si aparece:

1. Verificar que Firebase está inicializado
2. Verificar credenciales en config.js
3. Ver console para detalles del error

---

## 📈 Monitoring

### Ver estadísticas

**Firebase Console:**
- Firestore → Data
- Functions → Monitoring
- Hosting → Analytics

**Netlify Console:**
- Analytics
- Deploys
- Performance

---

## 🔐 Backups

### Backup automático de Firestore

En Firebase Console:
1. Firestore Database → Backups (si tienes plan Blaze)
2. Habilitar backups automáticos

### Backup manual

```bash
# Exportar Firestore (requiere gcloud CLI)
gcloud firestore export gs://tu-bucket/backup-fecha
```

---

## 📊 Scaling

Cuando cresca (más tráfico/datos):

1. **Database:** Firestore escala automáticamente
2. **Functions:** Cloud Functions escala automáticamente
3. **Hosting:** Netlify/Firebase escalan automáticamente

---

## 💰 Costos esperados

### Plan Spark (Gratis - Recomendado para empezar)

- Firestore: 50k lecturas/día gratis
- Cloud Functions: 125k invocaciones/mes gratis
- Hosting: Gratis

### Plan Blaze (Pago por uso)

Depende de uso, típicamente:
- Firestore: $0.06 por 100k lecturas
- Cloud Functions: $0.40 por 1M invocaciones
- Hosting: $0.15 GB/mes

---

## ✅ Checklist Final

Antes de lanzar a producción:

- [ ] Cloud Functions deployadas
- [ ] Frontend en Netlify/Firebase
- [ ] Credenciales Firebase en frontend/js/config.js
- [ ] Usuario admin creado
- [ ] Firestore Rules configuradas
- [ ] Prueba de login funciona
- [ ] Prueba de crear producto funciona
- [ ] Prueba de crear venta funciona
- [ ] Catálogo público carga productos
- [ ] WhatsApp funcionando
- [ ] Dominio personalizado (opcional)
- [ ] HTTPS habilitado (automático)
- [ ] Backups configurados

---

**¡Listo para lanzar!** 🎉

Para soporte: WhatsApp +57 322 4079955

---

**Versión**: 2.0.0  
**Fecha**: Septiembre 2026
