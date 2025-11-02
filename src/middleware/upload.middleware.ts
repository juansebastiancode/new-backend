import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads/invoices');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, uploadsDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    // Nombre único: nombre original (sin extensión) + timestamp + extensión
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext); // Nombre sin extensión
    const timestamp = Date.now();
    // Limpiar el nombre base de caracteres especiales para evitar problemas
    const cleanBasename = basename.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50); // Máximo 50 caracteres
    cb(null, `${cleanBasename}-${timestamp}${ext}`);
  }
});

// Filtro para aceptar solo PDFs
const fileFilter = (_req: any, file: any, cb: FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'));
  }
};

export const uploadInvoice = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

