import { Request, Response, RequestHandler } from 'express';
import AssistantSettings from '../models/assistantSettings.model';

export const getSettings: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query as any;
    if (!projectId) { res.status(400).json({ error: 'projectId requerido' }); return; }
    const doc = await AssistantSettings.findOne({ projectId });
    res.json({ systemInstructions: doc?.systemInstructions || '' });
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo ajustes' });
  }
};

export const saveSettings: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { projectId, systemInstructions } = req.body;
    if (!projectId) { res.status(400).json({ error: 'projectId requerido' }); return; }
    const text = (systemInstructions || '').toString();
    const doc = await AssistantSettings.findOneAndUpdate(
      { projectId },
      { $set: { systemInstructions: text } },
      { upsert: true, new: true }
    );
    res.json({ ok: true, settings: { systemInstructions: doc.systemInstructions } });
  } catch (e) {
    res.status(500).json({ error: 'Error guardando ajustes' });
  }
};


