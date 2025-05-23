import Stripe from 'stripe';
import { config } from '../config/config';

class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(config.stripe.secretKey, {
            apiVersion: '2025-04-30.basil'
        });
    }

    async createCheckoutSession(userId: string) {
        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: config.stripe.priceId,
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${config.frontendUrl}/dashboard?success=true`,
                cancel_url: `${config.frontendUrl}/homepage?canceled=true`,
                metadata: {
                    userId: userId
                }
            });

            return session;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }

    async handleWebhookEvent(event: Stripe.Event) {
        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    const session = event.data.object as Stripe.Checkout.Session;
                    await this.handleSuccessfulPayment(session);
                    break;
                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object as Stripe.PaymentIntent;
                    await this.handleSuccessfulPaymentIntent(paymentIntent);
                    break;
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }
        } catch (error) {
            console.error('Error handling webhook:', error);
            throw error;
        }
    }

    private async handleSuccessfulPayment(session: Stripe.Checkout.Session) {
        // Aquí puedes implementar la lógica para:
        // 1. Actualizar el estado de la suscripción del usuario
        // 2. Enviar email de confirmación
        // 3. Crear registros en la base de datos
        // 4. Etc.
        console.log('Payment successful for session:', session.id);
        if (session.metadata?.userId) {
            // Actualizar el estado del usuario en la base de datos
            console.log('Updating user:', session.metadata.userId);
        }
    }

    private async handleSuccessfulPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
        // Lógica adicional para payment intents exitosos
        console.log('Payment intent succeeded:', paymentIntent.id);
    }

    async verifyPaymentSession(sessionId: string) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            return session.payment_status === 'paid';
        } catch (error) {
            console.error('Error verifying payment session:', error);
            throw error;
        }
    }
}

export const stripeService = new StripeService(); 