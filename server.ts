import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/chat', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi pada panel Settings > Secrets.',
      });
      return;
    }

    const { messages } = req.body as {
      messages?: Array<{ role: 'user' | 'assistant'; text: string }>;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Pesan chat tidak boleh kosong.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents = messages.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.text || '').slice(0, 2000) }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction:
            'Kamu adalah Bot AI EVORA, asisten virtual ramah berbahasa Indonesia untuk platform manajemen event EVORA (karya Muhammad Satrio Wibisono). Jawab singkat, jelas, dan membantu seputar cara mencari event di peta Google Maps real-time, cara registrasi jadi panitia, fitur streak bulanan & quest, kustomisasi avatar di halaman Profil (harus Sign In / Sign Up dulu agar avatar aktif), serta arahkan kendala mendesak ke Customer Service WhatsApp 089603963329, Instagram @msriotsss, atau email keluh kesah msriotss@gmail.com.',
        },
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        res.status(502).json({ error: 'Bot AI tidak mengembalikan jawaban. Silakan coba lagi.' });
        return;
      }

      res.json({ reply: replyText });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada Bot AI.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EVORA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
