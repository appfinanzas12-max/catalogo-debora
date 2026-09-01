const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp();

// Importar rutas
const auth = require('./auth');
const productos = require('./productos');
const vendedores = require('./vendedores');
const ventas = require('./ventas');
const comisiones = require('./comisiones');
const admin_funcs = require('./admin');

// Exportar todas las funciones
exports.auth = auth;
exports.productos = productos;
exports.vendedores = vendedores;
exports.ventas = ventas;
exports.comisiones = comisiones;
exports.admin = admin_funcs;
