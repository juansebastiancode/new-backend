import { Request, Response } from 'express';
import Credential from '../models/credential.model';
import { decrypt } from '../utils/encryption';

export const createCredential = async (req: Request, res: Response) => {
  try {
    const credential = new Credential(req.body);
    // La contraseña se encriptará automáticamente en el pre-save hook
    const saved = await credential.save();
    // No devolver la contraseña encriptada
    const { password, ...response } = saved.toObject();
    res.status(201).json({ message: 'Credencial creada', credential: response });
  } catch (error: any) {
    console.error('❌ Error creando credencial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const getCredentials = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const query: any = { eliminado: false };
    if (projectId) query.projectId = projectId;
    
    const credentials = await Credential.find(query)
      .select('-password') // Excluir contraseñas de la respuesta
      .sort({ fechaCreacion: -1 });
    
    res.json(credentials);
  } catch (error) {
    console.error('❌ Error obteniendo credenciales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const getCredential = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const credential = await Credential.findById(id);
    
    if (!credential || credential.eliminado) {
      res.status(404).json({ error: 'Credencial no encontrada' });
      return;
    }
    
    // No devolver la contraseña encriptada
    const { password, ...response } = credential.toObject();
    
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error obteniendo credencial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const updateCredential = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Si se actualiza la contraseña, se encriptará en el pre-update hook
    const updated = await Credential.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      res.status(404).json({ error: 'Credencial no encontrada' });
      return;
    }
    
    // No devolver la contraseña encriptada
    const { password, ...response } = updated.toObject();
    
    res.status(200).json({ 
      message: 'Credencial actualizada exitosamente', 
      credential: response 
    });
  } catch (error: any) {
    console.error('❌ Error actualizando credencial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const deleteCredential = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Credential.findByIdAndUpdate(
      id,
      { eliminado: true },
      { new: true }
    );
    
    if (!deleted) {
      res.status(404).json({ error: 'Credencial no encontrada' });
      return;
    }
    
    res.status(200).json({ message: 'Credencial eliminada exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando credencial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Endpoint especial para obtener contraseña desencriptada (solo para mostrar)
export const getCredentialPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const credential = await Credential.findById(id);
    
    if (!credential || credential.eliminado) {
      res.status(404).json({ error: 'Credencial no encontrada' });
      return;
    }
    
    // Desencriptar contraseña para mostrarla
    let decryptedPassword: string;
    try {
      decryptedPassword = decrypt(credential.password);
    } catch (error: any) {
      console.error('❌ Error: No se pudo desencriptar la contraseña para credencial:', id, error.message);
      res.status(500).json({ 
        error: 'Error al desencriptar la contraseña. Es posible que la clave de encriptación haya cambiado.',
        details: 'Si acabas de reiniciar el servidor, asegúrate de tener CREDENTIALS_ENCRYPTION_KEY configurada en .env'
      });
      return;
    }
    
    if (!decryptedPassword) {
      console.error('❌ Error: Contraseña desencriptada vacía para credencial:', id);
      res.status(500).json({ error: 'Error al desencriptar la contraseña' });
      return;
    }
    
    res.status(200).json({ 
      password: decryptedPassword,
      encrypted: true
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo contraseña:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

