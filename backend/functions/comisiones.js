const functions = require('firebase-functions');
const admin = require('firebase-admin');

// GET COMISIÓN SETTINGS
exports.getComisionSettings = functions.https.onCall(async (data, context) => {
  try {
    const settingsDoc = await admin
      .firestore()
      .collection('settings')
      .doc('commission')
      .get();

    if (!settingsDoc.exists) {
      // Retornar valor por defecto si no existe
      return {
        success: true,
        data: {
          percentageDefault: 10,
          percentageByVendedor: {},
        },
      };
    }

    return {
      success: true,
      data: settingsDoc.data(),
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// UPDATE COMISIÓN SETTINGS (Solo ADMIN)
exports.updateComisionSettings = functions.https.onCall(
  async (data, context) => {
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
          'Solo admins pueden actualizar comisiones'
        );
      }

      const { percentageDefault, percentageByVendedor } = data;

      const updateData = {};
      if (percentageDefault !== undefined) {
        updateData.percentageDefault = percentageDefault;
      }
      if (percentageByVendedor !== undefined) {
        updateData.percentageByVendedor = percentageByVendedor;
      }
      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      await admin
        .firestore()
        .collection('settings')
        .doc('commission')
        .set(updateData, { merge: true });

      return {
        success: true,
        message: 'Configuración de comisiones actualizada',
      };
    } catch (error) {
      throw new functions.https.HttpsError('internal', error.message);
    }
  }
);

// CALCULATE COMISIÓN
exports.calculateComision = functions.https.onCall(async (data, context) => {
  try {
    const { ventaTotal, vendedorId } = data;

    if (!ventaTotal || !vendedorId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'ventaTotal y vendedorId son requeridos'
      );
    }

    // Obtener settings de comisión
    const settingsDoc = await admin
      .firestore()
      .collection('settings')
      .doc('commission')
      .get();

    let percentage = 10; // Default
    if (settingsDoc.exists) {
      const settings = settingsDoc.data();
      // Verificar si hay comisión personalizada para este vendedor
      if (
        settings.percentageByVendedor &&
        settings.percentageByVendedor[vendedorId]
      ) {
        percentage = settings.percentageByVendedor[vendedorId];
      } else if (settings.percentageDefault) {
        percentage = settings.percentageDefault;
      }
    }

    const comisionAmount = (ventaTotal * percentage) / 100;

    return {
      success: true,
      data: {
        percentage,
        comisionAmount,
        ventaTotal,
      },
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// GET COMISIONES BY VENDEDOR
exports.getComisionesByVendedor = functions.https.onCall(
  async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'Usuario no autenticado'
        );
      }

      const { vendedorId } = data;
      const requesterId = context.auth.uid;

      // El vendedor solo puede ver sus propias comisiones
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
          'No tienes permiso para ver estas comisiones'
        );
      }

      // Obtener todas las ventas del vendedor
      const ventasSnapshot = await admin
        .firestore()
        .collection('sales')
        .where('vendedorId', '==', vendedorId)
        .where('status', '==', 'Completada')
        .get();

      // Calcular comisiones
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

      let totalComision = 0;
      const comisiones = [];

      ventasSnapshot.forEach((doc) => {
        const venta = doc.data();
        const comision = (venta.total * percentage) / 100;
        totalComision += comision;
        comisiones.push({
          ventaId: doc.id,
          total: venta.total,
          comision,
          percentage,
          createdAt: venta.createdAt,
        });
      });

      return {
        success: true,
        data: {
          percentage,
          comisiones,
          totalComision,
        },
      };
    } catch (error) {
      throw new functions.https.HttpsError('internal', error.message);
    }
  }
);

// GET ALL COMISIONES (Solo ADMIN)
exports.getAllComisiones = functions.https.onCall(async (data, context) => {
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
        'Solo admins pueden ver todas las comisiones'
      );
    }

    // Obtener todos los vendedores
    const vendedoresSnapshot = await admin
      .firestore()
      .collection('users')
      .where('role', '==', 'VENDEDOR')
      .get();

    // Obtener settings
    const settingsDoc = await admin
      .firestore()
      .collection('settings')
      .doc('commission')
      .get();

    let defaultPercentage = 10;
    let percentageByVendedor = {};
    if (settingsDoc.exists) {
      const settings = settingsDoc.data();
      defaultPercentage = settings.percentageDefault || 10;
      percentageByVendedor = settings.percentageByVendedor || {};
    }

    const comisionesReport = [];

    for (const vendedorDoc of vendedoresSnapshot.docs) {
      const vendedor = vendedorDoc.data();
      const vendedorId = vendedorDoc.id;

      // Obtener ventas completadas
      const ventasSnapshot = await admin
        .firestore()
        .collection('sales')
        .where('vendedorId', '==', vendedorId)
        .where('status', '==', 'Completada')
        .get();

      const percentage =
        percentageByVendedor[vendedorId] || defaultPercentage;
      let totalVentas = 0;
      let totalComision = 0;

      ventasSnapshot.forEach((venta) => {
        const ventaData = venta.data();
        totalVentas += ventaData.total;
        totalComision += (ventaData.total * percentage) / 100;
      });

      comisionesReport.push({
        vendedorId,
        vendedorName: vendedor.name,
        percentage,
        totalVentas,
        totalComision,
      });
    }

    return {
      success: true,
      data: comisionesReport,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
