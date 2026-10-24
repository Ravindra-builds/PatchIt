'use client';
import React, { useState } from 'react';
import { RelevantFile } from '@/features/analysis/types';
import { Badge } from '../ui/badge';
import { FolderCode, ExternalLink, Copy, Check } from 'lucide-react';

interface RelevantFilesListProps {
  files: RelevantFile[];
}

export function RelevantFilesList({ files }: RelevantFilesListProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  if (!files || files.length === 0) return null;

  const handleCopy = async (path: string) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(path);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  };

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return <Badge variant="accent">High relevance</Badge>;
      case 'medium':
        return <Badge variant="info">Medium relevance</Badge>;
      case 'low':
        return <Badge variant="neutral">Low relevance</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-fg">
          <FolderCode className="h-4 w-4 text-muted" />
          Files worth opening
        </h2>
        <span className="text-xs text-faint">
          {files.length} sampled candidate {files.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      <div className="divide-y divide-border px-5 sm:px-6">
        {files.map((file, index) => (
          <div key={index} className="space-y-1.5 py-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-2">
                <a
                  href={file.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-1.5 font-mono text-[13px] font-medium text-info underline-offset-4 hover:underline"
                >
                  <span className="truncate">{file.path}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(file.path)}
                  className="shrink-0 cursor-pointer rounded p-1 text-muted transition-colors hover:bg-subtle hover:text-fg"
                  title="Copy file path"
                >
                  {copiedPath === file.path ? (
                    <Check className="h-3.5 w-3.5 text-accent" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="shrink-0">{getConfidenceBadge(file.confidence)}</div>
            </div>

            <p className="text-sm leading-6 text-muted">{file.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
