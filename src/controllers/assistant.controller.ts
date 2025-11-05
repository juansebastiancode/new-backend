import { Request, Response } from 'express';
import AssistantSample from '../models/assistantSample.model';
import fs from 'fs';
import path from 'path';

export const createSample = async (req: Request, res: Response) => {
  try {
    const { projectId, text } = req.body;
    if (!projectId || !text) {
      res.status(400).json({ error: 'projectId y text son requeridos' });
      return;
    }
    const doc = await AssistantSample.create({ projectId, text });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: 'Error creando ejemplo' });
  }
};

export const listSamples = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query as any;
    const q: any = projectId ? { projectId } : {};
    const docs = await AssistantSample.find(q).sort({ createdAt: -1 });
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: 'Error listando ejemplos' });
  }
};

export const deleteSample = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AssistantSample.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error eliminando ejemplo' });
  }
};

// Genera un archivo JSONL en /tmp para enviar a OpenAI
export const exportJsonl = async (projectId: string): Promise<string> => {
  const samples = await AssistantSample.find({ projectId }).sort({ createdAt: 1 });
  const tmpDir = '/tmp';
  const filePath = path.join(tmpDir, `fine_tune_${projectId}.jsonl`);
  const lines = samples.map(s => ({ messages: [{ role: 'user', content: s.text }] }));
  fs.writeFileSync(filePath, lines.map(l => JSON.stringify(l)).join('\n'));
  return filePath;
};



