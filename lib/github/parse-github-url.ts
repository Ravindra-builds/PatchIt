import { AppError } from '../errors';

export interface ParsedGithubRepo {
  owner: string;
  repo: string;
}

export interface ParsedGithubIssue extends ParsedGithubRepo {
  issueNumber: number;
}

/**
 * Parses and validates a GitHub repository URL.
 * Accepts:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo/
 *   https://github.com/owner/repo.git
 */
export function parseGithubRepoUrl(inputUrl: string): ParsedGithubRepo {
  let parsed: URL;
  try {
    parsed = new URL(inputUrl.trim());
  } catch {
    throw new AppError(
      'INVALID_GITHUB_URL',
      'Please enter a valid GitHub repository URL, e.g. https://github.com/owner/repo'
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname !== 'github.com' && hostname !== 'www.github.com') {
    throw new AppError(
      'INVALID_GITHUB_URL',
      'Only public repositories hosted on github.com are supported.'
    );
  }

  const pathSegments = parsed.pathname
    .split('/')
    .filter(Boolean)
    .map((s) => s.replace(/\.git$/i, ''));

  if (pathSegments.length < 2) {
    throw new AppError(
      'INVALID_GITHUB_URL',
      'Repository URL must include both owner and repository name, e.g. https://github.com/owner/repo'
    );
  }

  const [owner, repo] = pathSegments;

  // Basic GitHub username/repo validation
  const nameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!nameRegex.test(owner) || !nameRegex.test(repo)) {
    throw new AppError(
      'INVALID_GITHUB_URL',
      'The owner and repository names contain invalid characters.'
    );
  }

  return { owner, repo };
}

/**
 * Parses and validates a GitHub issue URL.
 * Accepts:
 *   https://github.com/owner/repo/issues/42
 *   https://github.com/owner/repo/issues/42/
 */
export function parseGithubIssueUrl(inputUrl: string): ParsedGithubIssue {
  let parsed: URL;
  try {
    parsed = new URL(inputUrl.trim());
  } catch {
    throw new AppError(
      'INVALID_GITHUB_URL',
      'Please enter a valid GitHub issue URL, e.g. https://github.com/owner/repo/issues/42'
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname !== 'github.com' && hostname !== 'www.github.com') {
    throw new AppError(
      'INVALID_GITHUB_URL',
      'Only issues hosted on github.com are supported.'
    );
  }

  const pathSegments = parsed.pathname.split('/').filter(Boolean);

  if (
    pathSegments.length < 4 ||
    pathSegments[2].toLowerCase() !== 'issues' ||
    !/^\d+$/.test(pathSegments[3])
  ) {
    throw new AppError(
      'INVALID_GITHUB_URL',
      'Issue URL must follow the format https://github.com/owner/repo/issues/{number}'
    );
  }

  const owner = pathSegments[0];
  const repo = pathSegments[1].replace(/\.git$/i, '');
  const issueNumber = parseInt(pathSegments[3], 10);

  if (issueNumber <= 0 || isNaN(issueNumber)) {
    throw new AppError('INVALID_GITHUB_URL', 'Issue number must be a positive integer.');
  }

  return { owner, repo, issueNumber };
}

/**
 * Validates that an issue belongs to the given repository.
 */
export function validateRepoAndIssueMatch(
  repoUrl: string,
  issueUrl: string
): { owner: string; repo: string; issueNumber: number } {
  const parsedRepo = parseGithubRepoUrl(repoUrl);
  const parsedIssue = parseGithubIssueUrl(issueUrl);

  if (
    parsedRepo.owner.toLowerCase() !== parsedIssue.owner.toLowerCase() ||
    parsedRepo.repo.toLowerCase() !== parsedIssue.repo.toLowerCase()
  ) {
    throw new AppError(
      'ISSUE_REPOSITORY_MISMATCH',
      `That issue belongs to ${parsedIssue.owner}/${parsedIssue.repo}, but the repository field is ${parsedRepo.owner}/${parsedRepo.repo}. Check both links and try again.`
    );
  }

  return {
    owner: parsedRepo.owner,
    repo: parsedRepo.repo,
    issueNumber: parsedIssue.issueNumber,
  };
}
