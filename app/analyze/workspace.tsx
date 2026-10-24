'use client';
import React, { useEffect, useRef, useState } from 'react';
import { FileCheck, FolderTree, ListChecks, FileCode2, Terminal, Sparkles } from 'lucide-react';
import { AnalysisForm } from '@/components/analysis/analysis-form';
import { AnalysisProgress, AnalysisStage } from '@/components/analysis/analysis-progress';
import { AnalysisError } from '@/components/analysis/analysis-error';
import { IssueHeader } from '@/components/analysis/issue-header';
import { FirstStepsList } from '@/components/analysis/first-steps-list';
import { RelevantFilesList } from '@/components/analysis/relevant-files-list';
import { CommandBlock } from '@/components/analysis/command-block';
import { OpenQuestionsSection } from '@/components/analysis/open-questions-section';
import { executeAnalysis, AnalysisClientError } from '@/features/analysis/analyze-client';
import { AnalysisResponse, AnalyzeRequest } from '@/features/analysis/types';

export function AnalyzeWorkspace() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<AnalysisStage>('validating');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ message: string; code?: string } | null>(null);
  const [lastRequest, setLastRequest] = useState<AnalyzeRequest | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // On stacked (mobile) layouts the output panel sits below the form; bring it into view.
  useEffect(() => {
    if (!isLoading && !analysisResult && !errorInfo) return;
    if (!window.matchMedia('(max-width: 1023px)').matches) return;
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [isLoading, analysisResult, errorInfo]);

  const handleStartAnalysis = async (requestData: AnalyzeRequest) => {
    setIsLoading(true);
    setErrorInfo(null);
    setAnalysisResult(null);
    setLastRequest(requestData);

    try {
      const result = await executeAnalysis(requestData, (stage) => {
        setCurrentStage(stage);
      });
      setAnalysisResult(result);
    } catch (err: unknown) {
      console.error('Analysis failed:', err);
      setErrorInfo({
        message:
          (err instanceof Error && err.message) || 'An unexpected error occurred while analyzing the issue.',
        code: err instanceof AnalysisClientError ? err.code : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastRequest) {
      handleStartAnalysis(lastRequest);
    }
  };

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">New analysis</h1>
          <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
            Point PatchIt at an issue and get a contribution plan grounded in the repository&apos;s real code.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-8">
          <aside aria-label="Analysis input" className="self-start lg:sticky lg:top-24">
            <AnalysisForm onSubmit={handleStartAnalysis} isLoading={isLoading} />
          </aside>

          <div ref={panelRef} className="min-w-0 scroll-mt-24" aria-live="polite">
            {isLoading && (
              <section aria-label="Analysis in progress" className="animate-fade-in">
                <AnalysisProgress stage={currentStage} />
              </section>
            )}

            {errorInfo && !isLoading && (
              <section aria-label="Analysis error" className="animate-fade-in">
                <AnalysisError
                  message={errorInfo.message}
                  code={errorInfo.code}
                  onRetry={lastRequest ? handleRetry : undefined}
                />
              </section>
            )}

            {analysisResult && !isLoading && (
              <section aria-label="Contribution plan results" className="animate-fade-in space-y-6">
                <IssueHeader
                  issue={analysisResult.issue}
                  plan={analysisResult.plan}
                  modelUsed={analysisResult.modelUsed}
                />

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm text-muted shadow-card">
                  <span className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-accent" />
                    <span>
                      <strong className="font-semibold text-fg">{analysisResult.evidenceSummary.fileCount}</strong> files
                      analyzed
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-muted" />
                    <span>
                      <strong className="font-semibold text-fg">
                        {analysisResult.evidenceSummary.treeTotalFiles.toLocaleString()}
                      </strong>{' '}
                      files in repository
                    </span>
                  </span>
                  <span className="text-xs text-faint sm:ml-auto">Evidence fetched live from the GitHub API</span>
                </div>

                <FirstStepsList steps={analysisResult.plan.firstSteps} />
                <RelevantFilesList files={analysisResult.plan.relevantFiles} />
                <CommandBlock reproduction={analysisResult.plan.reproduction} />
                <OpenQuestionsSection
                  questions={analysisResult.plan.openQuestions}
                  limitations={analysisResult.plan.limitations}
                />
              </section>
            )}

            {!isLoading && !errorInfo && !analysisResult && <EmptyState />}
          </div>
        </div>
      </div>
    </main>
  );
}

function SkeletonBar({ className = '' }: { className?: string }) {
  return <span className={`block h-2 rounded-full bg-border ${className}`} />;
}

const PLAN_PARTS = [
  {
    icon: ListChecks,
    title: 'Prioritized first steps',
    description: 'Up to three ordered actions to get started.',
    preview: (
      <ol className="space-y-2.5">
        {['w-4/5', 'w-3/5', 'w-2/3'].map((width, i) => (
          <li key={width} className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[10px] font-semibold text-accent">
              {i + 1}
            </span>
            <SkeletonBar className={width} />
          </li>
        ))}
      </ol>
    ),
  },
  {
    icon: FileCode2,
    title: 'Files to read first',
    description: 'Source-linked, with why each one matters.',
    preview: (
      <ul className="space-y-2.5">
        {['w-3/4', 'w-1/2', 'w-2/3'].map((width) => (
          <li key={width} className="flex items-center gap-2.5">
            <FileCode2 className="h-3.5 w-3.5 shrink-0 text-faint" />
            <SkeletonBar className={width} />
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: Terminal,
    title: 'Commands to run',
    description: 'Reproduce and test, documented or suggested.',
    preview: (
      <div className="space-y-2.5 rounded-md border border-border bg-subtle px-2.5 py-2 font-mono text-[11px] text-faint">
        {['w-3/5', 'w-4/5'].map((width) => (
          <div key={width} className="flex items-center gap-2">
            <span>$</span>
            <SkeletonBar className={width} />
          </div>
        ))}
      </div>
    ),
  },
];

function EmptyState() {
  return (
    <div className="flex h-full min-h-[420px] flex-col justify-center rounded-xl border border-dashed border-border-strong bg-surface/50 px-6 py-10 sm:px-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-accent shadow-card">
          <Sparkles className="h-5 w-5" />
        </span>
        <h2 className="mt-5 text-lg font-semibold tracking-tight text-fg">Your contribution plan will appear here</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted">
          Paste an issue URL, or load an example to see a plan for a real open-source issue.
        </p>
      </div>

      {/* Skeleton of the result layout, so the empty panel previews what the plan contains. */}
      <div className="mx-auto mt-8 w-full max-w-2xl space-y-3">
        <div aria-hidden className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <span className="rounded-md bg-subtle px-1.5 py-0.5 font-mono text-[11px] text-faint">#123</span>
          <SkeletonBar className="w-2/5" />
          <span className="ml-auto flex gap-1.5">
            <span className="h-4 w-12 rounded-full bg-accent-soft" />
            <span className="h-4 w-10 rounded-full bg-subtle" />
          </span>
        </div>

        <ul className="grid gap-3 text-left sm:grid-cols-3">
          {PLAN_PARTS.map(({ icon: Icon, title, description, preview }) => (
            <li key={title} className="flex flex-col rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium text-fg">{title}</p>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
              <div aria-hidden className="mt-4 border-t border-border pt-4">
                {preview}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
