'use client';
import React from 'react';
import { IssueMetadata, ContributionPlan } from '@/features/analysis/types';
import { Badge } from '../ui/badge';
import { ExternalLink, Copy, Check, Download } from 'lucide-react';

interface IssueHeaderProps {
  issue: IssueMetadata;
  plan: ContributionPlan;
  modelUsed: string;
}

export function IssueHeader({ issue, plan, modelUsed }: IssueHeaderProps) {
  const [copied, setCopied] = React.useState(false);

  const generateMarkdown = () => {
    let md = `# PatchPath Contribution Plan\n\n`;
    md += `**Repository:** [${issue.repository.fullName}](${issue.repository.htmlUrl})\n`;
    md += `**Issue:** [#${issue.number} ${issue.title}](${issue.htmlUrl})\n`;
    md += `**Analyzed With:** ${modelUsed}\n\n`;
    md += `## Issue Summary\n${plan.issueSummary}\n\n`;
    md += `**Suspected Subsystem / Area:** ${plan.suspectedArea}\n\n`;

    md += `## Start Here (Prioritized Steps)\n`;
    plan.firstSteps.forEach((step, idx) => {
      md += `${idx + 1}. **${step.title}** (${step.verification.toUpperCase()})\n   ${step.explanation}\n\n`;
    });

    md += `## Relevant Files Worth Opening\n`;
    plan.relevantFiles.forEach((file) => {
      md += `- [${file.path}](${file.githubUrl}) [Confidence: ${file.confidence}]\n  ${file.reason}\n\n`;
    });

    if (plan.reproduction.length > 0) {
      md += `## Reproduction & Testing Clues\n`;
      plan.reproduction.forEach((item) => {
        md += `- \`${item.instruction}\` (${item.verification}${item.source ? ` - from ${item.source}` : ''})\n`;
      });
      md += `\n`;
    }

    if (plan.openQuestions.length > 0) {
      md += `## Open Questions & Things to Verify\n`;
      plan.openQuestions.forEach((q) => {
        md += `- ${q}\n`;
      });
      md += `\n`;
    }

    if (plan.limitations.length > 0) {
      md += `## Limitations & Boundaries\n`;
      plan.limitations.forEach((l) => {
        md += `- ${l}\n`;
      });
      md += `\n`;
    }

    return md;
  };

  const handleCopyMarkdown = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(generateMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patchpath-issue-${issue.number}-plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#111A27] border border-[#273548] rounded-xl p-5 sm:p-6 space-y-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#9BAABD]">
          <a
            href={issue.repository.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[#8AB8F9] hover:underline font-mono flex items-center gap-1"
          >
            {issue.repository.fullName}
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>/</span>
          <span className="font-mono text-[#E6EDF5]">Issue #{issue.number}</span>
          <Badge variant={issue.state === 'open' ? 'teal' : 'slate'}>
            {issue.state}
          </Badge>
          <Badge variant="blue" className="hidden sm:inline-flex">
            {modelUsed.replace('gemma-', 'Gemma ')}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-[#172233] hover:bg-[#1e2c3f] border border-[#273548] text-[#E6EDF5] transition-colors cursor-pointer"
            title="Copy plan as Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#48C9A4]" /> : <Copy className="w-3.5 h-3.5 text-[#9BAABD]" />}
            <span>{copied ? 'Copied' : 'Copy Plan'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-[#172233] hover:bg-[#1e2c3f] border border-[#273548] text-[#E6EDF5] transition-colors cursor-pointer"
            title="Download plan as Markdown file"
          >
            <Download className="w-3.5 h-3.5 text-[#9BAABD]" />
            <span className="hidden sm:inline">Export .md</span>
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-xl sm:text-2xl font-bold text-[#E6EDF5] tracking-tight">
          {issue.title}
        </h1>
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {issue.labels.map((label) => (
              <span
                key={label}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#172233] text-[#9BAABD] border border-[#273548]"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-[#172233]/70 rounded-lg border border-[#273548]/70 text-xs space-y-1">
        <div className="text-[#9BAABD]">
          <strong className="text-[#E6EDF5]">Suspected Subsystem:</strong>{' '}
          <span className="font-mono text-[#48C9A4]">{plan.suspectedArea}</span>
        </div>
        <p className="text-[#E6EDF5] leading-relaxed pt-1">{plan.issueSummary}</p>
      </div>
    </div>
  );
}
