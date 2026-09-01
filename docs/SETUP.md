# DEBORA v2 - Guía de Setup

## Requisitos previos

- Node.js 16+ instalado
- npm o yarn
- Cuenta de Google (para Firebase)
- Terminal/CMD

## Paso 1: Crear Proyecto en Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Crear proyecto"
3. Nombre: `debora-v2` (o el que prefieras)
4. Desactiva Google Analytics
5. Click en "Crear proyecto"
6. Esperar a que se cree

## Paso 2: Habilitar Servicios

Una vez creado el proyecto:

### 2.1 - Firestore
1. En el menú izquierdo: Build → Firestore Database
2. Click "Crear base de datos"
3. Ubicación: `nam5` (América del Norte)
4. Modo: Empezar en modo de prueba (seguridad abierta temporalmente)
5. Click "Crear"

### 2.2 - Authentication
1. En el menú: Build → Authentication
2. Click "Comenzar"
3. Habilitar: Email/contraseña
4. Guardar

### 2.3 - Cloud Functions
1. En el menú: Build → Functions
2. Si es necesario, vincular a cuenta de facturación (plan Spark es gratis)

## Paso 3: Obtener Credenciales

1. Ir a Configuración del proyecto (engranaje arriba a la izquierda)
2. Pestaña: "Configuración general"
3. Buscar sección "Tus aplicaciones"
4. Click el botón `</> (Web)`
5. Copiar el objeto `firebaseConfig`

## Paso 4: Configurar Frontend

1. Abrir: `frontend/js/config.js`
2. Reemplazar `firebaseConfig` con tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Paso 5: Configurar Backend (Cloud Functions)

### 5.1 - Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 5.2 - Login en Firebase
```bash
firebase login
```

### 5.3 - Inicializar proyecto
```bash
cd backend
firebase init
```

Selecciona:
- Functions: Yes
- Firestore: Yes
- Default project: tu proyecto `debora-v2`

### 5.4 - Instalar dependencias
```bash
cd functions
npm install
```

## Paso 6: Configurar Firestore Security Rules

1. En Firebase Console: Build → Firestore Database → Pestaña "Reglas"
2. Reemplazar contenido con: `backend/firestore.rules`

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios - solo el propietario puede leer
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId || request.auth.token.admin == true;
    }

    // Productos - cualquiera puede leer, solo admin crear/editar
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    // Categorías - cualquiera puede leer
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    // Ventas - vendedor solo su datos, admin todo
    match /sales/{saleId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid != null;
    }

    // Settings - admin solo
    match /settings/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

Publicar reglas

## Paso 7: Desplegar Cloud Functions

```bash
cd backend
firebase deploy --only functions
```

Esto va a:
1. Compilar las funciones
2. Crear contenedores
3. Deployar a Firebase

Esperar a que termine. Verás URLs de las funciones.

## Paso 8: Crear Usuario Admin Inicial

### Opción A - Desde Firebase Console

1. Authentication → Users
2. Click "Add user"
3. Email: `admin@debora.com`
4. Password: `admin123`
5. Crear

Luego crear documento en Firestore:
1. Firestore → Collection "users"
2. Click "Add document"
3. Document ID: (copiar UID del usuario creado)
4. Campos:
```json
{
  "email": "admin@debora.com",
  "name": "Administrador",
  "role": "ADMIN",
  "password": "admin123",
  "createdAt": timestamp,
  "updatedAt": timestamp,
  "active": true
}
```

### Opción B - Mediante Cloud Function

```bash
firebase functions:call auth-register --data='{"email":"admin@debora.com","password":"admin123","name":"Administrador","role":"ADMIN"}'
```

## Paso 9: Crear Colecciones Iniciales en Firestore

### Categorías

1. Collection: `categories`
2. Añadir documentos:

```
{
  "name": "Vibradores con App",
  "description": "",
  "createdAt": timestamp,
  "updatedAt": timestamp
}

{
  "name": "Lencería Sexual",
  "description": "",
  "createdAt": timestamp,
  "updatedAt": timestamp
}

...etc
```

### Productos

1. Collection: `products`
2. Copiar datos de `docs/modelo-inicial.json`

```
{
  "code": "DE-L001",
  "name": "Body Abierto",
  "category": "Lencería Sexual",
  "price": 55900,
  "stock": 10,
  "status": "Disponible",
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

### Settings

1. Collection: `settings`
2. Document: `commission`

```
{
  "percentageDefault": 10,
  "percentageByVendedor": {},
  "updatedAt": timestamp
}
```

## Paso 10: Desplegar Frontend

### Opción A - Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=frontend/public
```

### Opción B - Firebase Hosting

```bash
cd frontend
firebase deploy --only hosting
```

### Opción C - Local (para pruebas)

```bash
cd frontend/public
python -m http.server 8000
# Acceder a http://localhost:8000
```

## Verificación Final

1. Abrir: `https://tu-dominio.com` (o `http://localhost:8000`)
2. Ingresar:
   - Email: `admin@debora.com`
   - Password: `admin123`
3. Deberías ver el Dashboard del Admin

## Troubleshooting

### Error: "Functions not found"
- Verificar que Cloud Functions esté deployado: `firebase deploy --only functions`

### Error: "Permission denied"
- Verificar Firestore Security Rules
- Verificar que el usuario esté en collection `users`

### Error: "Firebase not initialized"
- Verificar credenciales en `frontend/js/config.js`
- Verificar que esté cargando los scripts de Firebase

## Próximos pasos

1. Cambiar contraseña del admin
2. Crear vendedores desde panel admin
3. Subir productos
4. Conectar catálogo público
