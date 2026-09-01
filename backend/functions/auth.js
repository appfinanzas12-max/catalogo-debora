const functions = require('firebase-functions');
const admin = require('firebase-admin');

// LOGIN - Retorna token de autenticación
exports.login = functions.https.onCall(async (data, context) => {
  try {
    const { email, password } = data;

    if (!email || !password) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email y contraseña son requeridos'
      );
    }

    // Obtener usuario de Firestore
    const userDoc = await admin
      .firestore()
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userDoc.empty) {
      throw new functions.https.HttpsError(
        'not-found',
        'Usuario no encontrado'
      );
    }

    const user = userDoc.docs[0].data();
    const userId = userDoc.docs[0].id;

    // Verificar contraseña (en producción usar bcrypt)
    // Por ahora comparación simple (actualizar a bcrypt después)
    if (user.password !== password) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Contraseña incorrecta'
      );
    }

    // Generar token custom
    const token = await admin.auth().createCustomToken(userId);

    return {
      success: true,
      token,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// REGISTER - Crear nuevo usuario
exports.register = functions.https.onCall(async (data, context) => {
  try {
    const { email, password, name, role } = data;

    if (!email || !password || !name) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email, contraseña y nombre son requeridos'
      );
    }

    // Validar que el rol sea permitido
    if (!['ADMIN', 'VENDEDOR'].includes(role)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Rol inválido'
      );
    }

    // Verificar si el email ya existe
    const existingUser = await admin
      .firestore()
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      throw new functions.https.HttpsError(
        'already-exists',
        'El email ya está registrado'
      );
    }

    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Guardar en Firestore
    await admin
      .firestore()
      .collection('users')
      .doc(userRecord.uid)
      .set({
        email,
        name,
        role,
        password, // En producción: hash con bcrypt
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
      });

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      userId: userRecord.uid,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// LOGOUT - Invalida el token
exports.logout = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuario no autenticado'
      );
    }

    // Revocar todos los tokens del usuario
    await admin.auth().revokeRefreshTokens(context.auth.uid);

    return {
      success: true,
      message: 'Sesión cerrada correctamente',
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// GET USER - Obtener datos del usuario autenticado
exports.getUser = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuario no autenticado'
      );
    }

    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Usuario no encontrado'
      );
    }

    const userData = userDoc.data();
    delete userData.password; // No retornar contraseña

    return {
      success: true,
      user: {
        id: context.auth.uid,
        ...userData,
      },
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
