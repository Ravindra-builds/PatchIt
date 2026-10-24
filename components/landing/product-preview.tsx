import { CheckCircle2, FileCode2, ListChecks } from 'lucide-react';
import { MOCK_ANALYSIS_RESPONSE } from '@/features/analysis/mock-data';

const { issue, plan } = MOCK_ANALYSIS_RESPONSE;

/** Static, non-interactive rendering of the bundled demo result, framed like an app window. */
export function ProductPreview() {
  return (
    <div className="rounded-2xl border border-border bg-subtle/60 p-2 shadow-2xl shadow-black/5 dark:shadow-black/40">
      <div className="overflow-hidden rounded-xl border border-border bg-surface" aria-hidden="true">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="ml-3 truncate font-mono text-xs text-faint">
            {issue.repository.fullName} · issue #{issue.number}
          </span>
        </div>

        {/* minmax(0, …) tracks so long file paths truncate instead of widening the grid. */}
        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* First steps */}
          <div className="bg-surface p-5 text-left sm:p-6">
            <p className="flex items-center gap-2 text-xs font-medium text-muted">
              <ListChecks className="h-3.5 w-3.5 text-accent" />
              Your first steps
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-fg">{issue.title}</h3>

            <ol className="mt-5 space-y-4">
              {plan.firstSteps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-strong">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg">{step.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{step.explanation}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Relevant files */}
          <div className="bg-surface p-5 text-left sm:p-6">
            <p className="flex items-center gap-2 text-xs font-medium text-muted">
              <FileCode2 className="h-3.5 w-3.5 text-accent" />
              Files to read first
            </p>
            <ul className="mt-4 space-y-3">
              {plan.relevantFiles.slice(0, 4).map((file) => (
                <li key={file.path} className="rounded-lg border border-border bg-subtle/60 px-3 py-2.5">
                  <p className="truncate font-mono text-xs text-fg">{file.path}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <CheckCircle2 className="h-3 w-3 text-accent" />
                    {file.confidence === 'high' ? 'High' : file.confidence === 'medium' ? 'Medium' : 'Low'} relevance
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
