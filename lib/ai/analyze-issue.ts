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
}

export async function analyzeIssueWithGemma({
  evidencePacket,
  screenshotBase64,
  screenshotMimeType = 'image/png',
}: AnalyzeIssueOptions): Promise<{ plan: ContributionPlan; modelUsed: string }> {
  const env = getServerEnv();
  const modelName = env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';
  const ai = getGenAIClient();

  const userPrompt = buildAnalysisUserPrompt(evidencePacket, Boolean(screenshotBase64));

  const parts: any[] = [{ text: userPrompt }];

  if (screenshotBase64) {
    // Strip possible data URI prefix if passed by client
    const cleanBase64 = screenshotBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: screenshotMimeType,
      },
    });
  }

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
      },
    });

    const outputText = response.text || '';
    const plan = parseAndValidateModelOutput(outputText, evidencePacket);

    return {
      plan,
      modelUsed: modelName,
    };
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;

    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Error during Gemma analysis:', errMsg);

    if (errMsg.includes('not found') || errMsg.includes('unsupported model') || errMsg.includes('404')) {
      throw new AppError(
        'AI_UNAVAILABLE',
        `The requested Gemma model (${modelName}) could not be accessed. Verify model availability or permissions for your GEMINI_API_KEY.`,
        502
      );
    }

    if (errMsg.includes('quota') || errMsg.includes('rate limit') || errMsg.includes('429')) {
      throw new AppError(
        'AI_UNAVAILABLE',
        'Google Gen AI quota limit reached for this API key. Please retry in a few moments.',
        429
      );
    }

    throw new AppError(
      'AI_INVALID_RESPONSE',
      `Analysis service error: ${errMsg}`,
      502
    );
  }
}
