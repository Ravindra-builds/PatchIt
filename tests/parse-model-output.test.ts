import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAndValidateModelOutput } from '../lib/ai/parse-model-output';
import { AppError } from '../lib/errors';
import { EvidencePacket } from '../features/analysis/types';

const repository = {
  owner: 'acme',
  name: 'widgets',
  fullName: 'acme/widgets',
  htmlUrl: 'https://github.com/acme/widgets',
  description: null,
  defaultBranch: 'main',
};

const packet: EvidencePacket = {
  repository,
  issue: {
    number: 1,
    title: 't',
    body: 'b',
    state: 'open',
    labels: [],
    htmlUrl: 'https://github.com/acme/widgets/issues/1',
    author: 'someone',
    createdAt: '2026-01-01T00:00:00Z',
    repository,
  },
  evidenceItems: [
    { id: 'issue-details', kind: 'issue', title: 'Issue', url: '', content: '', truncated: false },
    { id: 'source-file-0', kind: 'source_file', title: 'File: src/a b#c.ts', url: '', content: 'x', truncated: false, path: 'src/a b#c.ts' },
  ],
  allTreePaths: ['src/a b#c.ts', 'src/real.ts'],
  treeTruncated: false,
};

const basePlan = {
  issueSummary: 'summary',
  suspectedArea: 'area',
  firstSteps: [],
  relevantFiles: [],
  reproduction: [],
  openQuestions: [],
  limitations: [],
};

test('parseAndValidateModelOutput: code fences inside JSON strings do not break parsing', () => {
  const raw = JSON.stringify({
    ...basePlan,
    reproduction: [{ instruction: '```bash\nnpm test\n```', source: null, verification: 'suggested' }],
  });
  const plan = parseAndValidateModelOutput(raw, packet);
  assert.equal(plan.reproduction[0].instruction, '```bash\nnpm test\n```');
});

test('parseAndValidateModelOutput: still unwraps a fenced JSON response', () => {
  const raw = '```json\n' + JSON.stringify(basePlan) + '\n```';
  const plan = parseAndValidateModelOutput(raw, packet);
  assert.equal(plan.issueSummary, 'summary');
});

test('parseAndValidateModelOutput: drops files not in the repository tree and rebuilds links', () => {
  const raw = JSON.stringify({
    ...basePlan,
    relevantFiles: [
      { path: 'does/not/exist.ts', reason: 'r', githubUrl: 'https://github.com/acme/widgets/blob/main/does/not/exist.ts', evidenceIds: [], confidence: 'high' },
      { path: '/src/real.ts', reason: 'r', githubUrl: 'https://evil.example/phish', evidenceIds: ['source-file-0', 'fake-id'], confidence: 'high' },
      { path: 'src/real.ts', reason: 'duplicate', githubUrl: '', evidenceIds: [], confidence: 'low' },
      { path: 'src/a b#c.ts', reason: 'r', githubUrl: '', evidenceIds: [], confidence: 'medium' },
    ],
  });
  const plan = parseAndValidateModelOutput(raw, packet);

  assert.deepEqual(plan.relevantFiles.map((f) => f.path), ['src/real.ts', 'src/a b#c.ts']);
  assert.equal(plan.relevantFiles[0].githubUrl, 'https://github.com/acme/widgets/blob/main/src/real.ts');
  assert.deepEqual(plan.relevantFiles[0].evidenceIds, ['source-file-0']);
  assert.equal(plan.relevantFiles[1].githubUrl, 'https://github.com/acme/widgets/blob/main/src/a%20b%23c.ts');
});

test('parseAndValidateModelOutput: steps without real evidence cannot be "verified"', () => {
  const raw = JSON.stringify({
    ...basePlan,
    firstSteps: [
      { title: 'a', explanation: 'e', evidenceIds: ['fake-id'], verification: 'verified' },
      { title: 'b', explanation: 'e', evidenceIds: ['issue-details'], verification: 'verified' },
    ],
  });
  const plan = parseAndValidateModelOutput(raw, packet);
  assert.equal(plan.firstSteps[0].verification, 'needs_verification');
  assert.deepEqual(plan.firstSteps[0].evidenceIds, []);
  assert.equal(plan.firstSteps[1].verification, 'verified');
});

test('parseAndValidateModelOutput: malformed output raises AI_INVALID_RESPONSE', () => {
  assert.throws(
    () => parseAndValidateModelOutput('not json at all', packet),
    (err: unknown) => err instanceof AppError && err.code === 'AI_INVALID_RESPONSE'
  );
});
