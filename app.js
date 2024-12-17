import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 8080;

// Ruta persistente con un volumen persistente '/data/uploads')
const uploadDir = '/data/uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {recursive: true});
}

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({storage});

// Ruta para subir imágenes
app.post('/upload', upload.single('image'), (req, res) => {
  res.send({message: 'Imagen subida correctamente', file: req.file});
});

// Ruta para listar imágenes con URLs completas
app.get('/images', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Error al listar las imágenes');
    }

    const fileList = files.map((file) => ({
      filename: file,
      url: `${req.protocol}://${req.get('host')}/uploads/${file}` // URL completa
    }));

    res.send(fileList);
  });
});

// Ruta para eliminar imágenes
app.delete('/images/:filename', (req, res) => {
  const filepath = path.join(uploadDir, req.params.filename);
  fs.unlink(filepath, (err) => {
    if (err) {
      return res.status(500).send('Error al eliminar la imagen');
    }
    res.send('Imagen eliminada correctamente');
  });
});

// Servir las imágenes estáticamente desde la carpeta persistente
app.use('/uploads', express.static(uploadDir));
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});