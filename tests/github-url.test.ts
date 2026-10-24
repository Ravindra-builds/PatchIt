import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseGithubRepoUrl,
  parseGithubIssueUrl,
  validateRepoAndIssueMatch,
} from '../lib/github/parse-github-url';
import { AppError } from '../lib/errors';

test('parseGithubRepoUrl: parses valid GitHub URLs', () => {
  const cases = [
    { input: 'https://github.com/facebook/react', expected: { owner: 'facebook', repo: 'react' } },
    { input: 'https://github.com/facebook/react/', expected: { owner: 'facebook', repo: 'react' } },
    { input: 'https://github.com/facebook/react.git', expected: { owner: 'facebook', repo: 'react' } },
    { input: 'https://www.github.com/vercel/next.js', expected: { owner: 'vercel', repo: 'next.js' } },
  ];

  for (const c of cases) {
    const res = parseGithubRepoUrl(c.input);
    assert.deepEqual(res, c.expected);
  }
});

test('parseGithubRepoUrl: rejects invalid hosts and malformed URLs', () => {
  const invalidInputs = [
    'https://gitlab.com/owner/repo',
    'https://evil.com/github.com/owner/repo',
    'not-a-url',
    'https://github.com/onlyowner',
    'https://github.com/',
  ];

  for (const input of invalidInputs) {
    assert.throws(() => parseGithubRepoUrl(input), AppError);
  }
});

test('parseGithubIssueUrl: parses valid GitHub issue URLs', () => {
  const cases = [
    {
      input: 'https://github.com/facebook/react/issues/28000',
      expected: { owner: 'facebook', repo: 'react', issueNumber: 28000 },
    },
    {
      input: 'https://github.com/facebook/react/issues/28000/',
      expected: { owner: 'facebook', repo: 'react', issueNumber: 28000 },
    },
    {
      input: 'https://www.github.com/vercel/next.js/issues/123',
      expected: { owner: 'vercel', repo: 'next.js', issueNumber: 123 },
    },
  ];

  for (const c of cases) {
    const res = parseGithubIssueUrl(c.input);
    assert.deepEqual(res, c.expected);
  }
});

test('parseGithubIssueUrl: rejects non-issue and invalid URLs', () => {
  const invalidInputs = [
    'https://github.com/facebook/react/pull/28000',
    'https://github.com/facebook/react/issues/notanumber',
    'https://github.com/facebook/react/issues/-5',
    'https://github.com/facebook/react/issues/0',
    'https://github.com/facebook/react',
  ];

  for (const input of invalidInputs) {
    assert.throws(() => parseGithubIssueUrl(input), AppError);
  }
});

test('validateRepoAndIssueMatch: succeeds when repo and issue match', () => {
  const result = validateRepoAndIssueMatch(
    'https://github.com/facebook/react',
    'https://github.com/facebook/react/issues/28000'
  );
  assert.equal(result.owner, 'facebook');
  assert.equal(result.repo, 'react');
  assert.equal(result.issueNumber, 28000);
});

test('validateRepoAndIssueMatch: throws when repo and issue do not match', () => {
  assert.throws(
    () =>
      validateRepoAndIssueMatch(
        'https://github.com/facebook/react',
        'https://github.com/vercel/next.js/issues/28000'
      ),
    (err: unknown) => {
      assert.ok(err instanceof AppError);
      assert.equal(err.code, 'ISSUE_REPOSITORY_MISMATCH');
      return true;
    }
  );
});
