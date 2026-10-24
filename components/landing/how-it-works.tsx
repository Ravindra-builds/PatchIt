const STEPS = [
  {
    title: 'Paste two links',
    description: 'A public GitHub repository and one of its issues. Optionally attach a screenshot of the bug.',
    detail: 'github.com/owner/repo/issues/123',
  },
  {
    title: 'PatchIt reads the repository',
    description: 'It fetches the issue, README and file tree, then samples the source files most likely involved.',
    detail: 'README · tree · 5 source files',
  },
  {
    title: 'Get your contribution plan',
    description: 'Gemma 4 turns that evidence into first steps, files to read, and commands to reproduce and test.',
    detail: 'Steps · files · commands',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-accent-strong">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg text-balance sm:text-4xl">
            From issue link to plan in under a minute
          </h2>
        </div>

        <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative">
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-12 right-0 top-5 hidden h-px bg-border md:block"
                />
              )}
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg font-mono text-sm font-semibold text-fg">
                {i + 1}
              </span>
              <h3 className="mt-6 text-lg font-semibold text-fg">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
              <p className="mt-4 inline-block rounded-md border border-border bg-subtle px-2.5 py-1 font-mono text-xs text-muted">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
