'use client';
import React, { useState } from 'react';
import { Reproduction } from '@/features/analysis/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Terminal, Copy, Check, BookOpen, Lightbulb } from 'lucide-react';

interface CommandBlockProps {
  reproduction: Reproduction[];
}

export function CommandBlock({ reproduction }: CommandBlockProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!reproduction || reproduction.length === 0) return null;

  const handleCopy = async (instruction: string, idx: number) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(instruction);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-fg">
          <Terminal className="h-4 w-4 text-muted" />
          Reproduction &amp; testing commands
        </h2>
        <span className="text-xs text-faint">Documented vs inferred</span>
      </div>

      <div className="divide-y divide-border px-5 sm:px-6">
        {reproduction.map((item, index) => {
          const isDoc = item.verification === 'documented';

          return (
            <div key={index} className="space-y-3 py-4">
              <div className="flex items-center gap-2">
                <Badge variant={isDoc ? 'accent' : 'warning'}>
                  {isDoc ? (
                    <>
                      <BookOpen className="h-3 w-3" />
                      Documented
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-3 w-3" />
                      Suggested
                    </>
                  )}
                </Badge>
                {item.source && (
                  <span className="truncate font-mono text-xs text-faint">source: {item.source}</span>
                )}
              </div>

              <div className="relative rounded-lg border border-border bg-subtle">
                <div className="overflow-x-auto p-3 pr-24">
                  <code className="select-all whitespace-pre-wrap font-mono text-[13px] text-fg">
                    {item.instruction}
                  </code>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(item.instruction, index)}
                  className="absolute right-1.5 top-1.5"
                  title="Copy command"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-accent" />
                      <span className="text-accent">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
