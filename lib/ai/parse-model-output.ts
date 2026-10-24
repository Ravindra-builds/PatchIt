import { AppError } from '../errors';
import { ContributionPlanSchema } from '../../features/analysis/schemas';
import { ContributionPlan, EvidencePacket } from '../../features/analysis/types';

export function parseAndValidateModelOutput(
  rawText: string,
  evidencePacket: EvidencePacket
): ContributionPlan {
  if (!rawText || !rawText.trim()) {
    throw new AppError(
      'AI_INVALID_RESPONSE',
      'The AI service returned an empty response. Please try again.'
    );
  }

  // Strip markdown code fences if present
  let cleanJson = rawText.trim();
  const fenceMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    cleanJson = fenceMatch[1].trim();
  } else {
    // If there is extra text before/after first { and last }, slice it
    const firstBrace = cleanJson.indexOf('{');
    const lastBrace = cleanJson.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (err) {
    console.error('Failed to parse AI output as JSON. Raw text:', rawText);
    throw new AppError(
      'AI_INVALID_RESPONSE',
      'The model produced malformed JSON. Please retry your request.'
    );
  }

  const result = ContributionPlanSchema.safeParse(parsed);
  if (!result.success) {
    console.error('Validation error for AI output:', result.error.format());
    throw new AppError(
      'AI_INVALID_RESPONSE',
      `The model output did not match the expected schema: ${result.error.issues.map((i) => i.path.join('.') + ': ' + i.message).join(', ')}`
    );
  }

  const plan = result.data;

  // Sanitize and verify relevant file links against real repository facts
  const branch = evidencePacket.repository.defaultBranch;
  const baseUrl = `${evidencePacket.repository.htmlUrl}/blob/${branch}/`;

  plan.relevantFiles = plan.relevantFiles.map((file) => {
    // Ensure the path does not have leading slashes
    const cleanPath = file.path.replace(/^\/+/, '');
    // If URL is missing or doesn't start with https, generate the real GitHub URL
    let githubUrl = file.githubUrl;
    if (!githubUrl || !githubUrl.startsWith('http')) {
      githubUrl = `${baseUrl}${cleanPath}`;
    }
    return {
      ...file,
      path: cleanPath,
      githubUrl,
    };
  });

  return plan;
}
