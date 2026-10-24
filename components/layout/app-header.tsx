'use client';
import React, { useEffect, useRef, useState } from 'react';
import { GitPullRequest, HelpCircle, X, ShieldAlert, Sparkles } from 'lucide-react';

export function AppHeader() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showHowItWorks) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowHowItWorks(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showHowItWorks]);

  return (
    <>
      <header className="border-b border-[#273548] bg-[#0B111B]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#172233] border border-[#273548] text-[#48C9A4]">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold tracking-tight text-[#E6EDF5] text-lg">
                PatchPath
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#172233] text-[#48C9A4] border border-[#273548]">
                Gemma 4
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <button
              type="button"
              onClick={() => setShowHowItWorks(true)}
              className="flex items-center space-x-1.5 text-[#9BAABD] hover:text-[#E6EDF5] transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">How it works</span>
            </button>
            {/* TODO: point to the project repository */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-[#9BAABD] hover:text-[#E6EDF5] transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span className="hidden sm:inline">Open source</span>
            </a>
          </div>
        </div>
      </header>

      {/* How it works modal */}
      {showHowItWorks && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHowItWorks(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-it-works-title"
            className="bg-[#111A27] border border-[#273548] rounded-xl max-w-lg w-full p-6 relative shadow-2xl"
          >
            <button
              type="button"
              ref={closeButtonRef}
              onClick={() => setShowHowItWorks(false)}
              className="absolute top-4 right-4 text-[#9BAABD] hover:text-[#E6EDF5] p-1 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 id="how-it-works-title" className="text-lg font-semibold text-[#E6EDF5] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#48C9A4]" />
              How PatchPath Works
            </h3>
            <p className="text-sm text-[#9BAABD] mb-4">
              PatchPath narrows the gap between finding an open issue and knowing how to begin investigating it safely.
            </p>

            <div className="space-y-3 text-xs text-[#E6EDF5]">
              <div className="p-3 bg-[#172233] rounded-lg border border-[#273548] flex items-start gap-2.5">
                <span className="font-mono text-[#48C9A4] font-bold">1.</span>
                <div>
                  <strong className="block text-[#E6EDF5]">Collects real repository evidence</strong>
                  <span className="text-[#9BAABD]">
                    Reads issue details, README, default branch tree, and samples candidate source files directly from GitHub.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#172233] rounded-lg border border-[#273548] flex items-start gap-2.5">
                <span className="font-mono text-[#48C9A4] font-bold">2.</span>
                <div>
                  <strong className="block text-[#E6EDF5]">Gemma 4 reasoning with ground truth</strong>
                  <span className="text-[#9BAABD]">
                    Gemma 4 evaluates the real code samples and produces up to 3 prioritized starting steps grounded in repository facts.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#172233] rounded-lg border border-[#273548] flex items-start gap-2.5">
                <span className="font-mono text-[#48C9A4] font-bold">3.</span>
                <div>
                  <strong className="block text-[#E6EDF5]">Inspectable source links & verification</strong>
                  <span className="text-[#9BAABD]">
                    Every file recommendation points to real GitHub source URLs. Documented commands are strictly separated from suggestions.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#172233]/50 rounded-lg border border-[#273548] flex items-start gap-2 text-xs text-[#9BAABD]">
              <ShieldAlert className="w-4 h-4 text-[#E8B66A] shrink-0 mt-0.5" />
              <span>
                PatchPath is a guide, not an autonomous agent. It never runs arbitrary repository code or opens unverified pull requests.
              </span>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHowItWorks(false)}
                className="px-4 py-1.5 rounded-lg bg-[#48C9A4] hover:bg-[#35B58D] text-[#0B111B] font-semibold text-xs transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
