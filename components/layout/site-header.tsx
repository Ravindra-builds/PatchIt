'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { GithubIcon } from './github-icon';
import { REPO_URL } from '@/lib/site';

interface SiteHeaderProps {
  /** `marketing` shows section links and the Get started CTA; `app` is the slimmer engine header. */
  variant?: 'marketing' | 'app';
}

export function SiteHeader({ variant = 'marketing' }: SiteHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);

  const links =
    variant === 'marketing'
      ? [
          { label: 'Features', href: '#features' },
          { label: 'How it works', href: '#how-it-works' },
        ]
      : [{ label: 'How it works', href: '/#how-it-works' }];

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out',
        {
          'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg md:top-4 md:max-w-4xl md:shadow':
            scrolled && !open,
          'bg-background/90': open,
        },
      )}
    >
      <nav
        className={cn(
          'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out',
          {
            'md:px-3': scrolled,
          },
        )}
      >
        <div className="flex items-center gap-2">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              href={link.href}
            >
              {link.label}
            </a>
          ))}

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

          {variant === 'marketing' ? (
            <Link href="/analyze">
              <Button size="sm">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <Link href="/">
              <Button variant="outline" size="sm">
                Home
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </Button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={cn(
          'bg-background/95 backdrop-blur-md fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
          open ? 'block' : 'hidden',
        )}
      >
        <div
          data-slot={open ? 'open' : 'closed'}
          className={cn(
            'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
            'flex h-full w-full flex-col justify-between gap-y-4 p-6',
          )}
        >
          <div className="grid gap-y-2">
            {links.map((link) => (
              <a
                key={link.label}
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'justify-start text-base',
                })}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                variant: 'ghost',
                className: 'justify-start gap-2 text-base',
              })}
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
          </div>

          <div className="flex flex-col gap-2">
            {variant === 'marketing' ? (
              <Link href="/analyze" onClick={() => setOpen(false)}>
                <Button className="w-full">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            ) : (
              <Link href="/" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  Home
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export { SiteHeader as Header };
