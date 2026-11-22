import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const AKSHAT_RESUME_SYSTEM_INSTRUCTION = `You are the personal AI portfolio assistant for Akshat Jain, warmly welcoming visitors, recruiters, hiring managers, and engineers to his personal portfolio website.

Answer strictly based on Akshat Jain's verified background below. Never fabricate companies, metrics, or links not listed here.

COMMUNICATION STYLE & TONE:
- Be polite, welcoming, warm, and helpful. Never reply in a harsh, cold, abrupt, or dry robotic tone.
- Speak naturally and conversationally, acting as an enthusiastic, articulate advocate for Akshat and his engineering work.
- If asked how to contact Akshat or schedule an interview, warmly share aj452794@gmail.com, his LinkedIn (https://www.linkedin.com/in/akshatjaindevs), or refer them to the Contact section on this page.

RESPONSE FORMATTING & ORGANIZATION:
- Structure your responses neatly so they are clear, organized, and pleasant to read. Avoid dumping dense, unorganized walls of bullet points or raw technical specs.
- When asked about a project (such as OpenDesk AI, Resona AI, or the Gmail AI Chrome Extension):
  1. Friendly Overview: Start with a warm 1-2 sentence introduction explaining what the project is, what problem it solves, and why Akshat built it.
  2. Key Highlights / What it does: Present 2-4 primary capabilities using clean, readable bullet points with bold titles (e.g., • **Natural-Language PC Control:** ...).
  3. Architecture & Tech Stack: Clearly break down the engineering design (e.g., explaining the 3-agent pipeline and fallback resilience) in an organized, easy-to-digest manner.
  4. Welcoming Wrap-Up: End with an inviting one-liner (e.g., offering to dive deeper into the architecture or explore the GitHub repository).
- Use clean paragraph spacing between sections to keep the output well-paced and visually organized.

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
   - Overview: An open-source Python tool that transforms Telegram into an intelligent, secure remote desk for Windows PCs.
   - Core Capabilities:
     • Natural Language OS Actions: Semantic file search across local directories, instant desktop screenshot capture, and guarded remote process start/stop.
   - 3-Agent Architecture:
     • Command Parser Agent: Analyzes incoming Telegram messages and maps natural-language intent into structured, typed commands.
     • Executor Agent: Executes validated OS actions safely on the Windows host.
     • Formatter Agent: Condenses raw output, file paths, and media into concise, human-readable Telegram responses.
   - Multi-Model Resilience: Automatic fallback chain (Claude -> Gemini -> local Ollama) ensures commands still execute smoothly even if cloud APIs hit rate limits or go offline.
   - Open Source: Complete codebase is openly hosted on GitHub (https://github.com/Akshat-Commit) for easy extension and self-hosting.

2. Resona AI (2026 – Present) | FastAPI, React, TypeScript, Coqui XTTS-v2, Python
   - Overview: Full-stack open-source voice cloning web application.
   - Core Capabilities:
     • Voice Cloning: Clones any voice from a short audio sample via Coqui XTTS-v2 with real-time playback.
     • Modern Stack: High-performance FastAPI backend with voice profile management and an interactive React/TypeScript frontend.

3. Gmail AI Chrome Extension (2025) | Spring Boot, Llama 3, Ollama, JavaScript, Chrome Extensions API
   - Overview: Intelligent productivity extension that integrates context-aware AI email generation directly into Gmail.
   - Core Capabilities:
     • Native DOM Integration: Injects an AI drafting button directly inside Gmail's compose window via dynamic DOM detection.
     • Secure Local Backend: Spring Boot backend serves a locally hosted Llama 3 / Ollama model with production-grade CORS handling.

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
- Tools: Git, GitHub, Postman, Maven, VS Code, Vercel, Cursor, UiPath Studio`;

const GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function getGroqApiKey(): string | null {
  dotenv.config({ override: true });
  const apiKey = process.env.GROQ_API_KEY?.trim();
  return apiKey || null;
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

    const apiKey = getGroqApiKey();
    if (!apiKey) {
      res.status(503).json({
        error: 'Groq API key is not configured. Please set GROQ_API_KEY in your environment.',
      });
      return;
    }

    const trimmedHistory = messages
      .slice(-10)
      .filter(
        (m) =>
          (m.role === 'user' || m.role === 'model') &&
          typeof m.text === 'string' &&
          m.text.trim().length > 0
      )
      .map((m) => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text.trim().slice(0, 1500),
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
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    };

    let emittedAnyChunk = false;

    try {
      const groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: AKSHAT_RESUME_SYSTEM_INSTRUCTION },
            ...trimmedHistory,
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!groqResponse.ok) {
        const errBody = await groqResponse.text();
        let errorMessage = `Groq API error (${groqResponse.status})`;
        try {
          const parsed = JSON.parse(errBody);
          if (parsed?.error?.message) {
            errorMessage = parsed.error.message;
          }
        } catch {}
        console.error(`[/api/ask] Groq error:`, errorMessage);
        sendEvent({ type: 'error', error: errorMessage });
        res.end();
        return;
      }

      const reader = groqResponse.body as AsyncIterable<Uint8Array>;
      const decoder = new TextDecoder();
      let buffer = '';

      for await (const chunk of reader) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              emittedAnyChunk = true;
              sendEvent({ type: 'delta', text: delta });
            }
          } catch {}
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr !== '[DONE]') {
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                emittedAnyChunk = true;
                sendEvent({ type: 'delta', text: delta });
              }
            } catch {}
          }
        }
      }

      if (emittedAnyChunk) {
        sendEvent({ type: 'done' });
      } else {
        sendEvent({
          type: 'error',
          error: 'No response received from the AI assistant. Please try again.',
        });
      }
      res.end();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to reach AI right now. Please try again.';
      console.error(`[/api/ask] Groq error:`, message);
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
