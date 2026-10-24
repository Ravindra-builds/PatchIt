import Link from 'next/link';
import { Logo } from './logo';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs space-y-3">
            <Logo />
            <p className="text-sm leading-6 text-muted">
              Turn any open GitHub issue into a source-linked plan for your first contribution.
            </p>
          </div>

          <nav aria-label="Footer" className="flex gap-12 text-sm">
            <div className="space-y-3">
              <p className="font-medium text-fg">Product</p>
              <ul className="space-y-2 text-muted">
                <li>
                  <Link href="/analyze" className="transition-colors hover:text-fg">
                    Open the app
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="transition-colors hover:text-fg">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="transition-colors hover:text-fg">
                    How it works
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>Built with Gemma 4 for the Gemma 4 hackathon.</p>
          <p>Reads public GitHub repositories only. Never executes repository code.</p>
        </div>
      </div>
    </footer>
  );
}
