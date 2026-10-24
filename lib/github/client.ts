import { AppError } from '../errors';
import { getServerEnv } from '../env';
import { timeoutSignal } from '../abort';

const GITHUB_API_BASE = 'https://api.github.com';

export interface GithubIssueData {
  number: number;
  title: string;
  body: string;
  state: string;
  labels: string[];
  htmlUrl: string;
  author: string;
  createdAt: string;
}

export interface GithubRepoData {
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  defaultBranch: string;
}

export interface GithubTreeEntry {
  path: string;
  mode: string;
  type: 'blob' | 'tree' | 'commit';
  sha: string;
  size?: number;
}

export interface GithubTree {
  entries: GithubTreeEntry[];
  truncated: boolean;
}

// Minimal shapes of the GitHub REST responses we read.
interface RawRepo {
  owner?: { login?: string };
  name?: string;
  full_name?: string;
  html_url?: string;
  description?: string | null;
  default_branch?: string;
}

interface RawIssue {
  number?: number;
  title?: string;
  body?: string | null;
  state?: string;
  labels?: Array<string | { name?: string }>;
  html_url?: string;
  user?: { login?: string } | null;
  created_at?: string;
}

interface RawTree {
  tree?: GithubTreeEntry[];
  truncated?: boolean;
}

export interface GithubClientOptions {
  token?: string;
  timeoutMs?: number;
  /** Aborts every in-flight request, e.g. when the overall analysis deadline passes. */
  signal?: AbortSignal;
}

function encodePath(filePath: string): string {
  return filePath.split('/').map(encodeURIComponent).join('/');
}

export class GithubClient {
  private token?: string;
  private timeoutMs: number;
  private signal?: AbortSignal;

  constructor(options: GithubClientOptions = {}) {
    let envToken: string | undefined;
    let envTimeout = 60000;
    try {
      const env = getServerEnv();
      envToken = env.GITHUB_TOKEN;
      envTimeout = env.ANALYSIS_TIMEOUT_MS;
    } catch {
      // Fall back to defaults when env is unavailable (e.g. in tests).
    }
    this.token = options.token ?? envToken;
    this.timeoutMs = options.timeoutMs ?? envTimeout;
    this.signal = options.signal;
  }

  private repoPath(owner: string, repo: string): string {
    return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  }

  private request<T>(endpoint: string): Promise<T>;
  private request(endpoint: string, rawText: true): Promise<string>;
  private async request<T>(endpoint: string, rawText = false): Promise<T | string> {
    const url = `${GITHUB_API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'User-Agent': 'PatchIt-Agent/1.0',
      Accept: rawText ? 'application/vnd.github.raw' : 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const timeout = timeoutSignal(this.timeoutMs, this.signal);

    try {
      let response: Response;
      try {
        response = await fetch(url, { headers, signal: timeout.signal });
      } catch (err: unknown) {
        if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
          throw new AppError('ANALYSIS_TIMEOUT', 'GitHub request timed out. Please try again.', 504);
        }
        throw new AppError('GITHUB_UNAVAILABLE', 'Could not reach the GitHub API. Please try again.', 502);
      }

      if (!response.ok) {
        throw this.toAppError(response);
      }

      return rawText ? await response.text() : ((await response.json()) as T);
    } finally {
      timeout.clear();
    }
  }

  private toAppError(response: Response): AppError {
    const { status } = response;
    const rateRemaining = response.headers.get('x-ratelimit-remaining');
    const retryAfter = response.headers.get('retry-after');

    if (status === 429 || (status === 403 && (rateRemaining === '0' || retryAfter !== null))) {
      return new AppError(
        'GITHUB_RATE_LIMITED',
        this.token
          ? 'GitHub API rate limit reached. Please try again shortly.'
          : 'GitHub API rate limit reached. Please try again shortly or configure a read-only GITHUB_TOKEN.',
        429
      );
    }

    if (status === 401) {
      return new AppError(
        'GITHUB_UNAVAILABLE',
        'GitHub rejected the configured GITHUB_TOKEN. Check that it is valid and not expired.',
        502
      );
    }

    if (status === 404) {
      return new AppError(
        'GITHUB_NOT_FOUND',
        'We couldn’t read this repository or issue. Verify that the repository is public and that the links are correct.',
        404
      );
    }

    if (status === 403) {
      return new AppError(
        'GITHUB_FORBIDDEN',
        'Access forbidden. Check if this repository is private or restricted.',
        403
      );
    }

    return new AppError('GITHUB_UNAVAILABLE', `GitHub API responded with status ${status}.`, 502);
  }

  async getRepo(owner: string, repo: string): Promise<GithubRepoData> {
    const data = await this.request<RawRepo>(this.repoPath(owner, repo));
    return {
      owner: data.owner?.login || owner,
      name: data.name || repo,
      fullName: data.full_name || `${owner}/${repo}`,
      htmlUrl: data.html_url || `https://github.com/${owner}/${repo}`,
      description: data.description ?? null,
      defaultBranch: data.default_branch || 'main',
    };
  }

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GithubIssueData> {
    const data = await this.request<RawIssue>(`${this.repoPath(owner, repo)}/issues/${issueNumber}`);

    const labels = Array.isArray(data.labels)
      ? data.labels.map((l) => (typeof l === 'string' ? l : l.name || '')).filter(Boolean)
      : [];

    return {
      number: data.number ?? issueNumber,
      title: data.title || '',
      body: data.body || '',
      state: data.state || 'open',
      labels,
      htmlUrl: data.html_url || `https://github.com/${owner}/${repo}/issues/${issueNumber}`,
      author: data.user?.login || 'unknown',
      createdAt: data.created_at || new Date().toISOString(),
    };
  }

  /** Returns null when the repository has no README. Other failures (rate limits, timeouts) propagate. */
  async getReadme(owner: string, repo: string): Promise<string | null> {
    try {
      return await this.request(`${this.repoPath(owner, repo)}/readme`, true);
    } catch (err) {
      if (err instanceof AppError && err.code === 'GITHUB_NOT_FOUND') return null;
      throw err;
    }
  }

  /** Returns an empty tree for empty repositories. Other failures propagate. */
  async getTree(owner: string, repo: string, branch: string): Promise<GithubTree> {
    try {
      const data = await this.request<RawTree>(
        `${this.repoPath(owner, repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`
      );
      return {
        entries: Array.isArray(data.tree) ? data.tree : [],
        truncated: Boolean(data.truncated),
      };
    } catch (err) {
      if (err instanceof AppError && err.code === 'GITHUB_NOT_FOUND') {
        return { entries: [], truncated: false };
      }
      throw err;
    }
  }

  /** Returns empty content when the file is missing. Other failures propagate. */
  async getFileContent(
    owner: string,
    repo: string,
    branch: string,
    filePath: string,
    maxChars = 16 * 1024
  ): Promise<{ content: string; truncated: boolean }> {
    try {
      const data = await this.request(
        `${this.repoPath(owner, repo)}/contents/${encodePath(filePath)}?ref=${encodeURIComponent(branch)}`,
        true
      );
      if (data.length > maxChars) {
        return { content: data.slice(0, maxChars), truncated: true };
      }
      return { content: data, truncated: false };
    } catch (err) {
      if (err instanceof AppError && err.code === 'GITHUB_NOT_FOUND') {
        return { content: '', truncated: false };
      }
      throw err;
    }
  }
}
