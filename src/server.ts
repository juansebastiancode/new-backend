import express, { Application } from "express";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import { config } from './config/config';
import spotifyRoutes from './routes/spotifyRoutes';
import SocketService from './services/socketService';
import { spotifyService } from './services/spotifyService';
import eventRoutes from './routes/eventRoutes';

const app: Application = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', spotifyRoutes);
app.use('/api', eventRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("¡Servidor funcionando correctamente!");
});

// Conectar a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUrl);
        console.log("✅ Conexión exitosa a MongoDB a la BD de seplay");
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



