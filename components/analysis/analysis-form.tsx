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
      className="bg-[#111A27] border border-[#273548] rounded-xl p-5 sm:p-7 space-y-5 shadow-lg"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#273548]/60">
        <div>
          <h2 className="text-base font-semibold text-[#E6EDF5] flex items-center gap-2">
            <GitFork className="w-4 h-4 text-[#48C9A4]" />
            Provide GitHub Target
          </h2>
          <p className="text-xs text-[#9BAABD]">
            Input any public GitHub repository and issue to orient yourself before contributing.
          </p>
        </div>

        {/* Quick demo issue loader */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] text-[#9BAABD] mr-1 hidden md:inline">Try an example:</span>
          {EXAMPLE_ISSUES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => handleSelectExample(ex)}
              disabled={isLoading}
              className="text-[11px] font-mono px-2 py-1 rounded bg-[#172233] hover:bg-[#1f2e45] text-[#8AB8F9] border border-[#273548] transition-colors cursor-pointer"
            >
              {ex.id === 'react-fresh-multiple-renderer' ? 'React #28000' : 'Next.js #58410'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Repo URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#E6EDF5]">
            Repository URL <span className="text-[#48C9A4]">*</span>
          </label>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => {
              setRepoUrl(e.target.value);
              if (fieldErrors.repo) setFieldErrors((prev) => ({ ...prev, repo: undefined }));
            }}
            placeholder="https://github.com/facebook/react"
            disabled={isLoading}
            className="w-full bg-[#172233] border border-[#273548] focus:border-[#48C9A4] focus:ring-1 focus:ring-[#48C9A4] rounded-lg px-3.5 py-2 text-sm text-[#E6EDF5] placeholder-[#9BAABD]/50 outline-none transition-all font-mono"
          />
          {fieldErrors.repo && (
            <p className="text-xs text-[#F08080] flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {fieldErrors.repo}
            </p>
          )}
        </div>

        {/* Issue URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#E6EDF5]">
            Issue URL <span className="text-[#48C9A4]">*</span>
          </label>
          <input
            type="url"
            value={issueUrl}
            onChange={(e) => {
              setIssueUrl(e.target.value);
              if (fieldErrors.issue) setFieldErrors((prev) => ({ ...prev, issue: undefined }));
            }}
            placeholder="https://github.com/facebook/react/issues/28000"
            disabled={isLoading}
            className="w-full bg-[#172233] border border-[#273548] focus:border-[#48C9A4] focus:ring-1 focus:ring-[#48C9A4] rounded-lg px-3.5 py-2 text-sm text-[#E6EDF5] placeholder-[#9BAABD]/50 outline-none transition-all font-mono"
          />
          {fieldErrors.issue && (
            <p className="text-xs text-[#F08080] flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {fieldErrors.issue}
            </p>
          )}
        </div>
      </div>

      {/* Screenshot picker */}
      <ScreenshotPicker
        onImageSelected={(base64, mimeType) => {
          setScreenshotBase64(base64);
          setScreenshotMimeType(mimeType);
        }}
      />

      {/* Submit footer */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#273548]/60">
        <p className="text-[11px] text-[#9BAABD] leading-relaxed">
          Public repository data is read on-demand. Screenshots are processed in server memory and not stored.
        </p>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isLoading}
          disabled={isLoading}
          className="w-full sm:w-auto shrink-0"
        >
          <span>Build contribution plan</span>
          {!isLoading && <ArrowRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </form>
  );
}
