import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
];

function setCors(res: VercelResponse, origin: string | undefined): void {
  const isAllowed =
    !origin ||
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith('.vercel.app');

  res.setHeader('Access-Control-Allow-Origin', isAllowed ? (origin || '*') : '');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );
}

interface ChildContext {
  supportNeed?: string;
  diagnosisStatus?: string;
  city?: string;
  province?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const origin = req.headers.origin;
  setCors(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body: { message?: unknown; childContext?: unknown };
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: 'Invalid JSON in request body' });
    return;
  }

  const { message, childContext } = body as {
    message?: unknown;
    childContext?: unknown;
  };

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'A non-empty "message" string is required' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable is not set');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  const child = childContext as ChildContext | undefined;

  const contextLines: string[] = [];
  if (child?.supportNeed) contextLines.push(`Support need: ${child.supportNeed}`);
  if (child?.diagnosisStatus) contextLines.push(`Diagnosis status: ${child.diagnosisStatus}`);
  if (child?.city) contextLines.push(`City: ${child.city}`);
  if (child?.province) contextLines.push(`Province: ${child.province}`);

  const systemInstruction = [
    'You are Care AI, an educational child-development guidance assistant built into the CareSync application.',
    '',
    'Your role and boundaries:',
    '- Provide general educational guidance about child development, daily activities, communication strategies, and developmental milestones.',
    '- You are NOT a doctor, therapist, or diagnostic service. Never diagnose any medical or developmental condition.',
    '- When a concern requires professional assessment, recommend consulting an appropriate qualified professional (e.g., speech-language therapist, audiologist, pediatrician, occupational therapist, physiotherapist).',
    '- Recognize potentially urgent situations (e.g., loss of previously acquired skills, signs of physical harm, severe behavioral crisis) and clearly advise seeking immediate professional or emergency help.',
    '- Never claim you have examined, observed, or assessed the child.',
    '- Be warm, supportive, practical, and respectful in tone.',
    '- Give actionable, evidence-informed suggestions that a parent or caregiver can try at home.',
    '- If information is ambiguous or insufficient, ask clarifying questions before giving guidance.',
    contextLines.length > 0
      ? `\nRelevant context about the child (provided from the CareSync profile):\n${contextLines.join('\n')}`
      : '',
  ].join('\n');

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message.trim(),
      config: { systemInstruction },
    });

    const text = response.text?.trim();
    if (!text) {
      res.status(502).json({ error: 'Empty response from AI model' });
      return;
    }

    res.status(200).json({ text });
  } catch (err) {
    console.error('Gemini API error:', err);
    res.status(502).json({ error: 'Failed to generate AI response' });
  }
}
