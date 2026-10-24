import Link from 'next/link';
import { GitPullRequestArrow } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md" aria-label="PatchIt home">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white dark:text-zinc-950">
        <GitPullRequestArrow className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-fg">PatchIt</span>
    </Link>
  );
}
