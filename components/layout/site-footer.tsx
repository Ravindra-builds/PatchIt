import Link from 'next/link';
import { Logo } from './logo';
import { GithubIcon } from './github-icon';
import { REPO_URL } from '@/lib/site';

const LINKS = [
  { href: '/analyze', label: 'Open the app' },
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Logo />
            <p className="text-sm text-muted">Turn any GitHub issue into a first-contribution plan.</p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-fg">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-fg"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-1 border-t border-border pt-5 text-xs text-faint sm:flex-row sm:justify-between">
          <p>Built with Gemma 4 for the Gemma 4 hackathon.</p>
          <p>Reads public GitHub repositories only. Never executes repository code.</p>
        </div>
      </div>
    </footer>
  );
}
