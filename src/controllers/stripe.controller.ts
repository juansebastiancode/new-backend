import { Request, Response } from 'express';
import { stripeService } from '../services/stripe.service';
import { config } from '../config/config';
import Stripe from 'stripe';

class StripeController {
    async createCheckoutSession(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado' });
                return;
            }

            const session = await stripeService.createCheckoutSession(userId);
            res.json({ url: session.url });
        } catch (error) {
            console.error('Error in createCheckoutSession:', error);
            res.status(500).json({ error: 'Error al crear la sesión de pago' });
        }
    }

    async handleWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'];

        try {
            if (!sig) {
                res.status(400).json({ error: 'No Stripe signature found' });
                return;
            }

            const stripe = new Stripe(config.stripe.secretKey, {
                apiVersion: '2025-04-30.basil'
            });

            const event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                config.stripe.webhookSecret
            );

            await stripeService.handleWebhookEvent(event);
            res.json({ received: true });
        } catch (error) {
            console.error('Error in webhook:', error);
            res.status(400).json({ error: 'Webhook error' });
        }
    }

    async verifyPayment(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;
            const isPaid = await stripeService.verifyPaymentSession(sessionId);
            res.json({ paid: isPaid });
        } catch (error) {
            console.error('Error in verifyPayment:', error);
            res.status(500).json({ error: 'Error al verificar el pago' });
        }
    }
}

export const stripeController = new StripeController(); 