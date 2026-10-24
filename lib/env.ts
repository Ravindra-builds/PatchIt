import { z } from 'zod';

const positiveIntWithDefault = (fallback: number) =>
  z
    .string()
    .optional()
    .transform((val, ctx) => {
      if (val === undefined || val.trim() === '') return fallback;
      const parsed = Number(val);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        ctx.addIssue({ code: 'custom', message: `Expected a positive integer, received "${val}"` });
        return z.NEVER;
      }
      return parsed;
    });

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMMA_MODEL: z.string().min(1).default('gemma-4-26b-a4b-it'),
  GEMMA_THINKING: z.enum(['minimal', 'high']).default('minimal'),
  GITHUB_TOKEN: z.string().min(1).optional(),
  ANALYSIS_TIMEOUT_MS: positiveIntWithDefault(60000),
  MAX_SCREENSHOT_BYTES: positiveIntWithDefault(5 * 1024 * 1024),
  RATE_LIMIT_PER_MINUTE: positiveIntWithDefault(5),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | null = null;

// Empty strings in .env files (e.g. `GITHUB_TOKEN=`) are treated as unset.
function readVar(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse({
    GEMINI_API_KEY: readVar('GEMINI_API_KEY'),
    GEMMA_MODEL: readVar('GEMMA_MODEL'),
    GEMMA_THINKING: readVar('GEMMA_THINKING')?.toLowerCase(),
    GITHUB_TOKEN: readVar('GITHUB_TOKEN'),
    ANALYSIS_TIMEOUT_MS: readVar('ANALYSIS_TIMEOUT_MS'),
    MAX_SCREENSHOT_BYTES: readVar('MAX_SCREENSHOT_BYTES'),
    RATE_LIMIT_PER_MINUTE: readVar('RATE_LIMIT_PER_MINUTE'),
  });

  if (!result.success) {
    console.error('Invalid server environment variables:', z.treeifyError(result.error));
    throw new Error('Server environment configuration is invalid');
  }

  cachedEnv = result.data;
  return cachedEnv;
}
