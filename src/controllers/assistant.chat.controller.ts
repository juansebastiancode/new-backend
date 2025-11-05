import { Request, Response } from 'express';
import OpenAI from 'openai';
import AssistantDoc from '../models/assistantDoc.model';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-4o-mini';
const TTS_MODEL = process.env.TTS_MODEL || 'tts-1';
const TTS_VOICE = process.env.TTS_VOICE || 'alloy';

function isAllowedTopic(text: string): boolean {
  const t = (text || '').toLowerCase();
  const keywords = ['m2', 'asesoria', 'asesoría', 'fiscal', 'contabilidad', 'laboral', 'consultoría', 'consultoria', 'empresa', 'autónom', 'autonom', 'impuestos', 'iva', 'irpf', 'servicios', 'precios', 'contacto'];
  return keywords.some(k => t.includes(k));
}

// Función para buscar documentos relevantes usando RAG
async function searchDocsInternal(projectId: string, query: string, k: number = 5): Promise<any[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];
  const client = new OpenAI({ apiKey });

  const queryEmbedding = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query
  });
  const queryVector = queryEmbedding.data[0].embedding as unknown as number[];

  const allDocs = await AssistantDoc.find({ projectId });
  const scored = allDocs.map(doc => {
    const sim = cosineSimilarity(queryVector, doc.embedding);
    return { ...doc.toObject(), sim };
  });
  scored.sort((a, b) => b.sim - a.sim);
  return scored.slice(0, k).filter(d => d.sim > 0.3);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return -1;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export const chatWithAudio = async (req: Request, res: Response) => {
  try {
    const { projectId, assistantName, voice, systemInstructions } = req.body;
    const audioFile = req.file;

    if (!projectId) {
      res.status(400).json({ error: 'projectId requerido' });
      return;
    }

    if (!audioFile) {
      res.status(400).json({ error: 'Archivo de audio .wav requerido' });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(400).json({ error: 'OPENAI_API_KEY no configurado' });
      return;
    }

    const client = new OpenAI({ apiKey });

    // Requerir instrucciones provenientes del frontend (modal)
    if (!systemInstructions || String(systemInstructions).trim() === '') {
      // limpiar archivo cargado si llega sin instrucciones
      try { if (audioFile?.path) fs.unlinkSync(audioFile.path); } catch {}
      res.status(400).json({ error: 'Faltan instrucciones del asistente. Abre Ajustes y guarda las instrucciones antes de continuar.' });
      return;
    }

    // 1. Transcribir audio con Whisper
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.path),
      model: 'whisper-1',
      language: 'es'
    });

    const userMessage = transcription.text;
    console.log('📝 Transcripción:', userMessage);

    // 2. Buscar contexto relevante usando RAG
    const relevantDocs = await searchDocsInternal(projectId, userMessage, 5);
    const context = relevantDocs.length > 0
      ? relevantDocs.map((d) => d.text).join('\n\n')
      : '';

    // Si no hay contexto y el tema no es permitido, responder directamente
    if (!context && !isAllowedTopic(userMessage)) {
      const canned = 'Solo puedo ayudarte con información de Asesoría M2. ¿Sobre qué servicio te gustaría saber? Puedes escribirnos a m2gmail.com.';
      const selectedVoice = voice || TTS_VOICE;
      const audioResponse = await client.audio.speech.create({ model: TTS_MODEL, voice: selectedVoice as any, input: canned });
      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
      const audioFileName = `response_${Date.now()}.mp3`;
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      fs.writeFileSync(path.join(uploadsDir, audioFileName), audioBuffer);
      fs.unlinkSync(audioFile.path);
      res.status(200).json({ transcription: userMessage, response: canned, audioUrl: `/uploads/${audioFileName}`, citations: [] });
      return;
    }

    // 3. Generar respuesta con chat completions
    const assistantNameFinal = assistantName || 'Agente comercial de Asesoría M2';
    const systemPrompt = String(systemInstructions);
    
    const userPrompt = context
      ? `Contexto:\n${context}\n\nPregunta del usuario: ${userMessage}\n\nRegla CRÍTICA: Si la pregunta no trata de Asesoría M2 (servicios, precios, procesos, contacto, contabilidad/fiscal/laboral, atención comercial), responde EXACTAMENTE: "Solo puedo ayudarte con información de Asesoría M2. ¿Sobre qué servicio te gustaría saber?" y no añadas nada más.`
      : `Pregunta del usuario: ${userMessage}\n\nRegla CRÍTICA: Si la pregunta no trata de Asesoría M2 (servicios, precios, procesos, contacto, contabilidad/fiscal/laboral, atención comercial), responde EXACTAMENTE: "Solo puedo ayudarte con información de Asesoría M2. ¿Sobre qué servicio te gustaría saber?" y no añadas nada más.`;

    const chatCompletion = await client.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0,
      max_tokens: 300
    });

    const assistantResponse = chatCompletion.choices[0].message.content || 'Lo siento, no pude generar una respuesta.';
    console.log('💬 Respuesta:', assistantResponse);

    // 4. Convertir respuesta a audio con TTS
    const selectedVoice = voice || TTS_VOICE;
    const audioResponse = await client.audio.speech.create({
      model: TTS_MODEL,
      voice: selectedVoice as any,
      input: assistantResponse
    });

    // 5. Guardar audio en un archivo temporal
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    const audioFileName = `response_${Date.now()}.mp3`;
    const audioFilePath = path.join(__dirname, '../../uploads', audioFileName);
    
    // Asegurar que el directorio existe
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    fs.writeFileSync(audioFilePath, audioBuffer);

    // 6. Limpiar archivo de audio del usuario
    fs.unlinkSync(audioFile.path);

    // 7. Retornar respuesta
    res.status(200).json({
      transcription: userMessage,
      response: assistantResponse,
      audioUrl: `/uploads/${audioFileName}`,
      citations: relevantDocs.map(d => ({ text: d.text, metadata: d.metadata }))
    });
  } catch (error: any) {
    console.error('Error en chat con audio:', error);
    
    // Limpiar archivo si existe
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignorar errores al limpiar
      }
    }

    res.status(500).json({ 
      error: 'Error procesando el audio',
      details: error?.message || 'Error desconocido'
    });
  }
};

