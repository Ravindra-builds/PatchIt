import { ApiError, ThinkingLevel, type Part } from '@google/genai';
import { getGenAIClient } from './client';
import { getServerEnv } from '../env';
import { SYSTEM_INSTRUCTION, buildAnalysisUserPrompt } from './prompt';
import { parseAndValidateModelOutput } from './parse-model-output';
import { AppError } from '../errors';
import { ContributionPlan, EvidencePacket } from '../../features/analysis/types';

export interface AnalyzeIssueOptions {
  evidencePacket: EvidencePacket;
  screenshotBase64?: string;
  screenshotMimeType?: string;
  /** Aborts the model call, e.g. when the overall analysis deadline passes. */
  signal?: AbortSignal;
}

export async function analyzeIssueWithGemma({
  evidencePacket,
  screenshotBase64,
  screenshotMimeType = 'image/png',
  signal,
}: AnalyzeIssueOptions): Promise<{ plan: ContributionPlan; modelUsed: string }> {
  const env = getServerEnv();
  const modelName = env.GEMMA_MODEL;
  const ai = getGenAIClient();

  const userPrompt = buildAnalysisUserPrompt(evidencePacket, Boolean(screenshotBase64));

  const parts: Part[] = [{ text: userPrompt }];

  if (screenshotBase64) {
    parts.push({
      inlineData: {
        data: screenshotBase64,
        mimeType: screenshotMimeType,
      },
    });
  }

  let outputText: string;
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.2,
        // Gemma 4 thinks by default, which multiplies latency on large evidence packets.
        // It accepts only MINIMAL (off) or HIGH (the default).
        thinkingConfig: { thinkingLevel: env.GEMMA_THINKING === 'high' ? ThinkingLevel.HIGH : ThinkingLevel.MINIMAL },
        abortSignal: signal,
      },
    });
    outputText = response.text || '';
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;
    throw toAppError(err, modelName, signal);
  }

  const plan = parseAndValidateModelOutput(outputText, evidencePacket);
  return { plan, modelUsed: modelName };
}

function toAppError(err: unknown, modelName: string, signal?: AbortSignal): AppError {
  // Upstream error text can include request details; log it server-side only.
  console.error('Error during Gemma analysis:', err);

  if (signal?.aborted || (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'))) {
    return new AppError('ANALYSIS_TIMEOUT', 'The AI analysis took too long. Please try again.', 504);
  }

  const status = err instanceof ApiError ? err.status : undefined;

  if (status === 404) {
    return new AppError(
      'AI_UNAVAILABLE',
      `The requested Gemma model (${modelName}) could not be accessed. Verify model availability or permissions for your GEMINI_API_KEY.`,
      502
    );
  }

  if (status === 429) {
    // Google includes a RetryInfo delay (e.g. "retryDelay":"18s"); pass it on when present.
    const retrySeconds = err instanceof Error ? err.message.match(/"retryDelay"\s*:\s*"(\d+)/)?.[1] : undefined;
    return new AppError(
      'AI_UNAVAILABLE',
      `Google Gen AI quota limit reached for this API key. Please retry in ${retrySeconds ? `about ${retrySeconds}s` : 'a minute'}.`,
      429
    );
  }

  if (status === 401 || status === 403) {
    return new AppError(
      'AI_UNAVAILABLE',
      'The configured GEMINI_API_KEY was rejected. Check that it is valid.',
      502
    );
  }

  if (status === 400) {
    return new AppError(
      'AI_UNAVAILABLE',
      'The AI service rejected the request. If you attached a screenshot, try a different image.',
      502
    );
  }

  return new AppError(
    'AI_UNAVAILABLE',
    'The AI analysis service is temporarily unavailable. Please try again.',
    502
  );
}
