import React from 'react';
import { FirstStep } from '@/features/analysis/types';
import { Badge } from '../ui/badge';
import { Compass, CheckCircle2, AlertCircle } from 'lucide-react';

interface FirstStepsListProps {
  steps: FirstStep[];
}

export function FirstStepsList({ steps }: FirstStepsListProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-[#111A27] border border-[#273548] rounded-xl p-5 sm:p-6 space-y-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#E6EDF5] flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#48C9A4]" />
          Start Here: Prioritized Investigation Steps
        </h2>
        <span className="text-xs text-[#9BAABD]">Max 3 immediate actions</span>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isVerified = step.verification === 'verified';

          return (
            <div
              key={index}
              className="p-4 bg-[#172233] border border-[#273548] rounded-lg space-y-2 relative"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#48C9A4]/20 border border-[#48C9A4]/40 text-[#48C9A4] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-[#E6EDF5]">
                    {step.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={isVerified ? 'teal' : 'amber'}>
                    {isVerified ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified In Repo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Needs Verification
                      </span>
                    )}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-[#9BAABD] leading-relaxed pl-7">
                {step.explanation}
              </p>

              {step.evidenceIds && step.evidenceIds.length > 0 && (
                <div className="pl-7 pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#9BAABD]/60">Evidence:</span>
                  {step.evidenceIds.map((eid) => (
                    <span
                      key={eid}
                      className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0B111B] text-[#9BAABD] border border-[#273548]"
                    >
                      {eid}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
