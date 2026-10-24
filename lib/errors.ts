export type ApiErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_GITHUB_URL'
  | 'ISSUE_REPOSITORY_MISMATCH'
  | 'GITHUB_NOT_FOUND'
  | 'GITHUB_RATE_LIMITED'
  | 'AI_UNAVAILABLE'
  | 'AI_INVALID_RESPONSE'
  | 'REQUEST_TOO_LARGE'
  | 'ANALYSIS_TIMEOUT'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;

  constructor(code: ApiErrorCode, message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function formatErrorResponse(err: unknown, requestId?: string) {
  if (err instanceof AppError) {
    return {
      status: err.statusCode,
      body: {
        error: {
          code: err.code,
          message: err.message,
          ...(requestId ? { requestId } : {}),
        },
      },
    };
  }

  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  return {
    status: 500,
    body: {
      error: {
        code: 'INTERNAL_ERROR' as const,
        message,
        ...(requestId ? { requestId } : {}),
      },
    },
  };
}
