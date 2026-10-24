import { z } from 'zod';

export const FirstStepSchema = z.object({
  title: z.string().describe('Clear, imperative step title, e.g. Inspect the parser configuration'),
  explanation: z.string().describe('Detailed explanation of why this step matters and what to look for'),
  evidenceIds: z.array(z.string()).default([]).describe('IDs of repository evidence backing this recommendation'),
  verification: z.enum(['verified', 'needs_verification']).describe('Whether this step is backed by repository evidence'),
});

export const RelevantFileSchema = z.object({
  path: z.string().describe('Exact repository file path from the evidence packet'),
  reason: z.string().describe('Why this file is suspected to be relevant to the issue'),
  githubUrl: z.string().describe('Source link to view the file on GitHub'),
  evidenceIds: z.array(z.string()).default([]).describe('IDs of evidence items where this file was observed'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level in relevance'),
});

export const ReproductionSchema = z.object({
  instruction: z.string().describe('Concrete command or reproduction step'),
  source: z.string().nullable().describe('Documented source file or context if found, otherwise null'),
  verification: z.enum(['documented', 'suggested', 'unknown']).describe('Whether command exists in docs vs inferred suggestion'),
});

export const ContributionPlanSchema = z.object({
  issueSummary: z.string().describe('Concise breakdown of what the issue is reporting or requesting'),
  suspectedArea: z.string().describe('Subsystem, module, or architecture layer likely involved'),
  firstSteps: z.array(FirstStepSchema).max(3).describe('At most 3 prioritized, actionable starting steps'),
  relevantFiles: z.array(RelevantFileSchema).describe('List of relevant files grounded in real evidence'),
  reproduction: z.array(ReproductionSchema).describe('Commands or steps to reproduce/test'),
  openQuestions: z.array(z.string()).describe('Critical uncertainties or missing information'),
  limitations: z.array(z.string()).describe('What this analysis could not verify or establish'),
});

export const AnalyzeRequestSchema = z.object({
  repositoryUrl: z
    .string()
    .url('Please provide a valid URL')
    .refine((url) => {
      try {
        const u = new URL(url);
        return u.hostname === 'github.com' || u.hostname === 'www.github.com';
      } catch {
        return false;
      }
    }, 'Must be a github.com URL'),
  issueUrl: z
    .string()
    .url('Please provide a valid URL')
    .refine((url) => {
      try {
        const u = new URL(url);
        return u.hostname === 'github.com' || u.hostname === 'www.github.com';
      } catch {
        return false;
      }
    }, 'Must be a github.com URL'),
  screenshotBase64: z.string().optional(),
  screenshotMimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']).optional(),
});

export const IssueMetadataSchema = z.object({
  number: z.number(),
  title: z.string(),
  body: z.string(),
  state: z.string(),
  labels: z.array(z.string()),
  htmlUrl: z.string(),
  author: z.string(),
  createdAt: z.string(),
  repository: z.object({
    owner: z.string(),
    name: z.string(),
    fullName: z.string(),
    htmlUrl: z.string(),
    description: z.string().nullable(),
    defaultBranch: z.string(),
  }),
});

export const AnalysisResponseSchema = z.object({
  plan: ContributionPlanSchema,
  issue: IssueMetadataSchema,
  evidenceSummary: z.object({
    fileCount: z.number(),
    hasReadme: z.boolean(),
    treeTotalFiles: z.number(),
    analyzedFiles: z.array(z.string()),
  }),
  modelUsed: z.string(),
});
