import Usuario from '../models/usuariosModel';

export const registerUserFromFirebase = async (firebaseUser: any) => {
  try {
    const { displayName, email, photoURL } = firebaseUser;
    
    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      console.log('✅ Usuario ya existe en MongoDB:', email);
      return existingUser;
    }

    // Crear nuevo usuario
    const newUser = new Usuario({
      nombre: displayName || email?.split('@')[0] || 'Usuario',
      email: email,
      fechaRegistro: Date.now(),
      instagram: '',
      telefono: '',
      pais: '',
      ciudad: '',
      eliminado: false
    });

    const savedUser = await newUser.save();
    console.log('✅ Nuevo usuario guardado en MongoDB:', savedUser.email);
    
    return savedUser;
  } catch (error: any) {
    console.error('❌ Error al registrar usuario desde Firebase:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await Usuario.findOne({ email, eliminado: false });
    return user;
  } catch (error: any) {
    console.error('❌ Error al buscar usuario:', error);
    throw error;
  }
};

export const updateUserProfile = async (email: string, updateData: any) => {
  try {
    const updatedUser = await Usuario.findOneAndUpdate(
      { email, eliminado: false },
      updateData,
      { new: true }
    );
    return updatedUser;
  } catch (error: any) {
    console.error('❌ Error al actualizar perfil:', error);
    throw error;
  }
};
