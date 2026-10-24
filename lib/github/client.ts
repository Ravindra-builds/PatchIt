import { AppError } from '../errors';
import { getServerEnv } from '../env';

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

export class GithubClient {
  private token?: string;
  private timeoutMs: number;

  constructor() {
    try {
      const env = getServerEnv();
      this.token = env.GITHUB_TOKEN;
      this.timeoutMs = env.ANALYSIS_TIMEOUT_MS;
    } catch {
      this.timeoutMs = 60000;
    }
  }

  private async request(endpoint: string, rawText = false): Promise<{ data: any; status: number }> {
    const url = `${GITHUB_API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'User-Agent': 'PatchPath-Agent/1.0',
      Accept: rawText ? 'application/vnd.github.v3.raw' : 'application/vnd.github.v3+json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });

      if (response.status === 404) {
        throw new AppError(
          'GITHUB_NOT_FOUND',
          'We couldn’t read this repository or issue. Verify that the repository is public and that the links are correct.',
          404
        );
      }

      if (response.status === 403) {
        const rateRemaining = response.headers.get('x-ratelimit-remaining');
        if (rateRemaining === '0') {
          throw new AppError(
            'GITHUB_RATE_LIMITED',
            'GitHub API rate limit reached. Please try again shortly or configure a read-only GITHUB_TOKEN.',
            429
          );
        }
        throw new AppError(
          'GITHUB_NOT_FOUND',
          'Access forbidden. Check if this repository is private or restricted.',
          403
        );
      }

      if (!response.ok) {
        throw new AppError(
          'INTERNAL_ERROR',
          `GitHub API responded with status ${response.status}`,
          response.status
        );
      }

      if (rawText) {
        const text = await response.text();
        return { data: text, status: response.status };
      }

      const json = await response.json();
      return { data: json, status: response.status };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new AppError('ANALYSIS_TIMEOUT', 'GitHub request timed out.', 504);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getRepo(owner: string, repo: string): Promise<GithubRepoData> {
    const { data } = await this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
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
    const { data } = await this.request(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}`
    );

    const labels = Array.isArray(data.labels)
      ? data.labels.map((l: any) => (typeof l === 'string' ? l : l.name || '')).filter(Boolean)
      : [];

    return {
      number: data.number,
      title: data.title || '',
      body: data.body || '',
      state: data.state || 'open',
      labels,
      htmlUrl: data.html_url || `https://github.com/${owner}/${repo}/issues/${issueNumber}`,
      author: data.user?.login || 'unknown',
      createdAt: data.created_at || new Date().toISOString(),
    };
  }

  async getReadme(owner: string, repo: string): Promise<string | null> {
    try {
      const { data } = await this.request(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`,
        true
      );
      return typeof data === 'string' ? data : null;
    } catch {
      return null;
    }
  }

  async getTree(owner: string, repo: string, branch: string): Promise<GithubTreeEntry[]> {
    try {
      const { data } = await this.request(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`
      );
      if (data && Array.isArray(data.tree)) {
        return data.tree;
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch full git tree, falling back to empty list', err);
      return [];
    }
  }

  async getFileContent(
    owner: string,
    repo: string,
    branch: string,
    filePath: string,
    maxBytes = 16 * 1024
  ): Promise<{ content: string; truncated: boolean }> {
    try {
      const { data } = await this.request(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath}?ref=${encodeURIComponent(branch)}`,
        true
      );
      if (typeof data !== 'string') {
        return { content: '', truncated: false };
      }

      if (data.length > maxBytes) {
        return {
          content: data.slice(0, maxBytes),
          truncated: true,
        };
      }
      return { content: data, truncated: false };
    } catch {
      return { content: '', truncated: false };
    }
  }
}
