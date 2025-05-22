import { Request, Response } from 'express';
import { spotifyService } from '../services/spotifyService';

export const spotifyController = {
    async searchTracks(req: Request, res: Response): Promise<void> {
        const { query } = req.query;

        if (!query || typeof query !== 'string') {
            res.status(400).json({ error: 'Se requiere un término de búsqueda' });
            return;
        }

        try {
            const tracks = await spotifyService.searchTracks(query);

            if (!tracks || tracks.length === 0) {
                res.json({ message: 'No se encontraron resultados' });
                return;
            }

            // Mostrar resultados en la consola del servidor
            tracks.forEach((track: any, index: number) => {
                console.log(`${index + 1}. ${track.name} - ${track.artists.map((artist: any) => artist.name).join(', ')}`);
            });

            res.json(tracks);
        } catch (error: any) {
            console.error('❌ Error en la búsqueda:', error.response?.data || error.message);
            res.status(500).json({ error: 'Error al buscar canciones' });
        }
    }
}; 