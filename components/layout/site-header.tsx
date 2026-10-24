import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { GithubIcon } from './github-icon';
import { REPO_URL } from '@/lib/site';

interface SiteHeaderProps {
  /** `marketing` shows section links and the Get started CTA; `app` is the slimmer engine header. */
  variant?: 'marketing' | 'app';
}

export function SiteHeader({ variant = 'marketing' }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          {variant === 'marketing' && (
            <nav aria-label="Main" className="hidden items-center gap-6 text-sm text-muted md:flex">
              <a href="#features" className="transition-colors hover:text-fg">
                Features
              </a>
              <a href="#how-it-works" className="transition-colors hover:text-fg">
                How it works
              </a>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {variant === 'app' && (
            <Link href="/#how-it-works" className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'hidden sm:inline-flex' })}>
              How it works
            </Link>
          )}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="PatchIt on GitHub"
            title="PatchIt on GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-fg"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
          <ThemeToggle />
          {variant === 'marketing' && (
            <Link href="/analyze" className={buttonClasses({ variant: 'primary', size: 'sm', className: 'ml-2' })}>
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
