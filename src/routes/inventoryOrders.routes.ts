import { Router } from 'express';
import { createInventoryOrder, listInventoryOrders, updateInventoryOrder } from '../controllers/inventoryOrders.controller';

const router = Router();

router.post('/inventory-orders', createInventoryOrder);
router.get('/inventory-orders', listInventoryOrders);
router.put('/inventory-orders/:id', updateInventoryOrder);

export default router;


