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
    <div className="divide-y divide-border rounded-xl border border-border bg-surface shadow-card">
      {/* Open Questions */}
      {questions && questions.length > 0 && (
        <section className="p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-fg">
            <HelpCircle className="h-4 w-4 text-info" />
            What still needs verification
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            {questions.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-info" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Limitations */}
      {limitations && limitations.length > 0 && (
        <section className="p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-fg">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Analysis boundaries &amp; limitations
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            {limitations.map((l, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-warning" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
