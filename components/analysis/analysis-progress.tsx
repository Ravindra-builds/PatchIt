import React from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export type AnalysisStage = 'validating' | 'fetching_issue' | 'reading_repo' | 'synthesizing' | 'completed';

interface AnalysisProgressProps {
  stage: AnalysisStage;
}

const STAGES: { id: AnalysisStage; label: string }[] = [
  { id: 'validating', label: 'Checking GitHub target URLs' },
  { id: 'fetching_issue', label: 'Fetching issue metadata & README' },
  { id: 'reading_repo', label: 'Sampling candidate source files' },
  { id: 'synthesizing', label: 'Gemma 4 drafting your plan' },
];

export function AnalysisProgress({ stage }: AnalysisProgressProps) {
  const getStageIndex = (s: AnalysisStage) => {
    switch (s) {
      case 'validating':
        return 0;
      case 'fetching_issue':
        return 1;
      case 'reading_repo':
        return 2;
      case 'synthesizing':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(stage);

  return (
    <div className="rounded-xl border border-border bg-surface shadow-card">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h3 className="text-[15px] font-semibold tracking-tight text-fg">Analyzing issue</h3>
        <p className="text-sm text-muted">
          Reading real code and docs to ground the plan. This usually takes 20–40 seconds.
        </p>
      </div>

      <div className="space-y-1 p-3 sm:p-4">
        {STAGES.map((s, index) => {
          const isDone = currentIndex > index;
          const isCurrent = currentIndex === index;

          return (
            <div
              key={s.id}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isCurrent ? 'bg-subtle font-medium text-fg' : isDone ? 'text-muted' : 'text-faint'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
              ) : isCurrent ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-faint" />
              )}
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
