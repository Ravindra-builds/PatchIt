import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button';
import { ProductPreview } from './product-preview';

const TRUST_POINTS = ['Free and open source', 'No sign-up', 'Public repositories only'];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-card">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Powered by Gemma 4
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tighter text-fg text-balance sm:text-6xl">
            Start with an issue.
            <br />
            <span className="text-muted">Leave with a plan.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted text-pretty sm:text-lg sm:leading-8">
            Paste a GitHub issue and PatchIt reads the real repository — README, file tree and source — to give you
            prioritized first steps, the files that matter, and how to verify your fix.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/analyze" className={buttonClasses({ variant: 'accent', size: 'lg', className: 'w-full sm:w-auto' })}>
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className={buttonClasses({ variant: 'secondary', size: 'lg', className: 'w-full sm:w-auto' })}>
              See how it works
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-accent" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
