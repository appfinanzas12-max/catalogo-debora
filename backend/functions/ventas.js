const functions = require('firebase-functions');
const admin = require('firebase-admin');

// CREAR VENTA
exports.createVenta = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuario no autenticado'
      );
    }

    const { productoId, quantity, vendedorId } = data;

    if (!productoId || !quantity || !vendedorId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'productoId, quantity y vendedorId son requeridos'
      );
    }

    // Obtener producto
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

    const producto = productoDoc.data();

    // Verificar stock
    if (producto.stock < quantity) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Stock insuficiente'
      );
    }

    // Calcular total
    const total = producto.price * quantity;

    // Crear documento de venta
    const newVenta = {
      productoId,
      vendedorId,
      quantity,
      price: producto.price,
      total,
      status: 'Completada',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ventaRef = await admin
      .firestore()
      .collection('sales')
      .add(newVenta);

    // Actualizar stock del producto
    const newStock = producto.stock - quantity;
    await admin
      .firestore()
      .collection('products')
      .doc(productoId)
      .update({
        stock: newStock,
        status: newStock > 0 ? 'Disponible' : 'Agotado',
      });

    // Actualizar totalSales del vendedor
    const vendedorDoc = await admin
      .firestore()
      .collection('users')
      .doc(vendedorId)
      .get();

    const vendedorCurrentSales = vendedorDoc.data().totalSales || 0;
    await admin
      .firestore()
      .collection('users')
      .doc(vendedorId)
      .update({
        totalSales: vendedorCurrentSales + total,
      });

    return {
      success: true,
      message: 'Venta registrada exitosamente',
      ventaId: ventaRef.id,
      total,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// GET VENTA BY ID
exports.getVenta = functions.https.onCall(async (data, context) => {
  try {
    const { ventaId } = data;

    if (!ventaId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ID de venta requerido'
      );
    }

    const ventaDoc = await admin
      .firestore()
      .collection('sales')
      .doc(ventaId)
      .get();

    if (!ventaDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Venta no encontrada'
      );
    }

    return {
      success: true,
      data: {
        id: ventaId,
        ...ventaDoc.data(),
      },
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// GET ALL VENTAS (Solo ADMIN)
exports.getAllVentas = functions.https.onCall(async (data, context) => {
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
        'Solo admins pueden ver todas las ventas'
      );
    }

    const ventasSnapshot = await admin
      .firestore()
      .collection('sales')
      .orderBy('createdAt', 'desc')
      .get();

    const ventas = [];
    ventasSnapshot.forEach((doc) => {
      ventas.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: ventas,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// GET VENTAS BY VENDEDOR
exports.getVentasByVendedor = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuario no autenticado'
      );
    }

    const { vendedorId } = data;
    const requesterId = context.auth.uid;

    // El vendedor solo puede ver sus propias ventas
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(requesterId)
      .get();

    const isAdmin = userDoc.data().role === 'ADMIN';
    const isOwnData = requesterId === vendedorId;

    if (!isAdmin && !isOwnData) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No tienes permiso para ver estas ventas'
      );
    }

    const ventasSnapshot = await admin
      .firestore()
      .collection('sales')
      .where('vendedorId', '==', vendedorId)
      .orderBy('createdAt', 'desc')
      .get();

    const ventas = [];
    ventasSnapshot.forEach((doc) => {
      ventas.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: ventas,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// CANCEL VENTA (Marcar como cancelada, no eliminar)
exports.cancelVenta = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuario no autenticado'
      );
    }

    const { ventaId } = data;

    if (!ventaId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ID de venta requerido'
      );
    }

    const ventaDoc = await admin
      .firestore()
      .collection('sales')
      .doc(ventaId)
      .get();

    if (!ventaDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Venta no encontrada'
      );
    }

    const venta = ventaDoc.data();

    // Marcar como cancelada
    await admin
      .firestore()
      .collection('sales')
      .doc(ventaId)
      .update({
        status: 'Cancelada',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Devolver stock
    const productoDoc = await admin
      .firestore()
      .collection('products')
      .doc(venta.productoId)
      .get();

    const producto = productoDoc.data();
    const newStock = producto.stock + venta.quantity;

    await admin
      .firestore()
      .collection('products')
      .doc(venta.productoId)
      .update({
        stock: newStock,
        status: newStock > 0 ? 'Disponible' : 'Agotado',
      });

    // Actualizar totalSales del vendedor
    const vendedorDoc = await admin
      .firestore()
      .collection('users')
      .doc(venta.vendedorId)
      .get();

    const vendedorCurrentSales = vendedorDoc.data().totalSales || 0;
    await admin
      .firestore()
      .collection('users')
      .doc(venta.vendedorId)
      .update({
        totalSales: Math.max(0, vendedorCurrentSales - venta.total),
      });

    return {
      success: true,
      message: 'Venta cancelada exitosamente',
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
