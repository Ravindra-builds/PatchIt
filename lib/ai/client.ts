import { GoogleGenAI } from '@google/genai';
import { getServerEnv } from '../env';
import { AppError } from '../errors';

let cachedAiClient: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI {
  if (cachedAiClient) return cachedAiClient;

  const env = getServerEnv();
  if (!env.GEMINI_API_KEY) {
    throw new AppError(
      'AI_UNAVAILABLE',
      'GEMINI_API_KEY is not configured on the server. Please add your Google AI Studio key to .env.local to enable live Gemma 4 analysis.',
      503
    );
  }

  cachedAiClient = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
  });

  return cachedAiClient;
}
