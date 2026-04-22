import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

const router = Router();

const SYSTEM_PROMPT = `You are a helpful customer support assistant for ServeNCare, a service marketplace platform that connects customers with service providers.

ServeNCare offers:
- Home and professional services (cleaning, plumbing, electrical, repairs, tutoring, etc.)
- Booking services through the website
- Customer and Provider dashboards
- Service providers can list their services and set availability
- Customers can browse, book, and manage their bookings

Keep responses concise (2-4 sentences unless more detail is needed). Be friendly and helpful.`;

function buildChatHistory(messages) {
  const mapped = messages
    .filter((m) => m.type && m.text)
    .map((m) => ({
      role: m.type === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));
  // Gemini requires history to start with 'user', not 'model'
  const firstUser = mapped.findIndex((m) => m.role === 'user');
  if (firstUser > 0) return mapped.slice(firstUser);
  if (firstUser === -1) return [];
  return mapped;
}

router.post('/', async (req, res) => {
  const { message, history = [], lang = 'en' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message required' });
  }

  if (!config.geminiApiKey) {
    return res.status(503).json({
      error: 'AI chat not configured',
      fallback: true,
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `${SYSTEM_PROMPT}\n\nRespond in the user's language. The user's language code is: ${lang}. Common codes: en=English, es=Spanish, fr=French, hi=Hindi, pt=Portuguese, de=German, ar=Arabic.`,
    });

    const chat = model.startChat({
      history: buildChatHistory(history),
    });

    const result = await chat.sendMessage(message.trim());
    const response = result.response;
    const text = response.text();

    if (!text) {
      return res.status(502).json({ error: 'No response from AI', fallback: true });
    }

    res.json({ reply: text.trim() });
  } catch (e) {
    console.error('Chat AI error:', e);
    res.status(500).json({
      error: e.message || 'AI request failed',
      fallback: true,
    });
  }
});

export default router;
