# Arquitectura DEBORA v1

ADMIN: categorías, productos, imágenes, precios, stock, estados, vendedores, ventas y comisiones; puede ver qué vende cada vendedor.

VENDEDOR: acceso privado; consulta catálogo, registra ventas y ve solo sus propias ventas/comisiones.

CLIENTE: catálogo público y WhatsApp.

Base de datos prevista: users, categories, products, inventory_movements, sales, commission_rules.

Reglas: stock 0 = Agotado; stock > 0 = Disponible; una venta descuenta stock; una venta genera comisión; código único con prefijo DE-. Las ventas deben anularse, no borrarse físicamente.

Esta v1 es un prototipo local para validar estructura. Para producción se debe conectar a backend, base de datos, autenticación segura y almacenamiento de imágenes.
