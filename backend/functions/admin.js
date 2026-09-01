const functions = require('firebase-functions');
const admin = require('firebase-admin');

// GET DASHBOARD DATA (Solo ADMIN)
exports.getDashboard = functions.https.onCall(async (data, context) => {
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
        'Solo admins pueden acceder al dashboard'
      );
    }

    // Contar productos
    const productosSnapshot = await admin
      .firestore()
      .collection('products')
      .get();
    const totalProductos = productosSnapshot.size;

    // Contar stock total
    let totalStock = 0;
    productosSnapshot.forEach((doc) => {
      totalStock += doc.data().stock;
    });

    // Contar vendedores
    const vendedoresSnapshot = await admin
      .firestore()
      .collection('users')
      .where('role', '==', 'VENDEDOR')
      .get();
    const totalVendedores = vendedoresSnapshot.size;

    // Contar categorías
    const categoriasSnapshot = await admin
      .firestore()
      .collection('categories')
      .get();
    const totalCategorias = categoriasSnapshot.size;

    // Obtener ventas totales
    const ventasSnapshot = await admin
      .firestore()
      .collection('sales')
      .where('status', '==', 'Completada')
      .get();
    let totalVentas = 0;
    ventasSnapshot.forEach((doc) => {
      totalVentas += doc.data().total;
    });

    // Calcular comisiones totales
    let totalComisiones = 0;
    const settingsDoc = await admin
      .firestore()
      .collection('settings')
      .doc('commission')
      .get();

    let defaultPercentage = 10;
    if (settingsDoc.exists) {
      defaultPercentage = settingsDoc.data().percentageDefault || 10;
    }

    ventasSnapshot.forEach((doc) => {
      const venta = doc.data();
      totalComisiones += (venta.total * defaultPercentage) / 100;
    });

    return {
      success: true,
      data: {
        totalProductos,
        totalStock,
        totalVendedores,
        totalCategorias,
        totalVentas,
        totalComisiones,
        lastUpdated: new Date().toISOString(),
      },
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// GET CATEGORIAS
exports.getCategorias = functions.https.onCall(async (data, context) => {
  try {
    const categoriasSnapshot = await admin
      .firestore()
      .collection('categories')
      .get();

    const categorias = [];
    categoriasSnapshot.forEach((doc) => {
      categorias.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: categorias,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// CREATE CATEGORIA (Solo ADMIN)
exports.createCategoria = functions.https.onCall(async (data, context) => {
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
        'Solo admins pueden crear categorías'
      );
    }

    const { name, description, imageUrl } = data;

    if (!name) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Nombre de categoría requerido'
      );
    }

    const newCategoria = {
      name,
      description: description || '',
      imageUrl: imageUrl || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin
      .firestore()
      .collection('categories')
      .add(newCategoria);

    return {
      success: true,
      message: 'Categoría creada exitosamente',
      categoriaId: docRef.id,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// UPDATE CATEGORIA (Solo ADMIN)
exports.updateCategoria = functions.https.onCall(async (data, context) => {
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
        'Solo admins pueden actualizar categorías'
      );
    }

    const { categoriaId, ...updateData } = data;

    if (!categoriaId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ID de categoría requerido'
      );
    }

    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await admin
      .firestore()
      .collection('categories')
      .doc(categoriaId)
      .update(updateData);

    return {
      success: true,
      message: 'Categoría actualizada exitosamente',
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// DELETE CATEGORIA (Solo ADMIN)
exports.deleteCategoria = functions.https.onCall(async (data, context) => {
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
        'Solo admins pueden eliminar categorías'
      );
    }

    const { categoriaId } = data;

    if (!categoriaId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ID de categoría requerido'
      );
    }

    await admin
      .firestore()
      .collection('categories')
      .doc(categoriaId)
      .delete();

    return {
      success: true,
      message: 'Categoría eliminada exitosamente',
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// GET STATS VENDEDOR (Solo ADMIN)
exports.getVendedorStats = functions.https.onCall(async (data, context) => {
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
        'Solo admins pueden ver estadísticas'
      );
    }

    const { vendedorId } = data;

    if (!vendedorId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ID de vendedor requerido'
      );
    }

    // Obtener datos del vendedor
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

    const vendedor = vendedorDoc.data();

    // Obtener ventas
    const ventasSnapshot = await admin
      .firestore()
      .collection('sales')
      .where('vendedorId', '==', vendedorId)
      .where('status', '==', 'Completada')
      .get();

    let totalVentas = 0;
    let cantidadVentas = 0;
    ventasSnapshot.forEach((doc) => {
      totalVentas += doc.data().total;
      cantidadVentas += 1;
    });

    // Calcular comisión
    const settingsDoc = await admin
      .firestore()
      .collection('settings')
      .doc('commission')
      .get();

    let percentage = 10;
    if (settingsDoc.exists) {
      const settings = settingsDoc.data();
      if (
        settings.percentageByVendedor &&
        settings.percentageByVendedor[vendedorId]
      ) {
        percentage = settings.percentageByVendedor[vendedorId];
      } else if (settings.percentageDefault) {
        percentage = settings.percentageDefault;
      }
    }

    const totalComision = (totalVentas * percentage) / 100;

    return {
      success: true,
      data: {
        vendedorId,
        vendedorName: vendedor.name,
        email: vendedor.email,
        totalVentas,
        cantidadVentas,
        percentage,
        totalComision,
      },
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
