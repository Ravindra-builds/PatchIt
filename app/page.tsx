'use client';
import React, { useState } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { AnalysisForm } from '@/components/analysis/analysis-form';
import { AnalysisProgress, AnalysisStage } from '@/components/analysis/analysis-progress';
import { AnalysisError } from '@/components/analysis/analysis-error';
import { IssueHeader } from '@/components/analysis/issue-header';
import { FirstStepsList } from '@/components/analysis/first-steps-list';
import { RelevantFilesList } from '@/components/analysis/relevant-files-list';
import { CommandBlock } from '@/components/analysis/command-block';
import { OpenQuestionsSection } from '@/components/analysis/open-questions-section';
import { executeAnalysis } from '@/features/analysis/analyze-client';
import { AnalysisResponse, AnalyzeRequest } from '@/features/analysis/types';
import { Sparkles, Terminal, FileCheck, Layers } from 'lucide-react';

export default function PatchPathPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<AnalysisStage>('validating');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ message: string; code?: string } | null>(null);
  const [lastRequest, setLastRequest] = useState<AnalyzeRequest | null>(null);

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
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorInfo({
        message: err?.message || 'An unexpected error occurred while analyzing the issue.',
        code: err?.code,
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
    <div className="min-h-screen flex flex-col bg-[#0B111B] text-[#E6EDF5]">
      <AppHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Intro Block */}
        <div className="space-y-3 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#172233] border border-[#273548] text-xs font-mono text-[#48C9A4]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Source Contributor Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#E6EDF5]">
            Start with an issue. Leave with a plan.
          </h1>
          <p className="text-sm sm:text-base text-[#9BAABD] max-w-2xl leading-relaxed">
            Get oriented in an unfamiliar GitHub repository with a source-linked first-contribution plan powered by Gemma 4.
          </p>
        </div>

        {/* Input Form */}
        <section aria-label="Target selection form">
          <AnalysisForm onSubmit={handleStartAnalysis} isLoading={isLoading} />
        </section>

        {/* Loading Progress State */}
        {isLoading && (
          <section aria-label="Analysis in progress">
            <AnalysisProgress stage={currentStage} />
          </section>
        )}

        {/* Error State */}
        {errorInfo && !isLoading && (
          <section aria-label="Analysis error">
            <AnalysisError
              message={errorInfo.message}
              code={errorInfo.code}
              onRetry={lastRequest ? handleRetry : undefined}
            />
          </section>
        )}

        {/* Results Workspace */}
        {analysisResult && !isLoading && (
          <section aria-label="Contribution plan results" className="space-y-6 animate-in fade-in duration-300">
            {/* 1. Header with Metadata */}
            <IssueHeader
              issue={analysisResult.issue}
              plan={analysisResult.plan}
              modelUsed={analysisResult.modelUsed}
            />

            {/* Evidence summary banner */}
            <div className="p-3 bg-[#111A27] rounded-lg border border-[#273548] flex flex-wrap items-center justify-between gap-3 text-xs text-[#9BAABD]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-[#48C9A4]" />
                  <span>
                    Indexed <strong className="text-[#E6EDF5]">{analysisResult.evidenceSummary.fileCount}</strong> candidate files
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#8AB8F9]" />
                  <span>
                    Tree size: <strong className="text-[#E6EDF5]">{analysisResult.evidenceSummary.treeTotalFiles}</strong> blobs
                  </span>
                </span>
              </div>
              <span className="text-[11px] text-[#9BAABD]/80">
                Ground truth verified via GitHub API
              </span>
            </div>

            {/* 2. Prioritized First Steps (The Hero section) */}
            <FirstStepsList steps={analysisResult.plan.firstSteps} />

            {/* 3. Relevant Files with real links */}
            <RelevantFilesList files={analysisResult.plan.relevantFiles} />

            {/* 4. Reproduction & Testing Commands */}
            <CommandBlock reproduction={analysisResult.plan.reproduction} />

            {/* 5. Questions and Limitations */}
            <OpenQuestionsSection
              questions={analysisResult.plan.openQuestions}
              limitations={analysisResult.plan.limitations}
            />
          </section>
        )}
      </main>

      <footer className="border-t border-[#273548] bg-[#0B111B] py-6 mt-12 text-center text-xs text-[#9BAABD]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            PatchPath — Open-source developer orientation assistant. Built for the Gemma 4 hackathon.
          </p>
          <p className="text-[11px]">
            Reads public GitHub repositories only. Never executes repository code.
          </p>
        </div>
      </footer>
    </div>
  );
}
