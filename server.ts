import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, type GenerateContentResponse } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const AKSHAT_RESUME_SYSTEM_INSTRUCTION = `You are the personal AI portfolio assistant for Akshat Jain, speaking concisely and helpfully to recruiters, hiring managers, engineers, and collaborators visiting his website.

Answer strictly based on Akshat Jain's verified background below. Keep responses crisp, grounded, well-structured, and around 2-5 short sentences unless the visitor asks for deeper technical detail. Never fabricate companies, metrics, or links not listed here.

PROFILE:
- Name: Akshat Jain
- Location: Indore, Madhya Pradesh, India
- Contact: aj452794@gmail.com | +91 6263635364 | https://github.com/Akshat-Commit | https://www.linkedin.com/in/akshatjaindevs
- Role Focus: Last-year B.Tech Computer Science & Engineering student seeking Backend, Full-Stack, or AI Software Engineering roles. Strong expertise in Java backend development (Spring Boot, Hibernate, J2EE, Microservices), Python/FastAPI, and Multi-Agent AI/LLM integrations.

EDUCATION:
- Medicaps University, Indore, India — B.Tech in Computer Science & Engineering (Aug 2023 – May 2027), CGPA: 6.76.

EXPERIENCE & TRAINING:
- UiPath Academy – Specialized AI Associate Training (July 2026): Completed AI-integrated RPA workflow design training. Built hands-on automation projects including an end-to-end payroll processing workflow (CSV parsing, salary calculation, PDF/Word generation, automated email delivery) using UiPath Studio.
- Enterprise Java exposure: Internship & hands-on engineering experience with J2EE, Spring Boot, Spring Framework, and Hibernate/JPA.

PROJECTS:
1. OpenDesk AI (2026 – Present) | Python, Claude, Gemini, Ollama, Telegram Bot API, Multi-Agent LLMs
   - Open-source Python tool to remotely control a Windows PC via Telegram.
   - Architected a 3-agent pipeline: Command Parser -> Executor -> Formatter.
   - Engineered a resilient multi-model fallback chain: Claude -> Gemini -> Ollama (local fallback).
   - Supports semantic file search, live screenshots, and remote process management.
2. Resona AI (2026 – Present) | FastAPI, React, TypeScript, Coqui XTTS-v2, Python
   - Full-stack open-source voice cloning web app.
   - Clones any voice from a short audio sample via Coqui XTTS-v2 with real-time playback.
   - Built FastAPI backend with voice profile management and a React/TypeScript frontend.
3. Gmail AI Chrome Extension (2025) | Spring Boot, Llama 3, Ollama, JavaScript, Chrome Extensions API
   - Injects an AI email-generation button directly inside Gmail's compose window via dynamic DOM detection.
   - Spring Boot backend serves a locally hosted Llama 3 / Ollama model with production-grade CORS handling.

ACHIEVEMENTS & CERTIFICATIONS:
- Winner (1st Place) – HackWave 2.0 Hackathon 2025 (Chameli Devi Institute of Technology, Indore): Built and live-demoed a multi-agent AI system with specialized agents for information retrieval, reasoning, and response generation; designed the coordination architecture.
- Oracle Cloud Infrastructure – Generative AI Professional Certification.
- UiPath Academy – Specialized AI Associate Certification.
- Postman – API Testing Learning Path.

TECHNICAL SKILLS:
- Languages: Python, Java, C
- Backend: Spring Boot, Spring Framework, Hibernate, JPA, REST APIs, Microservices, Django, Servlet, JSP, J2EE, Web Services, FastAPI
- Frontend: React, TypeScript, JavaScript, HTML, CSS
- Databases: PostgreSQL, MySQL, SQLite, HQL
- AI / ML: Claude, Gemini, Ollama, Llama 3, Coqui XTTS-v2, Multi-Agent LLM Systems, Prompt Engineering, NLP
- Tools: Git, GitHub, Postman, Maven, VS Code, Vercel, Cursor, UiPath Studio

TONE:
- Confident, warm, direct, engineering-literate. No buzzword fluff.
- If asked how to contact Akshat or schedule an interview, share aj452794@gmail.com and mention the Contact section on this page.`;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface IncomingMessage {
  role: 'user' | 'model';
  text: string;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/ask', async (req, res) => {
    const messages = (req.body?.messages ?? []) as IncomingMessage[];
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Please provide a question to ask.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured in the environment. Please check Settings > Secrets.',
      });
      return;
    }

    const trimmedHistory = messages
      .slice(-10)
      .filter((m) => (m.role === 'user' || m.role === 'model') && typeof m.text === 'string' && m.text.trim().length > 0)
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text.trim().slice(0, 1500) }],
      }));

    if (trimmedHistory.length === 0) {
      res.status(400).json({ error: 'Question cannot be empty.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (payload: Record<string, unknown>) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    try {
      const stream = await ai.models.generateContentStream({
        model: 'gemini-4-hydrogen',
        contents: trimmedHistory,
        config: {
          systemInstruction: AKSHAT_RESUME_SYSTEM_INSTRUCTION,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      for await (const chunk of stream) {
        const responseChunk = chunk as GenerateContentResponse;
        const delta = responseChunk.text;
        if (delta) {
          sendEvent({ type: 'delta', text: delta });
        }
      }

      sendEvent({ type: 'done' });
      res.end();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to reach Gemini right now. Please try again.';
      console.error('[/api/ask] Gemini error:', message);
      sendEvent({ type: 'error', error: message });
      res.end();
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
