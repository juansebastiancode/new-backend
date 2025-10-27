import { Request, Response } from 'express';
import Usuario from '../models/usuariosModel';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { nombre, email, instagram, telefono, pais, ciudad } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      res.status(200).json({ 
        message: 'Usuario ya existe', 
        user: existingUser 
      });
      return;
    }

    // Crear nuevo usuario
    const newUser = new Usuario({
      nombre,
      email,
      fechaRegistro: Date.now(),
      instagram: instagram || '',
      telefono: telefono || '',
      pais: pais || '',
      ciudad: ciudad || '',
      eliminado: false
    });

    const savedUser = await newUser.save();
    console.log('✅ Usuario guardado en MongoDB:', savedUser.email);
    
    res.status(201).json({ 
      message: 'Usuario creado exitosamente', 
      user: savedUser 
    });
  } catch (error: any) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const user = await Usuario.findOne({ email, eliminado: false });
    
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    
    res.json({ user });
  } catch (error: any) {
    console.error('❌ Error al buscar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await Usuario.find({ eliminado: false });
    res.json({ users });
  } catch (error: any) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const updateData = req.body;
    
    const updatedUser = await Usuario.findOneAndUpdate(
      { email, eliminado: false },
      updateData,
      { new: true }
    );
    
    if (!updatedUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    
    res.json({ 
      message: 'Usuario actualizado exitosamente', 
      user: updatedUser 
    });
  } catch (error: any) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
