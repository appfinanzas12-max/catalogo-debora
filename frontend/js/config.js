// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB7kXhJ5zy5FMhmksPzdSleO1A7aWMbtu0",
  authDomain: "deboracatalogo.firebaseapp.com",
  projectId: "deboracatalogo",
  storageBucket: "deboracatalogo.firebasestorage.app",
  messagingSenderId: "552563622109",
  appId: "1:552563622109:web:ce43fbb7ca5f581c8cdb34"
};

// Inicializar Firebase (esto se debe hacer después de cargar los scripts de Firebase)
let db;
let auth;
let functions;

async function initializeFirebase() {
  try {
    // Esperar a que Firebase esté disponible
    if (typeof firebase !== 'undefined') {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      auth = firebase.auth();
      functions = firebase.functions();
      
      console.log('Firebase inicializado correctamente');
      return true;
    } else {
      console.error('Firebase SDK no está disponible');
      return false;
    }
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
    return false;
  }
}

// Función para ejecutar una Cloud Function
async function callFunction(functionName, data) {
  try {
    const callable = functions.httpsCallable(functionName);
    const result = await callable(data);
    return result.data;
  } catch (error) {
    console.error(`Error en función ${functionName}:`, error);
    throw error;
  }
}
