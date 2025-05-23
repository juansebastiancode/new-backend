import { Router, Request, Response } from 'express';
import { stripeController } from '../controllers/stripe.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import express from 'express';

const router = Router();

// Configuración necesaria para webhooks de Stripe
// Esta ruta debe ir antes de las demás rutas
router.post(
    '/webhook',
    express.raw({type: 'application/json'}),
    (req: Request, res: Response): void => {
        stripeController.handleWebhook(req, res);
    }
);

// Ruta para crear una sesión de checkout
// Requiere autenticación
router.post(
    '/create-checkout-session',
    authMiddleware,
    (req: Request, res: Response): void => {
        stripeController.createCheckoutSession(req, res);
    }
);

// Ruta para verificar el estado de un pago
// Requiere autenticación
router.get(
    '/verify-payment/:sessionId',
    authMiddleware,
    (req: Request, res: Response): void => {
        stripeController.verifyPayment(req, res);
    }
);

export default router; 