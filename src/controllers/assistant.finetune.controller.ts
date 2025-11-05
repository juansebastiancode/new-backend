import { Request, Response } from 'express';
import { exportJsonl } from './assistant.controller';
import OpenAI from 'openai';
import fs from 'fs';

export const startFineTune = async (req: Request, res: Response) => {
  try {
    const { projectId, baseModel } = req.body;
    if (!projectId) {
      res.status(400).json({ error: 'projectId requerido' });
      return;
    }
    const model = baseModel || 'gpt-4o-mini';
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(400).json({ error: 'OPENAI_API_KEY no configurado' });
      return;
    }
    const client = new OpenAI({ apiKey });

    const jsonlPath = await exportJsonl(projectId);
    const fileStream = fs.createReadStream(jsonlPath);
    const file = await client.files.create({ file: fileStream, purpose: 'fine-tune' });

    const job = await client.fineTuning.jobs.create({ training_file: file.id, model });
    res.status(200).json({ job });
  } catch (e: any) {
    console.error('Fine-tune error:', e?.message || e);
    res.status(500).json({ error: 'No se pudo iniciar el fine-tune' });
  }
};


