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
    <div className="bg-[#111A27] border border-[#F08080]/30 rounded-xl p-6 text-center space-y-4">
      <div className="w-10 h-10 rounded-full bg-[#F08080]/10 border border-[#F08080]/30 text-[#F08080] flex items-center justify-center mx-auto">
        <AlertCircle className="w-5 h-5" />
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-sm font-semibold text-[#E6EDF5]">
          Analysis Could Not Complete
        </h3>
        {code && (
          <p className="text-[11px] font-mono text-[#F08080]">
            [{code}]
          </p>
        )}
        <p className="text-xs text-[#9BAABD] leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
