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

        <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-8">
          <aside aria-label="Analysis input" className="lg:sticky lg:top-24">
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

const PLAN_PARTS = [
  { icon: ListChecks, title: 'Prioritized first steps', description: 'Up to three ordered actions to get started.' },
  { icon: FileCode2, title: 'Files to read first', description: 'Source-linked, with why each one matters.' },
  { icon: Terminal, title: 'Commands to run', description: 'Reproduce and test, documented or suggested.' },
];

function EmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface/50 px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-accent shadow-card">
        <Sparkles className="h-5 w-5" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight text-fg">Your contribution plan will appear here</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        Paste a repository and issue URL, or load one of the examples to see what a plan looks like.
      </p>

      <ul className="mt-8 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-3">
        {PLAN_PARTS.map(({ icon: Icon, title, description }) => (
          <li key={title} className="rounded-lg border border-border bg-surface p-4">
            <Icon className="h-4 w-4 text-muted" />
            <p className="mt-3 text-sm font-medium text-fg">{title}</p>
            <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
