import { Router } from 'express';
import { chatWithOpenAI } from '../controllers/openaiController';

const router = Router();

router.post('/chat', chatWithOpenAI);

export default router; 