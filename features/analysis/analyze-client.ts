import { AnalyzeRequest, AnalysisResponse } from './types';
import { AnalysisStage } from '@/components/analysis/analysis-progress';

export class AnalysisClientError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'AnalysisClientError';
    this.code = code;
  }
}

export async function executeAnalysis(
  payload: AnalyzeRequest,
  onStageChange: (stage: AnalysisStage) => void
): Promise<AnalysisResponse> {
  onStageChange('validating');

  // Slight delay for visual transparency of Link check
  await new Promise((r) => setTimeout(r, 200));
  onStageChange('fetching_issue');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  // Progressive stage timer to reflect server work while waiting
  const stageTimer1 = setTimeout(() => onStageChange('reading_repo'), 1200);
  const stageTimer2 = setTimeout(() => onStageChange('synthesizing'), 2600);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(stageTimer1);
    clearTimeout(stageTimer2);

    const rawBody = await response.text();
    let data: { error?: { message?: string; code?: string } } | undefined;
    let parsed = true;
    try {
      data = JSON.parse(rawBody);
    } catch {
      parsed = false;
    }

    if (!parsed) {
      if (response.status === 413) {
        throw new AnalysisClientError(
          'Screenshot is too large. Please choose a smaller image.',
          'REQUEST_TOO_LARGE'
        );
      }
      if (!response.ok) {
        throw new AnalysisClientError(`Request failed with status ${response.status}`, 'ANALYSIS_ERROR');
      }
      throw new AnalysisClientError('Received an invalid response from the server.', 'ANALYSIS_ERROR');
    }

    if (!response.ok) {
      const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
      const errorCode = data?.error?.code || 'ANALYSIS_ERROR';
      throw new AnalysisClientError(errorMsg, errorCode);
    }

    onStageChange('completed');
    return data as unknown as AnalysisResponse;
  } catch (err: unknown) {
    clearTimeout(stageTimer1);
    clearTimeout(stageTimer2);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new AnalysisClientError(
        'The analysis timed out. Try again with a smaller issue.',
        'ANALYSIS_TIMEOUT'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
