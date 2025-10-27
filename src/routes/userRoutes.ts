import { Router } from 'express';
import { createUser, getUserByEmail, getAllUsers, updateUser } from '../controllers/userController';

const router = Router();

// Crear usuario
router.post('/users', createUser);

// Obtener usuario por email
router.get('/users/:email', getUserByEmail);

// Obtener todos los usuarios
router.get('/users', getAllUsers);

// Actualizar usuario
router.put('/users/:email', updateUser);

export default router;
