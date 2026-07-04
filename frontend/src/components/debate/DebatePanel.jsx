import React from 'react';

/**
 * DebatePanel component — displays Bull and Bear advocate cases side by side.
 * Responsive: Stacks to single column on mobile (< 640px), 2-column on tablet/desktop.
 * Palette:
 * - Bull: Ledger-Green (#2F6F4E)
 * - Bear: Claret (#7A2E2E)
 * - Rebuttal: Brass (#B8860B)
 *
 * @param {{
 *   bullCase?: import('../../types/research.js').DebateCase,
 *   bearCase?: import('../../types/research.js').DebateCase,
 *   rebuttalOccurred?: boolean,
 *   rebuttal?: import('../../types/research.js').RebuttalData
 * }} props
 */
export function DebatePanel({ bullCase, bearCase, rebuttalOccurred, rebuttal }) {
  if (!bullCase && !bearCase) return null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#12181B] border border-[#4A5A63]/60 rounded-2xl p-4 sm:p-6 shadow-2xl mb-8">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#4A5A63]/40">
        <div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#F6F1E7] flex items-center gap-2">
            ⚔️ Investment Committee Debate
          </h3>
          <p className="text-xs text-[#4A5A63] mt-0.5 font-sans">
            Parallel AI advocates arguing strictly from the memo evidence base
          </p>
        </div>
        {rebuttalOccurred && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8860B]/10 border border-[#B8860B]/30 text-[#B8860B] text-xs font-semibold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#B8860B] animate-pulse"></span>
            Rebuttal Round Triggered (Score Gap ≤ 15)
          </span>
        )}
      </div>

      {/* Two Columns: Bull vs Bear (Stacked on Mobile < 640px, 2-column on >= 640px) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bull Column - Ledger-Green (#2F6F4E) */}
        <div className="bg-[#2F6F4E]/10 border border-[#2F6F4E]/30 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2F6F4E]/30">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#2F6F4E]"></span>
                <h4 className="text-sm sm:text-base font-serif font-bold text-[#2F6F4E] uppercase tracking-wide">
                  Bull Case
                </h4>
              </div>
              <div className="flex items-center gap-1 bg-[#2F6F4E]/20 px-3 py-1 rounded-lg border border-[#2F6F4E]/40 text-xs font-mono text-[#F6F1E7] font-bold">
                Strength: {bullCase?.strength ?? 0}/100
              </div>
            </div>

            <div className="space-y-4">
              {bullCase?.arguments?.map((arg, i) => (
                <div key={i} className="bg-[#12181B] border border-[#2F6F4E]/30 rounded-lg p-3.5 shadow-md">
                  <div className="text-xs font-semibold text-[#F6F1E7] mb-1.5 flex items-start gap-2">
                    <span className="text-[#2F6F4E] font-bold">#{i + 1}</span>
                    <span className="leading-snug">{arg.point}</span>
                  </div>
                  <div className="bg-[#2F6F4E]/15 border-l-2 border-[#2F6F4E] pl-3 py-1.5 pr-2 rounded-r text-xs text-[#F6F1E7]/80 italic">
                    <span className="text-[10px] font-mono uppercase text-[#2F6F4E] not-italic block mb-0.5 font-bold">
                      Evidence from Memo:
                    </span>
                    "{arg.evidence}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bear Column - Claret (#7A2E2E) */}
        <div className="bg-[#7A2E2E]/10 border border-[#7A2E2E]/30 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#7A2E2E]/30">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#7A2E2E]"></span>
                <h4 className="text-sm sm:text-base font-serif font-bold text-[#7A2E2E] uppercase tracking-wide">
                  Bear Case
                </h4>
              </div>
              <div className="flex items-center gap-1 bg-[#7A2E2E]/20 px-3 py-1 rounded-lg border border-[#7A2E2E]/40 text-xs font-mono text-[#F6F1E7] font-bold">
                Strength: {bearCase?.strength ?? 0}/100
              </div>
            </div>

            <div className="space-y-4">
              {bearCase?.arguments?.map((arg, i) => (
                <div key={i} className="bg-[#12181B] border border-[#7A2E2E]/30 rounded-lg p-3.5 shadow-md">
                  <div className="text-xs font-semibold text-[#F6F1E7] mb-1.5 flex items-start gap-2">
                    <span className="text-[#7A2E2E] font-bold">#{i + 1}</span>
                    <span className="leading-snug">{arg.point}</span>
                  </div>
                  <div className="bg-[#7A2E2E]/15 border-l-2 border-[#7A2E2E] pl-3 py-1.5 pr-2 rounded-r text-xs text-[#F6F1E7]/80 italic">
                    <span className="text-[10px] font-mono uppercase text-[#7A2E2E] not-italic block mb-0.5 font-bold">
                      Evidence from Memo:
                    </span>
                    "{arg.evidence}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Rebuttal Round Section (Brass #B8860B Accent) */}
      {rebuttalOccurred && rebuttal && (
        <div className="mt-6 pt-6 border-t border-[#4A5A63]/40">
          <div className="bg-[#B8860B]/10 border border-[#B8860B]/30 rounded-xl p-4 sm:p-5">
            <h4 className="text-xs sm:text-sm font-serif font-bold text-[#B8860B] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🔄</span> Rebuttal Round: Counter-Arguments
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bull Rebuttal */}
              <div className="bg-[#12181B] border border-[#2F6F4E]/40 rounded-lg p-3.5">
                <span className="text-[11px] font-bold text-[#2F6F4E] uppercase tracking-wider block mb-1">
                  Bull Counter to Bear's Strongest Point:
                </span>
                <p className="text-xs text-[#F6F1E7] leading-relaxed">
                  "{rebuttal.bullRebuttal}"
                </p>
              </div>

              {/* Bear Rebuttal */}
              <div className="bg-[#12181B] border border-[#7A2E2E]/40 rounded-lg p-3.5">
                <span className="text-[11px] font-bold text-[#7A2E2E] uppercase tracking-wider block mb-1">
                  Bear Counter to Bull's Strongest Point:
                </span>
                <p className="text-xs text-[#F6F1E7] leading-relaxed">
                  "{rebuttal.bearRebuttal}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
