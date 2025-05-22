import { Router } from 'express';
import { spotifyController } from '../controllers/spotifyController';

const router = Router();

router.get('/search', spotifyController.searchTracks);

export default router; 