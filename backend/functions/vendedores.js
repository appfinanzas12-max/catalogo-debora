const functions = require('firebase-functions');
const admin = require('firebase-admin');

// GET ALL VENDEDORES (Solo ADMIN)
exports.getVendedores = functions.https.onCall(async (data, context) => {
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

    if (!userDoc.exists || userDoc.data().role !== 'ADMIN') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Solo admins pueden ver vendedores'
      );
    }

    const vendedoresSnapshot = await admin
      .firestore()
      .collection('users')
      .where('role', '==', 'VENDEDOR')
      .get();

    const vendedores = [];
    vendedoresSnapshot.forEach((doc) => {
      const data = doc.data();
      delete data.password; // No retornar contraseña
      vendedores.push({
        id: doc.id,
        ...data,
      });
    });

    return {
      success: true,
      data: vendedores,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// GET VENDEDOR BY ID (Solo ADMIN)
exports.getVendedor = functions.https.onCall(async (data, context) => {
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

    if (!userDoc.exists || userDoc.data().role !== 'ADMIN') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Solo admins pueden ver vendedores'
      );
    }

    const { vendedorId } = data;

    if (!vendedorId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ID de vendedor requerido'
      );
    }

    const vendedorDoc = await admin
      .firestore()
      .collection('users')
      .doc(vendedorId)
      .get();

    if (!vendedorDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Vendedor no encontrado'
      );
    }

    const vendedorData = vendedorDoc.data();
    delete vendedorData.password;

    return {
      success: true,
      data: {
        id: vendedorId,
        ...vendedorData,
      },
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// CREATE VENDEDOR (Solo ADMIN)
exports.createVendedor = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuario no autenticado'
      );
    }

    const adminDoc = await admin
      .firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!adminDoc.exists || adminDoc.data().role !== 'ADMIN') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Solo admins pueden crear vendedores'
      );
    }

    const { email, password, name } = data;

    if (!email || !password || !name) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email, contraseña y nombre son requeridos'
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

    // Guardar en Firestore como VENDEDOR
    await admin
      .firestore()
      .collection('users')
      .doc(userRecord.uid)
      .set({
        email,
        name,
        role: 'VENDEDOR',
        password, // En producción: hash con bcrypt
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
        totalSales: 0,
        totalCommission: 0,
      });

    return {
      success: true,
      message: 'Vendedor creado exitosamente',
      vendedorId: userRecord.uid,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// UPDATE VENDEDOR (Solo ADMIN o el vendedor mismo)
exports.updateVendedor = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuario no autenticado'
      );
    }

    const { vendedorId, ...updateData } = data;

    if (!vendedorId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ID de vendedor requerido'
      );
    }

    // Verificar permisos
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    const isAdmin = userDoc.data().role === 'ADMIN';
    const isOwnProfile = context.auth.uid === vendedorId;

    if (!isAdmin && !isOwnProfile) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No tienes permiso para actualizar este vendedor'
      );
    }

    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await admin
      .firestore()
      .collection('users')
      .doc(vendedorId)
      .update(updateData);

    return {
      success: true,
      message: 'Vendedor actualizado exitosamente',
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// DELETE VENDEDOR (Solo ADMIN)
exports.deleteVendedor = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuario no autenticado'
      );
    }

    const adminDoc = await admin
      .firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!adminDoc.exists || adminDoc.data().role !== 'ADMIN') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Solo admins pueden eliminar vendedores'
      );
    }

    const { vendedorId } = data;

    if (!vendedorId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ID de vendedor requerido'
      );
    }

    // Eliminar usuario de Firebase Auth
    await admin.auth().deleteUser(vendedorId);

    // Eliminar de Firestore
    await admin
      .firestore()
      .collection('users')
      .doc(vendedorId)
      .delete();

    return {
      success: true,
      message: 'Vendedor eliminado exitosamente',
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
