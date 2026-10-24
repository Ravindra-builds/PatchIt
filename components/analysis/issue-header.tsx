'use client';
import React from 'react';
import { IssueMetadata, ContributionPlan } from '@/features/analysis/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ExternalLink, Copy, Check, Download } from 'lucide-react';

interface IssueHeaderProps {
  issue: IssueMetadata;
  plan: ContributionPlan;
  modelUsed: string;
}

export function IssueHeader({ issue, plan, modelUsed }: IssueHeaderProps) {
  const [copied, setCopied] = React.useState(false);

  const generateMarkdown = () => {
    let md = `# PatchIt Contribution Plan\n\n`;
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
    a.download = `patchit-issue-${issue.number}-plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-border bg-surface shadow-card">
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-muted">
            <a
              href={issue.repository.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-mono text-[13px] text-info underline-offset-4 hover:underline"
            >
              {issue.repository.fullName}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="font-mono text-[13px] text-muted">#{issue.number}</span>
            <Badge variant={issue.state === 'open' ? 'accent' : 'neutral'}>{issue.state}</Badge>
            <Badge variant="info" className="hidden sm:inline-flex">
              {modelUsed.replace('gemma-', 'Gemma ')}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopyMarkdown}
              title="Copy plan as Markdown"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-accent" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted" />
              )}
              <span>{copied ? 'Copied' : 'Copy plan'}</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDownloadMarkdown}
              title="Download plan as Markdown file"
            >
              <Download className="h-3.5 w-3.5 text-muted" />
              <span className="hidden sm:inline">Export .md</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">{issue.title}</h1>
          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {issue.labels.map((label) => (
                <Badge key={label} variant="neutral">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 border-t border-border p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm text-muted">
          <span className="font-medium text-fg">Suspected subsystem</span>
          <span className="font-mono text-[13px] text-accent-strong">{plan.suspectedArea}</span>
        </div>
        <p className="text-sm leading-6 text-fg">{plan.issueSummary}</p>
      </div>
    </div>
  );
}
