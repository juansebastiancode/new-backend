import { Request, Response, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { MapAnnotationModel } from '../models/mapAnnotation.model';

export const listAnnotations: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params as any;
    if (!projectId) { res.status(400).json({ error: 'projectId requerido' }); return; }
    let pid: mongoose.Types.ObjectId;
    try { pid = new mongoose.Types.ObjectId(projectId); } catch { res.status(400).json({ error: 'projectId inválido' }); return; }
    const items = await MapAnnotationModel.find({ projectId: pid }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Error listando anotaciones' });
  }
};

export const createAnnotation: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { projectId, lat, lng, text } = req.body || {};
    if (!projectId || lat == null || lng == null) { res.status(400).json({ error: 'projectId, lat y lng requeridos' }); return; }
    let pid: mongoose.Types.ObjectId;
    try { pid = new mongoose.Types.ObjectId(projectId); } catch { res.status(400).json({ error: 'projectId inválido' }); return; }
    const created = await MapAnnotationModel.create({ projectId: pid, lat, lng, text: String(text || '') });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'Error creando anotación' });
  }
};

export const deleteAnnotation: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { projectId, id } = req.params as any;
    if (!projectId || !id) { res.status(400).json({ error: 'projectId e id requeridos' }); return; }
    let pid: mongoose.Types.ObjectId;
    try { pid = new mongoose.Types.ObjectId(projectId); } catch { res.status(400).json({ error: 'projectId inválido' }); return; }
    const deleted = await MapAnnotationModel.findOneAndDelete({ _id: id, projectId: pid });
    if (!deleted) { res.status(404).json({ error: 'Anotación no encontrada' }); return; }
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: 'Error eliminando anotación' });
  }
};


