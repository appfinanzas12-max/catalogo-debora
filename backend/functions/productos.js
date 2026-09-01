const functions = require('firebase-functions');
const admin = require('firebase-admin');

// GET ALL PRODUCTOS
exports.getProductos = functions.https.onCall(async (data, context) => {
  try {
    const productosSnapshot = await admin
      .firestore()
      .collection('products')
      .get();

    const productos = [];
    productosSnapshot.forEach((doc) => {
      productos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: productos,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// GET PRODUCTO BY ID
exports.getProducto = functions.https.onCall(async (data, context) => {
  try {
    const { productoId } = data;

    if (!productoId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ID de producto requerido'
      );
    }

    const productoDoc = await admin
      .firestore()
      .collection('products')
      .doc(productoId)
      .get();

    if (!productoDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Producto no encontrado'
      );
    }

    return {
      success: true,
      data: {
        id: productoId,
        ...productoDoc.data(),
      },
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// CREATE PRODUCTO (Solo ADMIN)
exports.createProducto = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuario no autenticado'
      );
    }

    // Verificar que sea ADMIN
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!userDoc.exists || userDoc.data().role !== 'ADMIN') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Solo admins pueden crear productos'
      );
    }

    const { code, name, category, price, stock, description, imageUrl } = data;

    if (!code || !name || !category || !price) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Campos requeridos: code, name, category, price'
      );
    }

    const newProducto = {
      code,
      name,
      category,
      price,
      stock: stock || 0,
      description: description || '',
      imageUrl: imageUrl || null,
      status: stock > 0 ? 'Disponible' : 'Agotado',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin
      .firestore()
      .collection('products')
      .add(newProducto);

    return {
      success: true,
      message: 'Producto creado exitosamente',
      productId: docRef.id,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// UPDATE PRODUCTO (Solo ADMIN)
exports.updateProducto = functions.https.onCall(async (data, context) => {
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
        'Solo admins pueden actualizar productos'
      );
    }

    const { productoId, ...updateData } = data;

    if (!productoId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ID de producto requerido'
      );
    }

    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // Actualizar estado basado en stock
    if (updateData.stock !== undefined) {
      updateData.status = updateData.stock > 0 ? 'Disponible' : 'Agotado';
    }

    await admin
      .firestore()
      .collection('products')
      .doc(productoId)
      .update(updateData);

    return {
      success: true,
      message: 'Producto actualizado exitosamente',
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// DELETE PRODUCTO (Solo ADMIN)
exports.deleteProducto = functions.https.onCall(async (data, context) => {
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
        'Solo admins pueden eliminar productos'
      );
    }

    const { productoId } = data;

    if (!productoId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ID de producto requerido'
      );
    }

    await admin
      .firestore()
      .collection('products')
      .doc(productoId)
      .delete();

    return {
      success: true,
      message: 'Producto eliminado exitosamente',
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// GET PRODUCTOS POR CATEGORIA
exports.getProductosByCategoria = functions.https.onCall(
  async (data, context) => {
    try {
      const { categoria } = data;

      if (!categoria) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Categoría requerida'
        );
      }

      const productosSnapshot = await admin
        .firestore()
        .collection('products')
        .where('category', '==', categoria)
        .get();

      const productos = [];
      productosSnapshot.forEach((doc) => {
        productos.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        data: productos,
      };
    } catch (error) {
      throw new functions.https.HttpsError('internal', error.message);
    }
  }
);
