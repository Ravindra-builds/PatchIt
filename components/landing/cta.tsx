import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button';

export function CallToAction() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-14 text-center shadow-card sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
          />
          <h2 className="relative text-3xl font-semibold tracking-tight text-fg text-balance sm:text-4xl">
            Ready to make your first patch?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-7 text-muted text-pretty">
            Pick an issue you care about and get a plan grounded in the actual code. No account needed.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link href="/analyze" className={buttonClasses({ variant: 'accent', size: 'lg' })}>
              Open PatchIt
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
