import { FileSearch, ListOrdered, Link2, Terminal, ImageIcon, ShieldCheck, type LucideIcon } from 'lucide-react';

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: FileSearch,
    title: 'Grounded in real code',
    description:
      'Reads the issue, README, file tree and the most relevant source files straight from GitHub before the model says a word.',
  },
  {
    icon: ListOrdered,
    title: 'Prioritized first steps',
    description: 'Up to three concrete, ordered steps — each marked as backed by evidence or still needing verification.',
  },
  {
    icon: Link2,
    title: 'Source-linked files',
    description: 'Every recommended file links to its real location on GitHub, with a confidence level and the reason it matters.',
  },
  {
    icon: Terminal,
    title: 'Documented vs. suggested commands',
    description: 'Reproduction and test commands found in the docs are kept clearly apart from ones the model inferred.',
  },
  {
    icon: ImageIcon,
    title: 'Screenshot-aware',
    description: 'Attach a screenshot of a UI bug and Gemma 4 factors what it sees into the plan.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe by design',
    description: 'Read-only access to public repositories. Repository code is never executed and screenshots are never stored.',
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-accent-strong">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg text-balance sm:text-4xl">
            Everything you need before your first commit
          </h2>
          <p className="mt-4 text-base leading-7 text-muted text-pretty">
            Skip the hours of wandering through an unfamiliar codebase. PatchIt hands you an orientation you can check
            line by line.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-surface p-6 sm:p-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-subtle text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-fg">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
