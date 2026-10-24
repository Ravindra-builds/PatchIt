import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequestSchema } from '@/features/analysis/schemas';
import { validateRepoAndIssueMatch } from '@/lib/github/parse-github-url';
import { collectEvidence } from '@/lib/github/collect-evidence';
import { GithubClient } from '@/lib/github/client';
import { analyzeIssueWithGemma } from '@/lib/ai/analyze-issue';
import { formatErrorResponse, AppError } from '@/lib/errors';
import { getServerEnv } from '@/lib/env';
import { checkRateLimit, getClientKey } from '@/lib/rate-limit';
import { normalizeScreenshot } from '@/lib/screenshot';
import { timeoutSignal } from '@/lib/abort';
import type { ContributionPlan, EvidencePacket } from '@/features/analysis/types';
import { MOCK_ANALYSIS_RESPONSE } from '@/features/analysis/mock-data';

// Upper bound for the platform; the analysis itself is bounded by ANALYSIS_TIMEOUT_MS.
export const maxDuration = 90;

// Per-request cap for individual GitHub calls, within the overall analysis deadline.
const GITHUB_REQUEST_TIMEOUT_MS = 15000;
// Room for the JSON envelope and URLs on top of the base64-encoded screenshot.
const BODY_OVERHEAD_BYTES = 64 * 1024;

const MOCK_ISSUE = MOCK_ANALYSIS_RESPONSE.issue;

function isMockDemoIssue(owner: string, repo: string, issueNumber: number): boolean {
  return (
    owner.toLowerCase() === MOCK_ISSUE.repository.owner.toLowerCase() &&
    repo.toLowerCase() === MOCK_ISSUE.repository.name.toLowerCase() &&
    issueNumber === MOCK_ISSUE.number
  );
}

/** Reads the request body as JSON, refusing to buffer more than `maxBytes`. */
async function readJsonBody(request: NextRequest, maxBytes: number): Promise<unknown> {
  const tooLarge = () =>
    new AppError('REQUEST_TOO_LARGE', 'Request body is too large. Please choose a smaller screenshot.', 413);

  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) throw tooLarge();

  if (!request.body) throw new AppError('INVALID_INPUT', 'Request body is empty.');

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      throw tooLarge();
    }
    chunks.push(value);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new AppError('INVALID_INPUT', 'Invalid JSON payload received.');
  }
}

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    const env = getServerEnv();

    const rateLimit = checkRateLimit(getClientKey(request.headers), env.RATE_LIMIT_PER_MINUTE);
    if (!rateLimit.allowed) {
      const { status, body } = formatErrorResponse(
        new AppError(
          'RATE_LIMITED',
          `Too many analyses requested. Please wait ${rateLimit.retryAfterSeconds}s and try again.`,
          429
        ),
        requestId
      );
      return NextResponse.json(body, {
        status,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      });
    }

    const maxBodyBytes = Math.ceil((env.MAX_SCREENSHOT_BYTES * 4) / 3) + BODY_OVERHEAD_BYTES;
    const bodyJson = await readJsonBody(request, maxBodyBytes);

    const parseResult = AnalyzeRequestSchema.safeParse(bodyJson);
    if (!parseResult.success) {
      const issueMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      throw new AppError('INVALID_INPUT', `Invalid input: ${issueMessages}`);
    }

    const { repositoryUrl, issueUrl } = parseResult.data;

    const screenshot = parseResult.data.screenshotBase64
      ? normalizeScreenshot(
          parseResult.data.screenshotBase64,
          parseResult.data.screenshotMimeType,
          env.MAX_SCREENSHOT_BYTES
        )
      : undefined;

    // 1. Validate GitHub URLs and match
    const { owner, repo, issueNumber } = validateRepoAndIssueMatch(repositoryUrl, issueUrl);

    // 2. Without an API key, only the bundled demo issue can be served (from mock data, no GitHub calls).
    if (!env.GEMINI_API_KEY) {
      if (isMockDemoIssue(owner, repo, issueNumber)) {
        return NextResponse.json({
          ...MOCK_ANALYSIS_RESPONSE,
          modelUsed: `${MOCK_ANALYSIS_RESPONSE.modelUsed} (demo mock - set GEMINI_API_KEY for live calls)`,
          requestId,
        });
      }
      throw new AppError(
        'AI_UNAVAILABLE',
        `GEMINI_API_KEY is not configured on the server. Add it to .env.local to run live Gemma 4 analysis. Without a key, only the demo issue ${MOCK_ISSUE.htmlUrl} is available.`,
        503
      );
    }

    // One deadline for the whole analysis; also aborts if the client disconnects.
    const deadline = timeoutSignal(env.ANALYSIS_TIMEOUT_MS, request.signal);

    let evidencePacket: EvidencePacket;
    let plan: ContributionPlan;
    let modelUsed: string;
    try {
      // 3. Collect bounded repository and issue evidence from GitHub
      const github = new GithubClient({
        timeoutMs: Math.min(GITHUB_REQUEST_TIMEOUT_MS, env.ANALYSIS_TIMEOUT_MS),
        signal: deadline.signal,
      });
      evidencePacket = await collectEvidence(owner, repo, issueNumber, github);

      // 4. AI analysis with Gemma 4
      ({ plan, modelUsed } = await analyzeIssueWithGemma({
        evidencePacket,
        screenshotBase64: screenshot?.data,
        screenshotMimeType: screenshot?.mimeType,
        signal: deadline.signal,
      }));
    } finally {
      deadline.clear();
    }

    // 5. Return structured response
    const analyzedFiles = evidencePacket.evidenceItems.flatMap((e) =>
      e.kind === 'source_file' && e.path ? [e.path] : []
    );
    const hasReadme = evidencePacket.evidenceItems.some((e) => e.kind === 'readme');
    if (hasReadme) {
      analyzedFiles.push('README.md');
    }

    return NextResponse.json({
      plan,
      issue: evidencePacket.issue,
      evidenceSummary: {
        fileCount: analyzedFiles.length,
        hasReadme,
        treeTotalFiles: evidencePacket.allTreePaths.length,
        analyzedFiles,
      },
      modelUsed,
      requestId,
    });
  } catch (err: unknown) {
    const { status, body } = formatErrorResponse(err, requestId);
    return NextResponse.json(body, { status });
  }
}
