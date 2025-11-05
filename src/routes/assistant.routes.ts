import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createSample, listSamples, deleteSample } from '../controllers/assistant.controller';
import { startFineTune } from '../controllers/assistant.finetune.controller';
import { uploadDoc, searchDocs, answerQuestion } from '../controllers/assistant.rag.controller';
import { getSettings, saveSettings } from '../controllers/assistant.settings.controller';
import { chatWithAudio } from '../controllers/assistant.chat.controller';

const router = Router();

// Configurar multer para audio
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `audio_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const audioUpload = multer({
  storage: audioStorage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/mpeg', 'audio/mp3'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.wav')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de audio .wav'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post('/assistant/samples', createSample);
router.get('/assistant/samples', listSamples);
router.delete('/assistant/samples/:id', deleteSample);
router.post('/assistant/fine-tune', startFineTune);

// RAG endpoints
router.post('/assistant/docs', uploadDoc);
router.get('/assistant/search', searchDocs);
router.post('/assistant/answer', answerQuestion);

// Chat con audio endpoint
router.post('/assistant/chat', audioUpload.single('audio'), chatWithAudio);

// Assistant settings endpoints
router.get('/assistant/settings', getSettings);
router.post('/assistant/settings', saveSettings);

export default router;


