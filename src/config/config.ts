export const config = {
    port: 3000,
    mongoUrl: "mongodb+srv://developjuansebastian_db_user:AjRlHPRSQrM01mpA@proyectomongodb.ycpota1.mongodb.net/Proyecto?appName=ProyectoMongodb",
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || 'tu_clave_secreta_de_stripe',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'tu_clave_secreta_del_webhook',
        priceId: process.env.STRIPE_PRICE_ID || 'tu_price_id',
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200'
}; 