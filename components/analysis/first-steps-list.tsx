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
    <div className="rounded-xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-fg">
            <Compass className="h-4 w-4 text-accent" />
            Start here
          </h2>
          <p className="text-sm text-muted">Prioritized investigation steps</p>
        </div>
        <span className="text-xs text-faint">Max 3 immediate actions</span>
      </div>

      <div className="divide-y divide-border px-5 sm:px-6">
        {steps.map((step, index) => {
          const isVerified = step.verification === 'verified';

          return (
            <div key={index} className="flex gap-4 py-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-strong">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-[15px] font-semibold tracking-tight text-fg">{step.title}</h3>
                  <div className="shrink-0">
                    <Badge variant={isVerified ? 'accent' : 'warning'}>
                      {isVerified ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Verified in repo
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          Needs verification
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm leading-6 text-muted">{step.explanation}</p>

                {step.evidenceIds && step.evidenceIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                    <span className="text-xs text-faint">Evidence</span>
                    {step.evidenceIds.map((eid) => (
                      <span key={eid} className="font-mono text-[13px] text-info">
                        {eid}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
