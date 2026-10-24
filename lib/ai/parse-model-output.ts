import { AppError } from '../errors';
import { ContributionPlanSchema } from '../../features/analysis/schemas';
import { ContributionPlan, EvidencePacket } from '../../features/analysis/types';

/**
 * Extracts a JSON value from model output. Plain JSON is tried first so that code fences
 * appearing *inside* JSON string values (e.g. a ```bash snippet) are never mistaken for a wrapper.
 */
function extractJson(rawText: string): unknown {
  const trimmed = rawText.trim();

  const candidates: string[] = [trimmed];

  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) candidates.push(fenceMatch[1]);

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(trimmed.substring(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try the next candidate
    }
  }

  console.error('Failed to parse AI output as JSON. Raw text:', rawText);
  throw new AppError(
    'AI_INVALID_RESPONSE',
    'The model produced malformed JSON. Please retry your request.',
    502
  );
}

function encodePath(filePath: string): string {
  return filePath.split('/').map(encodeURIComponent).join('/');
}

export function parseAndValidateModelOutput(
  rawText: string,
  evidencePacket: EvidencePacket
): ContributionPlan {
  if (!rawText || !rawText.trim()) {
    throw new AppError(
      'AI_INVALID_RESPONSE',
      'The AI service returned an empty response. Please try again.',
      502
    );
  }

  const parsed = extractJson(rawText);

  const result = ContributionPlanSchema.safeParse(parsed);
  if (!result.success) {
    console.error(
      'Validation error for AI output:',
      result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    );
    throw new AppError(
      'AI_INVALID_RESPONSE',
      'The model output did not match the expected format. Please retry your request.',
      502
    );
  }

  const plan = result.data;

  // Ground the plan in real repository facts. The model's output is untrusted (issue text and
  // repository files can carry prompt injections), so file paths, links and evidence references
  // are checked against what was actually collected rather than taken at face value.
  const knownPaths = new Set(evidencePacket.allTreePaths);
  const knownEvidenceIds = new Set(evidencePacket.evidenceItems.map((e) => e.id));
  const keepKnownIds = (ids: string[]) => ids.filter((id) => knownEvidenceIds.has(id));

  const { htmlUrl, defaultBranch } = evidencePacket.repository;
  const baseUrl = `${htmlUrl}/blob/${encodeURIComponent(defaultBranch)}/`;

  const seenPaths = new Set<string>();
  plan.relevantFiles = plan.relevantFiles.flatMap((file) => {
    const cleanPath = file.path.trim().replace(/^\.?\/+/, '');
    if (!knownPaths.has(cleanPath) || seenPaths.has(cleanPath)) return [];
    seenPaths.add(cleanPath);
    return [
      {
        ...file,
        path: cleanPath,
        // Always rebuild the link; never trust a model-supplied URL.
        githubUrl: `${baseUrl}${encodePath(cleanPath)}`,
        evidenceIds: keepKnownIds(file.evidenceIds),
      },
    ];
  });

  plan.firstSteps = plan.firstSteps.map((step) => {
    const evidenceIds = keepKnownIds(step.evidenceIds);
    return {
      ...step,
      evidenceIds,
      // A step cannot be "verified" without at least one real piece of evidence behind it.
      verification: evidenceIds.length > 0 ? step.verification : 'needs_verification',
    };
  });

  return plan;
}
