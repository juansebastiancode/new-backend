import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

class SocketService {
    private io: Server;

    constructor(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });

        this.setupSocketHandlers();
    }

    private setupSocketHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log('🎧 Nuevo cliente conectado');

            socket.on('disconnect', () => {
                console.log('Cliente desconectado');
            });

            socket.on('send-song-to-dj', (track) => {
                console.log('🎵 Canción recibida para el DJ:');
                console.log(track);
                this.io.emit('new-song-for-dj', track);
            });
        });
    }

    getIO(): Server {
        return this.io;
    }
}

export default SocketService; 