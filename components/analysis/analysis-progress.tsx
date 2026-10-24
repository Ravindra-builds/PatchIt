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
  { id: 'synthesizing', label: 'Gemma 4 reasoning & plan formulation' },
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
    <div className="bg-[#111A27] border border-[#273548] rounded-xl p-6 text-center space-y-5 animate-pulse-none">
      <div className="flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-8 h-8 text-[#48C9A4] animate-spin" />
        <h3 className="text-sm font-semibold text-[#E6EDF5]">
          Analyzing GitHub Issue & Repository
        </h3>
        <p className="text-xs text-[#9BAABD]">
          Grounding contribution plan with real code and documentation facts.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-2 text-left">
        {STAGES.map((s, index) => {
          const isDone = currentIndex > index;
          const isCurrent = currentIndex === index;

          return (
            <div
              key={s.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors border ${
                isCurrent
                  ? 'bg-[#172233] border-[#48C9A4]/40 text-[#E6EDF5]'
                  : isDone
                  ? 'bg-[#172233]/40 border-transparent text-[#48C9A4]'
                  : 'bg-transparent border-transparent text-[#9BAABD]/60'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-[#48C9A4] shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-[#48C9A4] animate-spin shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-[#273548] shrink-0" />
              )}
              <span className={isCurrent ? 'font-medium' : ''}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
