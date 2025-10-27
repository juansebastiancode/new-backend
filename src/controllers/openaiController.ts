import { Request, Response } from 'express';
import { getOpenAIResponse } from '../services/openaiService';

export const chatWithOpenAI = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'El campo messages es requerido y debe ser un array.' });
      return;
    }
    const openaiResponse = await getOpenAIResponse(messages);
    res.json(openaiResponse);
  } catch (error: any) {
    console.error('Error en chatWithOpenAI:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}; 