import { Router } from 'express';
import { createProveedor, getProveedores, updateProveedor, deleteProveedor } from '../controllers/proveedores.controller';

const router = Router();

router.post('/suppliers', createProveedor);
router.get('/suppliers', getProveedores);
router.put('/suppliers/:id', updateProveedor);
router.delete('/suppliers/:id', deleteProveedor);

export default router;


