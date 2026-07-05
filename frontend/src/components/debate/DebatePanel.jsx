import React from 'react';

/**
 * DebatePanel component — Styled as two clipped analyst memo pages pinned side by side.
 * Aesthetic:
 * - Manila/Paper background (#EDE4D3) with dark borders (#22201B).
 * - Staple / paperclip graphic accents at top corners.
 * - Bull column (Stamp Green accent #3E6B4F), Bear column (Stamp Red accent #8B2E2E).
 * - Subtitles in muted ink text (#6B6353).
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
    <div className="w-full max-w-[1200px] mx-auto bg-[#D9CBA8] border-2 border-[#22201B] p-4 sm:p-6 shadow-[6px_6px_0px_#22201B] mb-8 staple-clip">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-[#22201B]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6353] block font-bold">
            EXHIBIT B — PARALLEL ADVOCATE TRANSCRIPT
          </span>
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#22201B] flex items-center gap-2 mt-0.5">
            INVESTMENT COMMITTEE DEBATE
          </h3>
          <p className="text-xs text-[#6B6353] mt-0.5 font-sans">
            Parallel AI advocates arguing strictly from the memo evidence base
          </p>
        </div>
        {rebuttalOccurred && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EDE4D3] border-2 border-[#A9772E] text-[#A9772E] text-xs font-mono font-bold shadow-[2px_2px_0px_#A9772E] self-start sm:self-auto">
            <span className="w-2 h-2 bg-[#A9772E] animate-pulse"></span>
            REBUTTAL TRIGGERED (GAP ≤ 15)
          </span>
        )}
      </div>

      {/* Two Columns: Bull vs Bear Pinned Analyst Memo Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bull Column - Pinned Analyst Note (Green Stamp Accent #3E6B4F) */}
        <div className="bg-[#EDE4D3] border-2 border-[#22201B] p-4 sm:p-5 flex flex-col justify-between shadow-[4px_4px_0px_#3E6B4F] relative staple-clip">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#3E6B4F]">
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 bg-[#3E6B4F] mt-1 shrink-0"></span>
                <div>
                  <h4 className="text-sm sm:text-base font-serif font-bold text-[#3E6B4F] uppercase tracking-wide leading-snug">
                    Bull Case
                  </h4>
                  <p className="text-[11px] text-[#6B6353] font-sans font-normal normal-case tracking-normal mt-0.5">
                    The case FOR investing
                  </p>
                </div>
              </div>
              <div className="px-2.5 py-1 bg-[#3E6B4F]/10 border border-[#3E6B4F] text-xs font-mono text-[#3E6B4F] font-bold">
                SCORE: {bullCase?.strength ?? 0}/100
              </div>
            </div>

            <div className="space-y-4">
              {bullCase?.arguments?.map((arg, i) => (
                <div key={i} className="bg-[#D9CBA8]/50 border border-[#22201B] p-3 shadow-[2px_2px_0px_#22201B]">
                  <div className="text-xs font-semibold text-[#22201B] mb-1.5 flex items-start gap-2">
                    <span className="text-[#3E6B4F] font-mono font-bold">[{i + 1}]</span>
                    <span className="leading-snug">{arg.point}</span>
                  </div>
                  <div className="bg-[#EDE4D3] border-l-2 border-[#3E6B4F] pl-3 py-1.5 pr-2 text-xs text-[#22201B]/90 italic font-sans">
                    <span className="text-[10px] font-mono uppercase text-[#3E6B4F] not-italic block mb-0.5 font-bold">
                      MEMO EVIDENCE:
                    </span>
                    "{arg.evidence}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bear Column - Pinned Analyst Note (Red Stamp Accent #8B2E2E) */}
        <div className="bg-[#EDE4D3] border-2 border-[#22201B] p-4 sm:p-5 flex flex-col justify-between shadow-[4px_4px_0px_#8B2E2E] relative staple-clip">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#8B2E2E]">
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 bg-[#8B2E2E] mt-1 shrink-0"></span>
                <div>
                  <h4 className="text-sm sm:text-base font-serif font-bold text-[#8B2E2E] uppercase tracking-wide leading-snug">
                    Bear Case
                  </h4>
                  <p className="text-[11px] text-[#6B6353] font-sans font-normal normal-case tracking-normal mt-0.5">
                    The case AGAINST investing
                  </p>
                </div>
              </div>
              <div className="px-2.5 py-1 bg-[#8B2E2E]/10 border border-[#8B2E2E] text-xs font-mono text-[#8B2E2E] font-bold">
                SCORE: {bearCase?.strength ?? 0}/100
              </div>
            </div>

            <div className="space-y-4">
              {bearCase?.arguments?.map((arg, i) => (
                <div key={i} className="bg-[#D9CBA8]/50 border border-[#22201B] p-3 shadow-[2px_2px_0px_#22201B]">
                  <div className="text-xs font-semibold text-[#22201B] mb-1.5 flex items-start gap-2">
                    <span className="text-[#8B2E2E] font-mono font-bold">[{i + 1}]</span>
                    <span className="leading-snug">{arg.point}</span>
                  </div>
                  <div className="bg-[#EDE4D3] border-l-2 border-[#8B2E2E] pl-3 py-1.5 pr-2 text-xs text-[#22201B]/90 italic font-sans">
                    <span className="text-[10px] font-mono uppercase text-[#8B2E2E] not-italic block mb-0.5 font-bold">
                      MEMO EVIDENCE:
                    </span>
                    "{arg.evidence}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Rebuttal Round Section */}
      {rebuttalOccurred && rebuttal && (
        <div className="mt-6 pt-6 border-t-2 border-[#22201B]">
          <div className="bg-[#EDE4D3] border-2 border-[#22201B] p-4 sm:p-5 shadow-[4px_4px_0px_#A9772E]">
            <div className="mb-4">
              <div className="flex items-start gap-2">
                <span className="text-xs sm:text-sm shrink-0 mt-0.5">🔄</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-serif font-bold text-[#A9772E] uppercase tracking-wider leading-snug">
                    Rebuttal Round: Counter-Arguments
                  </h4>
                  <p className="text-[11px] text-[#6B6353] font-sans font-normal normal-case tracking-normal mt-0.5">
                    Each side responds to the other's strongest point
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bull Rebuttal */}
              <div className="bg-[#D9CBA8] border border-[#22201B] p-3.5">
                <span className="text-[11px] font-mono font-bold text-[#3E6B4F] uppercase tracking-wider block mb-1">
                  BULL COUNTER TO BEAR'S STRONGEST POINT:
                </span>
                <p className="text-xs text-[#22201B] leading-relaxed font-sans font-medium">
                  "{rebuttal.bullRebuttal}"
                </p>
              </div>

              {/* Bear Rebuttal */}
              <div className="bg-[#D9CBA8] border border-[#22201B] p-3.5">
                <span className="text-[11px] font-mono font-bold text-[#8B2E2E] uppercase tracking-wider block mb-1">
                  BEAR COUNTER TO BULL'S STRONGEST POINT:
                </span>
                <p className="text-xs text-[#22201B] leading-relaxed font-sans font-medium">
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
