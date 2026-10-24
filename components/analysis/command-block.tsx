'use client';
import React, { useState } from 'react';
import { Reproduction } from '@/features/analysis/types';
import { Badge } from '../ui/badge';
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
    <div className="bg-[#111A27] border border-[#273548] rounded-xl p-5 sm:p-6 space-y-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#E6EDF5] flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#48C9A4]" />
          Reproduction & Testing Commands
        </h2>
        <span className="text-xs text-[#9BAABD]">
          Documented vs Inferred
        </span>
      </div>

      <div className="space-y-3">
        {reproduction.map((item, index) => {
          const isDoc = item.verification === 'documented';

          return (
            <div
              key={index}
              className="bg-[#172233] border border-[#273548] rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant={isDoc ? 'teal' : 'amber'}>
                    {isDoc ? (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Documented
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Suggested
                      </span>
                    )}
                  </Badge>
                  {item.source && (
                    <span className="text-[11px] text-[#9BAABD] font-mono">
                      source: {item.source}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(item.instruction, index)}
                  className="flex items-center gap-1 text-[11px] text-[#9BAABD] hover:text-[#E6EDF5] px-2 py-0.5 rounded bg-[#0B111B] border border-[#273548] transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3 text-[#48C9A4]" />
                      <span className="text-[#48C9A4]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-2.5 bg-[#0B111B] rounded border border-[#273548] overflow-x-auto">
                <code className="text-xs font-mono text-[#48C9A4] select-all whitespace-pre-wrap">
                  {item.instruction}
                </code>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
