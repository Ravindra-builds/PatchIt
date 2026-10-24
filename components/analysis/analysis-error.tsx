import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface AnalysisErrorProps {
  message: string;
  code?: string;
  onRetry?: () => void;
}

export function AnalysisError({ message, code, onRetry }: AnalysisErrorProps) {
  return (
    <div className="rounded-xl border border-danger-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-soft text-danger">
          <AlertCircle className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="text-[15px] font-semibold tracking-tight text-fg">
            Analysis couldn&apos;t complete
          </h3>
          <p className="text-sm leading-6 text-muted">{message}</p>
          {code && <p className="font-mono text-xs text-faint">Error code: {code}</p>}

          {onRetry && (
            <div className="pt-3">
              <Button variant="secondary" size="sm" onClick={onRetry}>
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
