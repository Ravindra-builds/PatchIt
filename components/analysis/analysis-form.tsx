'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ScreenshotPicker, AllowedMimeType } from './screenshot-picker';
import { EXAMPLE_ISSUES } from '@/features/analysis/mock-data';
import { ArrowRight, GitFork, AlertCircle } from 'lucide-react';
import { AnalyzeRequest } from '@/features/analysis/types';

interface AnalysisFormProps {
  onSubmit: (data: AnalyzeRequest) => void;
  isLoading: boolean;
}

const INPUT_BASE =
  'h-10 w-full rounded-lg border bg-surface px-3 font-mono text-[13px] text-fg placeholder:text-faint outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-ring disabled:opacity-60';

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [issueUrl, setIssueUrl] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | undefined>();
  const [screenshotMimeType, setScreenshotMimeType] = useState<AllowedMimeType | undefined>();
  const [fieldErrors, setFieldErrors] = useState<{ repo?: string; issue?: string }>({});

  const validate = () => {
    const errors: { repo?: string; issue?: string } = {};

    if (!repoUrl.trim()) {
      errors.repo = 'Enter a public GitHub repository URL, e.g. https://github.com/facebook/react';
    } else if (!repoUrl.includes('github.com')) {
      errors.repo = 'Only github.com repository URLs are supported.';
    }

    if (!issueUrl.trim()) {
      errors.issue = 'Enter a GitHub issue URL, e.g. https://github.com/facebook/react/issues/28000';
    } else if (!issueUrl.includes('github.com') || !issueUrl.includes('/issues/')) {
      errors.issue = 'Must be a valid issue URL containing /issues/{number}.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      repositoryUrl: repoUrl.trim(),
      issueUrl: issueUrl.trim(),
      screenshotBase64,
      screenshotMimeType,
    });
  };

  const handleSelectExample = (example: (typeof EXAMPLE_ISSUES)[0]) => {
    setRepoUrl(example.repoUrl);
    setIssueUrl(example.issueUrl);
    setFieldErrors({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-surface shadow-card"
    >
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-fg">
          <GitFork className="h-4 w-4 text-accent" />
          Issue details
        </h2>
        <p className="text-sm text-muted">
          Paste a public GitHub repository and one of its issues.
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="space-y-4">
          {/* Repo URL */}
          <div className="space-y-1.5">
            <label htmlFor="repo-url" className="block text-sm font-medium text-fg">
              Repository URL
            </label>
            <input
              id="repo-url"
              name="repositoryUrl"
              type="url"
              aria-invalid={fieldErrors.repo ? true : undefined}
              aria-describedby={fieldErrors.repo ? 'repo-url-error' : undefined}
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                if (fieldErrors.repo) setFieldErrors((prev) => ({ ...prev, repo: undefined }));
              }}
              placeholder="https://github.com/facebook/react"
              disabled={isLoading}
              className={`${INPUT_BASE} ${fieldErrors.repo ? 'border-danger' : 'border-border'}`}
            />
            {fieldErrors.repo && (
              <p id="repo-url-error" className="mt-1 flex items-start gap-1.5 text-xs text-danger">
                <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
                {fieldErrors.repo}
              </p>
            )}
          </div>

          {/* Issue URL */}
          <div className="space-y-1.5">
            <label htmlFor="issue-url" className="block text-sm font-medium text-fg">
              Issue URL
            </label>
            <input
              id="issue-url"
              name="issueUrl"
              type="url"
              aria-invalid={fieldErrors.issue ? true : undefined}
              aria-describedby={fieldErrors.issue ? 'issue-url-error' : undefined}
              value={issueUrl}
              onChange={(e) => {
                setIssueUrl(e.target.value);
                if (fieldErrors.issue) setFieldErrors((prev) => ({ ...prev, issue: undefined }));
              }}
              placeholder="https://github.com/facebook/react/issues/28000"
              disabled={isLoading}
              className={`${INPUT_BASE} ${fieldErrors.issue ? 'border-danger' : 'border-border'}`}
            />
            {fieldErrors.issue && (
              <p id="issue-url-error" className="mt-1 flex items-start gap-1.5 text-xs text-danger">
                <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
                {fieldErrors.issue}
              </p>
            )}
          </div>
        </div>

        {/* Quick demo issue loader */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Try an example</span>
          {EXAMPLE_ISSUES.map((ex) => (
            <Button
              key={ex.id}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSelectExample(ex)}
              disabled={isLoading}
            >
              {ex.id === 'react-fresh-multiple-renderer' ? 'React #28000' : 'Next.js #58410'}
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
