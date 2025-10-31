import mongoose, { Schema } from 'mongoose';
import { encrypt } from '../utils/encryption';

const credentialSchema = new mongoose.Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }, // Encriptado con AES-256
  technology: { type: String, default: 'Other' },
  url: { type: String, default: '' },
  notes: { type: String, default: '' },
  eliminado: { type: Boolean, default: false },
  fechaCreacion: { type: Date, default: Date.now },
});

// Middleware para encriptar contraseña antes de guardar
credentialSchema.pre('save', function(next) {
  // Solo encriptar si la contraseña ha sido modificada o es nueva
  if (!this.isModified('password')) return next();
  
  try {
    // Encriptar contraseña
    this.password = encrypt(this.password);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Middleware para encriptar contraseña antes de actualizar
credentialSchema.pre('findOneAndUpdate', function(next) {
  const update: any = this.getUpdate();
  
  // Si se está actualizando la contraseña, encriptarla
  if (update?.password && typeof update.password === 'string' && !update.password.includes(':')) {
    // Solo encriptar si no parece estar ya encriptado (no contiene ':')
    try {
      update.password = encrypt(update.password);
      this.setUpdate(update);
      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next();
  }
});

// Método para desencriptar contraseña (solo para uso interno)
credentialSchema.methods.decryptPassword = function(): string {
  try {
    const { decrypt } = require('../utils/encryption');
    return decrypt(this.password);
  } catch (error) {
    return '';
  }
};

const Credential = mongoose.model('Credential', credentialSchema);

export default Credential;

