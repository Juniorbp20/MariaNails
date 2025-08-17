const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configuración de CORS más permisiva
app.use(cors({
  origin: '*',
  methods: ['GET']
}));

// Ruta para verificar el servidor
app.get('/ping', (req, res) => {
  res.json({
    status: 'online',
    imagesPath: path.join(__dirname, 'img', 'galeria'),
    files: fs.readdirSync(path.join(__dirname, 'img', 'galeria'))
  });
});
// Servir archivos estáticos (IMPORTANTE: usa path absoluto)
app.use('/img', express.static(path.join(__dirname, 'img'), {
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

// API mejorada con manejo de errores
app.get('/api/galeria', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 30; // Cambiado a 30 por defecto
    const galleryPath = path.join(__dirname, 'img', 'galeria');

    // Verificar si existe el directorio
    if (!fs.existsSync(galleryPath)) {
      return res.status(404).json({ error: 'Carpeta de galería no encontrada' });
    }

    fs.readdir(galleryPath, (err, files) => {
      if (err) {
        console.error('Error al leer galería:', err);
        return res.status(500).json({ 
          error: 'Error del servidor',
          details: err.message 
        });
      }

      const images = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
        })
        .map(file => `/img/galeria/${encodeURIComponent(file)}`); // Codificar nombres de archivo

      if (images.length === 0) {
        return res.status(404).json({ 
          warning: 'No se encontraron imágenes',
          suggestion: 'Verifica la carpeta img/galeria'
        });
      }

      const totalPages = Math.ceil(images.length / perPage);
      const paginatedImages = images.slice(
        (page - 1) * perPage,
        page * perPage
      );

      res.json({
        success: true,
        images: paginatedImages,
        currentPage: page,
        totalPages,
        totalImages: images.length
      });
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Ruta de prueba
app.get('/test', (req, res) => {
  res.send('¡El servidor está funcionando correctamente!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
  console.log(`📂 Ruta de imágenes: ${path.join(__dirname, 'img', 'galeria')}`);
});