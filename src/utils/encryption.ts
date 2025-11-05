import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// Obtener o generar una clave de encriptación
function getEncryptionKey(): Buffer {
  let ENCRYPTION_KEY_RAW = process.env.CREDENTIALS_ENCRYPTION_KEY;
  
  if (!ENCRYPTION_KEY_RAW) {
    // Si no hay variable de entorno, usar una clave fija por defecto (para desarrollo)
    // En producción, SIEMPRE debe establecerse CREDENTIALS_ENCRYPTION_KEY
    console.warn('⚠️  ADVERTENCIA: CREDENTIALS_ENCRYPTION_KEY no está definida. Usando clave por defecto (no seguro para producción)');
    ENCRYPTION_KEY_RAW = 'default-encryption-key-for-development-only-not-secure-for-production-use-this-key-only-for-testing';
  }

  // Asegurar que la clave tenga exactamente 32 bytes (64 caracteres hex)
  if (ENCRYPTION_KEY_RAW.length >= 64 && /^[0-9a-fA-F]+$/.test(ENCRYPTION_KEY_RAW)) {
    // Si es hex string de 64+ caracteres, tomar los primeros 64
    return Buffer.from(ENCRYPTION_KEY_RAW.slice(0, 64), 'hex');
  } else {
    // Si es más corto o no es hex, derivar una clave de 32 bytes usando SHA-256
    return crypto.createHash('sha256').update(ENCRYPTION_KEY_RAW).digest();
  }
}

const ENCRYPTION_KEY = getEncryptionKey();

// Función para encriptar
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error: any) {
    console.error('❌ Error encriptando:', error.message);
    throw error;
  }
}

// Función para desencriptar
export function decrypt(text: string): string {
  try {
    if (!text || !text.includes(':')) {
      console.error('❌ Error: Texto encriptado inválido (no contiene :)');
      throw new Error('Texto encriptado inválido');
    }
    const parts = text.split(':');
    if (parts.length < 2) {
      console.error('❌ Error: Formato de texto encriptado inválido');
      throw new Error('Formato de texto encriptado inválido');
    }
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = parts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error: any) {
    console.error('❌ Error desencriptando:', error.message);
    throw error;
  }
}


