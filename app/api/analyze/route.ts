import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequestSchema } from '@/features/analysis/schemas';
import { validateRepoAndIssueMatch } from '@/lib/github/parse-github-url';
import { collectEvidence } from '@/lib/github/collect-evidence';
import { analyzeIssueWithGemma } from '@/lib/ai/analyze-issue';
import { formatErrorResponse, AppError } from '@/lib/errors';
import { getServerEnv } from '@/lib/env';
import { MOCK_ANALYSIS_RESPONSE } from '@/features/analysis/mock-data';


export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    let bodyJson: unknown;
    try {
      bodyJson = await request.json();
    } catch {
      throw new AppError('INVALID_INPUT', 'Invalid JSON payload received.');
    }

    const parseResult = AnalyzeRequestSchema.safeParse(bodyJson);
    if (!parseResult.success) {
      const issueMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      throw new AppError('INVALID_INPUT', `Invalid input: ${issueMessages}`);
    }

    const { repositoryUrl, issueUrl, screenshotBase64, screenshotMimeType } = parseResult.data;

    // Validate screenshot size if present (e.g. max 5MB)
    if (screenshotBase64) {
      const approxByteSize = Math.ceil((screenshotBase64.length * 3) / 4);
      const maxBytes = 5 * 1024 * 1024;
      if (approxByteSize > maxBytes) {
        throw new AppError(
          'REQUEST_TOO_LARGE',
          'Screenshot exceeds the 5 MB limit. Please choose a smaller image.',
          413
        );
      }
    }

    // 1. Validate GitHub URLs and match
    const { owner, repo, issueNumber } = validateRepoAndIssueMatch(repositoryUrl, issueUrl);

    // 2. Collect bounded repository and issue evidence from GitHub
    const evidencePacket = await collectEvidence(owner, repo, issueNumber);

    // 3. AI analysis with Gemma 4
    let plan;
    let modelUsed = 'gemma-4-26b-a4b-it';

    const env = getServerEnv();
    if (!env.GEMINI_API_KEY) {
      // If no API key is provided yet, check if this is one of our demo issues or give a helpful key error
      if (
        (owner.toLowerCase() === 'facebook' && repo.toLowerCase() === 'react') ||
        (owner.toLowerCase() === 'vercel' && repo.toLowerCase() === 'next.js')
      ) {
        plan = MOCK_ANALYSIS_RESPONSE.plan;
        modelUsed = 'gemma-4-26b-a4b-it (demo mock - set GEMINI_API_KEY for live calls)';
      } else {
        throw new AppError(
          'AI_UNAVAILABLE',
          'GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY to .env.local to run live Gemma 4 analysis on any public repository.',
          503
        );
      }
    } else {
      const analysisResult = await analyzeIssueWithGemma({
        evidencePacket,
        screenshotBase64,
        screenshotMimeType,
      });
      plan = analysisResult.plan;
      modelUsed = analysisResult.modelUsed;
    }

    // 4. Return structured response
    const analyzedFiles = evidencePacket.evidenceItems
      .filter((e) => e.kind === 'source_file')
      .map((e) => e.title.replace('File: ', ''));

    if (evidencePacket.evidenceItems.some((e) => e.kind === 'readme')) {
      analyzedFiles.push('README.md');
    }

    return NextResponse.json({
      plan,
      issue: evidencePacket.issue,
      evidenceSummary: {
        fileCount: analyzedFiles.length,
        hasReadme: evidencePacket.evidenceItems.some((e) => e.kind === 'readme'),
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
