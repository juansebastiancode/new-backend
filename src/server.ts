import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from "express";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import path from "path";
import { config } from './config/config';
import SocketService from './services/socketService';
import eventRoutes from './routes/eventRoutes';
import stripeRoutes from './routes/stripe.routes';
import openaiRoutes from './routes/openaiRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import customersRoutes from './routes/customers.routes';
import proveedoresRoutes from './routes/proveedores.routes';
import inventoryRoutes from './routes/inventory.routes';
import inventoryOrdersRoutes from './routes/inventoryOrders.routes';
import customerOrdersRoutes from './routes/customerOrders.routes';
import credentialsRoutes from './routes/credentials.routes';
import invitationsRoutes from './routes/invitations.routes';
import assistantRoutes from './routes/assistant.routes';

const app: Application = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para parsear FormData

// Servir archivos estáticos de facturas
app.use('/api/uploads/invoices', express.static(path.join(__dirname, '../uploads/invoices')));
// Servir archivos estáticos de audio
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api', eventRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api', userRoutes);
app.use('/api', projectRoutes);
app.use('/api', customersRoutes);
app.use('/api', proveedoresRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', inventoryOrdersRoutes);
app.use('/api', customerOrdersRoutes);
app.use('/api', credentialsRoutes);
app.use('/api', invitationsRoutes);
app.use('/api', assistantRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("¡Servidor funcionando correctamente!");
});

// Conectar a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUrl);
        console.log("✅ Conexión exitosa a MongoDB - Base de datos: Proyecto");
    } catch (error) {
        console.error("❌ Error al conectar a MongoDB:", error);
        process.exit(1);
    }
};

// Inicializar Socket.IO
const socketService = new SocketService(server);

// Iniciar el servidor
const startServer = async () => {
    await connectDB();

    server.listen(config.port, () => {
        console.log(`✅ Servidor escuchando en http://localhost:${config.port}`);
    });
};

startServer();



