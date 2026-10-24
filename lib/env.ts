import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required for AI analysis').optional(),
  GEMMA_MODEL: z.string().default('gemma-4-26b-a4b-it'),
  GITHUB_TOKEN: z.string().optional(),
  ANALYSIS_TIMEOUT_MS: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 60000)),
  MAX_SCREENSHOT_BYTES: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 5 * 1024 * 1024)),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMMA_MODEL: process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it',
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    ANALYSIS_TIMEOUT_MS: process.env.ANALYSIS_TIMEOUT_MS,
    MAX_SCREENSHOT_BYTES: process.env.MAX_SCREENSHOT_BYTES,
  });

  if (!result.success) {
    console.error('Invalid server environment variables:', result.error.format());
    throw new Error('Server environment configuration is invalid');
  }

  cachedEnv = result.data;
  return cachedEnv;
}
