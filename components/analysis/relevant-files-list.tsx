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

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return <Badge variant="teal">High Relevance</Badge>;
      case 'medium':
        return <Badge variant="blue">Medium Relevance</Badge>;
      case 'low':
        return <Badge variant="slate">Low Relevance</Badge>;
    }
  };

  return (
    <div className="bg-[#111A27] border border-[#273548] rounded-xl p-5 sm:p-6 space-y-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#E6EDF5] flex items-center gap-2">
          <FolderCode className="w-4 h-4 text-[#48C9A4]" />
          Files Worth Opening
        </h2>
        <span className="text-xs text-[#9BAABD]">
          {files.length} sampled candidate {files.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      <div className="divide-y divide-[#273548] border border-[#273548] rounded-lg overflow-hidden bg-[#172233]">
        {files.map((file, index) => (
          <div
            key={index}
            className="p-3.5 hover:bg-[#1a273b] transition-colors space-y-1.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <a
                  href={file.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs sm:text-sm text-[#8AB8F9] hover:text-[#b5d3ff] hover:underline flex items-center gap-1.5 font-medium truncate"
                >
                  <span className="truncate">{file.path}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(file.path)}
                  className="text-[#9BAABD] hover:text-[#E6EDF5] p-1 rounded transition-colors shrink-0 cursor-pointer"
                  title="Copy file path"
                >
                  {copiedPath === file.path ? (
                    <Check className="w-3 h-3 text-[#48C9A4]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              <div className="shrink-0">
                {getConfidenceBadge(file.confidence)}
              </div>
            </div>

            <p className="text-xs text-[#9BAABD] leading-relaxed">
              {file.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
