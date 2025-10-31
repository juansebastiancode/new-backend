import { Router } from 'express';
import { createInventoryItem, getInventoryItems, updateInventoryItem, deleteInventoryItem } from '../controllers/inventory.controller';

const router = Router();

router.post('/inventory', createInventoryItem);
router.get('/inventory', getInventoryItems);
router.put('/inventory/:id', updateInventoryItem);
router.delete('/inventory/:id', deleteInventoryItem);

export default router;

