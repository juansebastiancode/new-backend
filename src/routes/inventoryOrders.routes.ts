import { Router } from 'express';
import { createInventoryOrder, listInventoryOrders, updateInventoryOrder, downloadInvoice, deleteInvoice } from '../controllers/inventoryOrders.controller';
import { uploadInvoice } from '../middleware/upload.middleware';

const router = Router();

router.post('/inventory-orders', uploadInvoice.single('facturaPdf'), createInventoryOrder);
router.get('/inventory-orders', listInventoryOrders);
router.put('/inventory-orders/:id', uploadInvoice.single('facturaPdf'), updateInventoryOrder);
router.get('/inventory-orders/:id/invoice', downloadInvoice);
router.delete('/inventory-orders/:id/invoice', deleteInvoice);

export default router;


