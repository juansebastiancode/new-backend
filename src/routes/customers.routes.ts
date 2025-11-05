import { Router } from 'express';
import { createCustomer, getCustomers, updateCustomer, deleteCustomer } from '../controllers/customers.controller';

const router = Router();

// Crear cliente
router.post('/customers', createCustomer);

// Obtener clientes (con filtros opcionales: ?projectId=xxx&esCliente=true/false)
router.get('/customers', getCustomers);

// Actualizar cliente
router.put('/customers/:id', updateCustomer);

// Eliminar cliente (soft delete)
router.delete('/customers/:id', deleteCustomer);

export default router;


