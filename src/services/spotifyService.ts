import axios from 'axios';
import { config } from '../config/config';

class SpotifyService {
    private accessToken: string = '';

    async getToken(): Promise<void> {
        try {
            const response = await axios.post(
                'https://accounts.spotify.com/api/token',
                new URLSearchParams({ grant_type: 'client_credentials' }),
                {
                    headers: {
                        Authorization: `Basic ${Buffer.from(`${config.spotify.clientId}:${config.spotify.clientSecret}`).toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );
            this.accessToken = response.data.access_token;
            console.log('✅ Token de Spotify obtenido');
        } catch (error: any) {
            console.error('❌ Error obteniendo el token:', error.response?.data || error.message);
            throw error;
        }
    }

    async searchTracks(query: string): Promise<any[]> {
        if (!this.accessToken) {
            await this.getToken();
        }

        try {
            const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=15`, {
                headers: { Authorization: `Bearer ${this.accessToken}` },
            });
            return response.data.tracks.items;
        } catch (error: any) {
            console.error('❌ Error en la búsqueda:', error.response?.data || error.message);
            throw error;
        }
    }
}

export const spotifyService = new SpotifyService(); 