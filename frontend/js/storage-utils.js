// Utilidades para Cloudinary y PDF

class StorageUtils {
  static CLOUDINARY_CLOUD_NAME = "bgfmynka"; // Tu Cloud Name
  static CLOUDINARY_UPLOAD_PRESET = "unsigned_preset"; // Lo crearemos

  // Subir imagen a Cloudinary
  static async uploadImage(file) {
    try {
      if (!file) throw new Error('No file selected');

      // Validar imagen
      this.validateImage(file);

      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.CLOUDINARY_UPLOAD_PRESET);

      // Subir a Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();

      return {
        success: true,
        url: data.secure_url,
        path: data.public_id
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Eliminar imagen
  static async deleteImage(publicId) {
    try {
      // Para eliminar se necesita API server-side
      // Por ahora solo guardamos la URL
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // Validar archivo
  static validateImage(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Solo se permiten imágenes JPG, PNG o WEBP');
    }

    if (file.size > maxSize) {
      throw new Error('La imagen no puede ser mayor a 5MB');
    }

    return true;
  }
}

// Clase para generar PDF
class PDFGenerator {
  // Generar PDF del catálogo
  static generateCatalogoPDF(productos, empresaNombre = 'DEBORA') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(20);
    doc.text(empresaNombre, 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Catálogo de Productos', 105, 28, { align: 'center' });
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 105, 34, {
      align: 'center',
    });

    // Línea separadora
    doc.setDrawColor(200);
    doc.line(20, 38, 190, 38);

    // Productos
    let yPosition = 45;
    doc.setFontSize(11);
    doc.setTextColor(0);

    productos.forEach((producto, index) => {
      // Verificar si cabe en la página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Número de producto
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${producto.code}`, 20, yPosition);

      // Nombre
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(producto.name, 20, yPosition + 6);

      // Detalles
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(80, 80, 80);

      yPosition += 12;
      doc.text(`Categoría: ${producto.category}`, 25, yPosition);

      yPosition += 5;
      doc.text(`Precio: $${producto.price.toLocaleString('es-CO')}`, 25, yPosition);

      yPosition += 5;
      doc.text(`Stock: ${producto.stock} unidades`, 25, yPosition);

      yPosition += 5;
      doc.text(`Estado: ${producto.status}`, 25, yPosition);

      if (producto.description) {
        yPosition += 5;
        const descripcion = doc.splitTextToSize(
          `Descripción: ${producto.description}`,
          170
        );
        doc.text(descripcion, 25, yPosition);
        yPosition += descripcion.length * 3;
      }

      // Línea separadora entre productos
      yPosition += 3;
      doc.setDrawColor(220);
      doc.line(20, yPosition, 190, yPosition);

      yPosition += 5;
    });

    // Pie de página
    const totalPages = doc.internal.getPages().length;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${totalPages}`,
        105,
        285,
        { align: 'center' }
      );
      doc.text('DEBORA © 2026 | WhatsApp: +57 322 4079955', 105, 290, {
        align: 'center',
      });
    }

    return doc;
  }

  // Generar PDF de inventario
  static generateInventarioPDF(productos) {
    const doc = this.generateCatalogoPDF(productos, 'Inventario DEBORA');
    return doc;
  }

  // Descargar PDF
  static downloadPDF(doc, nombreArchivo = 'catalogo.pdf') {
    doc.save(nombreArchivo);
  }
}
