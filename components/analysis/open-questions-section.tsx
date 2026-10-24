import React from 'react';
import { HelpCircle, AlertTriangle } from 'lucide-react';

interface OpenQuestionsSectionProps {
  questions: string[];
  limitations: string[];
}

export function OpenQuestionsSection({ questions, limitations }: OpenQuestionsSectionProps) {
  if ((!questions || questions.length === 0) && (!limitations || limitations.length === 0)) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Open Questions */}
      {questions && questions.length > 0 && (
        <div className="bg-[#111A27] border border-[#273548] rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#E6EDF5] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#8AB8F9]" />
            What Still Needs Verification
          </h3>
          <ul className="space-y-2 text-xs text-[#9BAABD]">
            {questions.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#8AB8F9] shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Limitations */}
      {limitations && limitations.length > 0 && (
        <div className="bg-[#111A27] border border-[#273548] rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#E6EDF5] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E8B66A]" />
            Analysis Boundaries & Limitations
          </h3>
          <ul className="space-y-2 text-xs text-[#9BAABD]">
            {limitations.map((l, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#E8B66A] shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{l}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
