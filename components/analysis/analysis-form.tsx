'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ScreenshotPicker, AllowedMimeType } from './screenshot-picker';
import { EXAMPLE_ISSUES } from '@/features/analysis/mock-data';
import { ArrowRight, GitFork, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AnalyzeRequest } from '@/features/analysis/types';
import { parseGithubIssueUrl, parseGithubRepoUrl, ParsedGithubRepo } from '@/lib/github/parse-github-url';

// Same parsers the API route uses, so the form rejects exactly what the server would.
function tryParse<T>(parse: () => T): { value?: T; error?: string } {
  try {
    return { value: parse() };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Invalid URL.' };
  }
}

// Accept pasted links without a scheme, e.g. "github.com/owner/repo".
function withScheme(url: string) {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function repoUrlFor({ owner, repo }: ParsedGithubRepo) {
  return `https://github.com/${owner}/${repo}`;
}

interface AnalysisFormProps {
  onSubmit: (data: AnalyzeRequest) => void;
  isLoading: boolean;
}

const INPUT_BASE =
  'h-10 w-full rounded-lg border bg-surface px-3 font-mono text-[13px] text-fg placeholder:text-faint outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-ring disabled:opacity-60';

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [issueUrl, setIssueUrl] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | undefined>();
  const [screenshotMimeType, setScreenshotMimeType] = useState<AllowedMimeType | undefined>();
  const [issueError, setIssueError] = useState<string | undefined>();

  // The issue URL already names its repository, so the repository is derived rather than typed.
  const parsedIssue = issueUrl.trim() ? tryParse(() => parseGithubIssueUrl(withScheme(issueUrl))) : {};

  const validate = () => {
    let error: string | undefined;

    if (!issueUrl.trim()) {
      error = 'Enter a GitHub issue URL, e.g. https://github.com/facebook/react/issues/28000';
    } else if (parsedIssue.error) {
      // A repository (or pull request) link: say what's missing instead of a format error.
      const pastedRepo = tryParse(() => parseGithubRepoUrl(withScheme(issueUrl))).value;
      error = pastedRepo
        ? `This links to ${pastedRepo.owner}/${pastedRepo.repo}, not a specific issue. Open one of its issues and paste that link (…/issues/123).`
        : parsedIssue.error;
    }

    setIssueError(error);
    return !error;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !parsedIssue.value) return;

    onSubmit({
      repositoryUrl: repoUrlFor(parsedIssue.value),
      issueUrl: withScheme(issueUrl),
      screenshotBase64,
      screenshotMimeType,
    });
  };

  const handleSelectExample = (example: (typeof EXAMPLE_ISSUES)[0]) => {
    setIssueUrl(example.issueUrl);
    setIssueError(undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-border bg-surface shadow-card"
    >
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-fg">
          <GitFork className="h-4 w-4 text-accent" />
          Issue details
        </h2>
        <p className="mt-1 text-sm text-muted">
          Paste a GitHub issue from any public repository.
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* Issue URL */}
        <div className="space-y-1.5">
          <label htmlFor="issue-url" className="block text-sm font-medium text-fg">
            Issue URL
          </label>
          <input
            id="issue-url"
            name="issueUrl"
            type="url"
            aria-invalid={issueError ? true : undefined}
            aria-describedby={issueError ? 'issue-url-error' : 'issue-url-hint'}
            value={issueUrl}
            onChange={(e) => {
              setIssueUrl(e.target.value);
              if (issueError) setIssueError(undefined);
            }}
            placeholder="github.com/owner/repo/issues/123"
            disabled={isLoading}
            className={`${INPUT_BASE} ${issueError ? 'border-danger' : 'border-border'}`}
          />
          {issueError ? (
            <p id="issue-url-error" className="mt-1 flex items-start gap-1.5 text-xs text-danger">
              <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
              {issueError}
            </p>
          ) : parsedIssue.value ? (
            <p id="issue-url-hint" className="flex items-center gap-1.5 text-xs text-muted">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="font-mono text-fg">
                {parsedIssue.value.owner}/{parsedIssue.value.repo}
              </span>
              <span>issue #{parsedIssue.value.issueNumber}</span>
            </p>
          ) : (
            <p id="issue-url-hint" className="text-xs text-faint">
              The repository is read from the link.
            </p>
          )}
        </div>

        {/* Quick demo issue loader */}
        <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-4">
          <span className="text-xs text-muted">No issue handy? Try</span>
          {EXAMPLE_ISSUES.map((ex) => (
            <Button
              key={ex.id}
              type="button"
              variant="secondary"
              size="sm"
              title={ex.label}
              onClick={() => handleSelectExample(ex)}
              disabled={isLoading}
            >
              {ex.label.split(':')[0]}
            </Button>
          ))}
        </div>

        {/* Screenshot picker */}
        <ScreenshotPicker
          onImageSelected={(base64, mimeType) => {
            setScreenshotBase64(base64);
            setScreenshotMimeType(mimeType);
          }}
        />

        {/* Submit footer */}
        <div className="space-y-3">
          <Button
            type="submit"
            variant="accent"
            size="md"
            loading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            <span>Build contribution plan</span>
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </Button>
          <p className="text-xs leading-5 text-faint">
            Public repository data is read on-demand. Screenshots are processed in server memory and not stored.
          </p>
        </div>
      </div>
    </form>
  );
}
