import { z } from 'zod';
import {
  AnalyzeRequestSchema,
  AnalysisResponseSchema,
  ContributionPlanSchema,
  FirstStepSchema,
  RelevantFileSchema,
  ReproductionSchema,
  IssueMetadataSchema,
} from './schemas';

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
export type ContributionPlan = z.infer<typeof ContributionPlanSchema>;
export type FirstStep = z.infer<typeof FirstStepSchema>;
export type RelevantFile = z.infer<typeof RelevantFileSchema>;
export type Reproduction = z.infer<typeof ReproductionSchema>;
export type IssueMetadata = z.infer<typeof IssueMetadataSchema>;

export type EvidenceItem = {
  id: string;
  kind: 'issue' | 'readme' | 'file_tree' | 'source_file' | 'repo_metadata';
  title: string;
  url: string;
  content: string;
  truncated: boolean;
  /** Repository-relative path, set for source_file items. */
  path?: string;
};

export type EvidencePacket = {
  repository: {
    owner: string;
    name: string;
    fullName: string;
    htmlUrl: string;
    description: string | null;
    defaultBranch: string;
  };
  issue: IssueMetadata;
  evidenceItems: EvidenceItem[];
  allTreePaths: string[];
  /** True when GitHub truncated the recursive tree listing (very large repositories). */
  treeTruncated: boolean;
};
