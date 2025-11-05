import { Request, Response, RequestHandler } from 'express';
import AssistantDoc from '../models/assistantDoc.model';
import OpenAI from 'openai';

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-4o-mini';

function chunkText(text: string, maxLen = 1200): string[] {
  const parts: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let buf = '';
  for (const p of paragraphs) {
    const add = p.trim();
    if (!add) continue;
    if ((buf + '\n\n' + add).length > maxLen) {
      if (buf) parts.push(buf.trim());
      buf = add;
    } else {
      buf = buf ? buf + '\n\n' + add : add;
    }
  }
  if (buf) parts.push(buf.trim());
  return parts.length ? parts : [text];
}

function cosineSim(a: number[], b: number[]): number {
  if (a.length !== b.length) return -1;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export const uploadDoc: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { projectId, text, metadata } = req.body;
    if (!projectId || !text) {
      res.status(400).json({ error: 'projectId y text requeridos' });
      return;
    }
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔍 OPENAI_API_KEY check:', apiKey ? `Presente (${apiKey.substring(0, 7)}...)` : 'NO ENCONTRADO');
    if (!apiKey) { 
      console.error('OPENAI_API_KEY no configurado en variables de entorno');
      res.status(400).json({ error: 'OPENAI_API_KEY no configurado. Configúralo en las variables de entorno del servidor.' }); 
      return; 
    }
    const client = new OpenAI({ apiKey });

    const chunks = chunkText(text);
    const created: any[] = [];
    for (const ch of chunks) {
      const emb = await client.embeddings.create({ model: EMBEDDING_MODEL, input: ch });
      const vector = emb.data[0].embedding as unknown as number[];
      const doc = await AssistantDoc.create({ projectId, text: ch, embedding: vector, metadata: metadata || {} });
      created.push(doc);
    }
    res.status(201).json({ created: created.length });
  } catch (e) {
    console.error('uploadDoc error', e);
    res.status(500).json({ error: 'Error subiendo documento' });
  }
};

export const searchDocs: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { projectId, q, k } = req.query as any;
    if (!projectId || !q) { res.status(400).json({ error: 'projectId y q requeridos' }); return; }
    const topK = Math.min(Number(k) || 5, 10);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) { res.status(400).json({ error: 'OPENAI_API_KEY no configurado' }); return; }
    const client = new OpenAI({ apiKey });
    const qEmb = await client.embeddings.create({ model: EMBEDDING_MODEL, input: String(q) });
    const qVec = qEmb.data[0].embedding as unknown as number[];

    const docs = await AssistantDoc.find({ projectId }).limit(2000);
    const scored = docs.map(d => ({ d, score: cosineSim(qVec, (d as any).embedding as number[]) }))
      .sort((a,b) => b.score - a.score)
      .slice(0, topK)
      .map(x => ({ _id: x.d._id, text: x.d.text, metadata: x.d.metadata, score: x.score }));
    res.json(scored);
  } catch (e) {
    console.error('searchDocs error', e);
    res.status(500).json({ error: 'Error en búsqueda' });
  }
};

export const answerQuestion: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { projectId, question, k } = req.body;
    if (!projectId || !question) { res.status(400).json({ error: 'projectId y question requeridos' }); return; }
    const topK = Math.min(Number(k) || 5, 10);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) { res.status(400).json({ error: 'OPENAI_API_KEY no configurado' }); return; }
    const client = new OpenAI({ apiKey });

    const qEmb = await client.embeddings.create({ model: EMBEDDING_MODEL, input: question });
    const qVec = qEmb.data[0].embedding as unknown as number[];
    const docs = await AssistantDoc.find({ projectId }).limit(2000);
    const top = docs.map(d => ({ d, score: cosineSim(qVec, (d as any).embedding as number[]) }))
      .sort((a,b) => b.score - a.score)
      .slice(0, topK)
      .map(x => x.d);

    const context = top.map((d) => `${d.text}`).join('\n\n');

    // Filtro de tema: si no hay contexto y la pregunta no trata de M2, responder fijo
    const t = String(question || '').toLowerCase();
    const allowed = ['m2','asesoria','asesoría','fiscal','contabilidad','laboral','consultoría','consultoria','empresa','autónom','autonom','impuestos','iva','irpf','servicios','precios','contacto']
      .some(k => t.includes(k));
    if (!context && !allowed) {
      return res.json({
        answer: 'Solo puedo ayudarte con información de Asesoría M2. ¿Sobre qué servicio te gustaría saber? Puedes escribirnos a m2gmail.com.',
        citations: []
      });
    }
    const system = `Eres un agente comercial de Asesoría M2. Hablas SIEMPRE en español con tono profesional y cercano.\n\nHECHOS FIJOS:\n- Empresa: Asesoría M2.\n- Email de contacto comercial: m2gmail.com.\n\nAlcance permitido:\n- SOLO puedes hablar de la Asesoría M2, sus servicios, procesos y soporte comercial.\n- Si el usuario pregunta por temas no relacionados, responde: \"Solo puedo ayudarte con información de Asesoría M2\" y redirige la conversación a servicios, precios o contacto (m2gmail.com).\n\nPolítica de respuestas y anti-invención:\n- Usa el CONTEXTO cuando exista para datos específicos.\n- No inventes datos que no aparezcan en el CONTEXTO ni en los HECHOS FIJOS. Si faltan datos, dilo y sugiere el siguiente paso.\n- No incluyas marcadores como [C1] en el texto.`;
    const userContent = `Pregunta: ${question}\n\n${context ? 'Contexto:\n' + context : ''}`;

    const chat = await client.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userContent }
      ]
    });
    const answer = chat.choices?.[0]?.message?.content || '';
    const citations = top.map((d: any, i: number) => ({ index: i+1, preview: String(d.text).slice(0, 180), metadata: d.metadata }));
    res.json({ answer, citations });
  } catch (e) {
    console.error('answerQuestion error', e);
    res.status(500).json({ error: 'Error generando respuesta' });
  }
};


