import { Router } from 'express';
import { createCustomerOrder, listCustomerOrders, updateCustomerOrder, deleteCustomerOrder, downloadInvoice, deleteInvoice } from '../controllers/customerOrders.controller';
import { uploadInvoice } from '../middleware/upload.middleware';

const router = Router();

router.post('/customer-orders', uploadInvoice.single('facturaPdf'), createCustomerOrder);
router.get('/customer-orders', listCustomerOrders);
router.put('/customer-orders/:id', uploadInvoice.single('facturaPdf'), updateCustomerOrder);
router.delete('/customer-orders/:id', deleteCustomerOrder);
router.get('/customer-orders/:id/invoice', downloadInvoice);
router.delete('/customer-orders/:id/invoice', deleteInvoice);

export default router;

