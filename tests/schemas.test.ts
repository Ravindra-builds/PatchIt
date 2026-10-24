import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ContributionPlanSchema,
  AnalyzeRequestSchema,
} from '../features/analysis/schemas';

test('ContributionPlanSchema: validates correct contribution plan', () => {
  const validPlan = {
    issueSummary: 'Fix race condition in subscription cleanup callback',
    suspectedArea: 'Core state reconciler',
    firstSteps: [
      {
        title: 'Inspect subscription teardown function',
        explanation: 'Check if teardown is safely called after unmount.',
        evidenceIds: ['source-file-0'],
        verification: 'verified',
      },
      {
        title: 'Run subscription unit tests',
        explanation: 'Run tests to check for race condition reproducing.',
        evidenceIds: ['repo-readme'],
        verification: 'needs_verification',
      },
    ],
    relevantFiles: [
      {
        path: 'src/reconciler.ts',
        reason: 'Contains subscription listener dispatch mechanism.',
        githubUrl: 'https://github.com/owner/repo/blob/main/src/reconciler.ts',
        evidenceIds: ['source-file-0'],
        confidence: 'high',
      },
    ],
    reproduction: [
      {
        instruction: 'npm test -- -t "subscription"',
        source: 'README.md',
        verification: 'documented',
      },
    ],
    openQuestions: ['Is this issue reproducible with older React versions?'],
    limitations: ['Did not test on physical device.'],
  };

  const parsed = ContributionPlanSchema.safeParse(validPlan);
  assert.equal(parsed.success, true);
});

test('ContributionPlanSchema: enforces maximum of 3 first steps', () => {
  const invalidPlan = {
    issueSummary: 'Summary',
    suspectedArea: 'Area',
    firstSteps: [
      { title: '1', explanation: 'e1', evidenceIds: [], verification: 'verified' },
      { title: '2', explanation: 'e2', evidenceIds: [], verification: 'verified' },
      { title: '3', explanation: 'e3', evidenceIds: [], verification: 'verified' },
      { title: '4', explanation: 'e4', evidenceIds: [], verification: 'verified' },
    ],
    relevantFiles: [],
    reproduction: [],
    openQuestions: [],
    limitations: [],
  };

  const parsed = ContributionPlanSchema.safeParse(invalidPlan);
  assert.equal(parsed.success, false);
});

test('AnalyzeRequestSchema: rejects non-github and malformed URLs', () => {
  const invalid = {
    repositoryUrl: 'https://gitlab.com/owner/repo',
    issueUrl: 'https://github.com/owner/repo/issues/1',
  };

  const parsed = AnalyzeRequestSchema.safeParse(invalid);
  assert.equal(parsed.success, false);
});
