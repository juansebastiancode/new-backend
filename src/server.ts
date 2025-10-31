import express, { Application } from "express";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import { config } from './config/config';
import spotifyRoutes from './routes/spotifyRoutes';
import SocketService from './services/socketService';
import { spotifyService } from './services/spotifyService';
import eventRoutes from './routes/eventRoutes';
import stripeRoutes from './routes/stripe.routes';
import openaiRoutes from './routes/openaiRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import customersRoutes from './routes/customers.routes';
import proveedoresRoutes from './routes/proveedores.routes';

const app: Application = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', spotifyRoutes);
app.use('/api', eventRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api', userRoutes);
app.use('/api', projectRoutes);
app.use('/api', customersRoutes);
app.use('/api', proveedoresRoutes);

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
    await spotifyService.getToken(); // Obtener token de Spotify al inicio

    server.listen(config.port, () => {
        console.log(`✅ Servidor escuchando en http://localhost:${config.port}`);
    });
};

startServer();



