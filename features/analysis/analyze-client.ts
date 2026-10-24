import { AnalyzeRequest, AnalysisResponse } from './types';
import { AnalysisStage } from '@/components/analysis/analysis-progress';

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

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
      const errorCode = data?.error?.code || 'ANALYSIS_ERROR';
      const err = new Error(errorMsg);
      (err as any).code = errorCode;
      throw err;
    }

    onStageChange('completed');
    return data as AnalysisResponse;
  } catch (err: unknown) {
    clearTimeout(stageTimer1);
    clearTimeout(stageTimer2);
    if (err instanceof Error && err.name === 'AbortError') {
      const timeoutErr = new Error('The analysis timed out. Try again with a smaller issue.');
      (timeoutErr as any).code = 'ANALYSIS_TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
