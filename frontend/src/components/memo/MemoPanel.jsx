import React, { useState } from 'react';

/**
 * MemoPanel component — Typed Official IC Investment Memo Report Page.
 * Aesthetic: Typewriter monospace font, faint paper ruling background, manila paper, kraft border.
 *
 * @param {{ memo?: import('../../types/research.js').MemoData, companyName: string }} props
 */
export function MemoPanel({ memo, companyName }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!memo) return null;

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-[#D9CBA8] border-2 border-[#22201B] shadow-[6px_6px_0px_#22201B] mb-8 staple-clip overflow-hidden">
      {/* Header Toggle Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 bg-[#D9CBA8] hover:bg-[#EDE4D3] transition-colors text-left cursor-pointer min-h-[44px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#EDE4D3] border border-[#22201B] flex items-center justify-center font-mono font-bold text-xs shadow-[2px_2px_0px_#22201B]">
            MEMO
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6353] block font-bold">
              OFFICIAL IC DOSSIER DOCUMENT
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#22201B]">
              FULL INVESTMENT COMMITTEE MEMO — {companyName?.toUpperCase()}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {memo.dataConflict && (
            <span className="hidden sm:inline-flex px-2.5 py-1 bg-[#EDE4D3] border border-[#A9772E] text-[#A9772E] text-xs font-mono font-bold shadow-[2px_2px_0px_#A9772E]">
              ⚠️ DATA CONFLICT NOTED
            </span>
          )}
          <span className="px-3.5 py-2 bg-[#22201B] text-[#EDE4D3] font-mono text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#6B6353] flex items-center gap-1 min-h-[44px]">
            {isOpen ? 'COLLAPSE MEMO ▲' : 'READ FULL MEMO ▾'}
          </span>
        </div>
      </button>

      {/* Expanded Typed Report Page Content - Manila Ruled Paper */}
      {isOpen && (
        <div className="p-5 sm:p-10 paper-ruled border-t-2 border-[#22201B] space-y-6 sm:space-y-8 font-mono text-[#22201B]">
          
          {/* Official Document Control Stamp Header */}
          <div className="border-b-2 border-[#22201B] pb-4 sm:pb-6">
            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#6B6353] uppercase tracking-widest mb-2 font-bold">
              <span>CONFIDENTIAL — FOR IC REVIEW ONLY</span>
              <span>DATE: {new Date().toLocaleDateString()}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22201B]">
              INVESTMENT RECOMMENDATION BRIEF: {companyName?.toUpperCase()}
            </h2>
          </div>

          {/* Section 1: Executive Thesis */}
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#22201B] mb-2 bg-[#D9CBA8] px-2 py-1 border border-[#22201B] inline-block">
              SECTION 1 — EXECUTIVE THESIS STATEMENT
            </h4>
            <div className="p-4 sm:p-5 bg-[#EDE4D3] border-2 border-[#22201B] shadow-[4px_4px_0px_#22201B] text-xs sm:text-sm text-[#22201B] leading-relaxed font-sans font-medium">
              "{memo.thesis}"
            </div>
          </div>

          {/* Section 2: Key Metrics Grid */}
          {memo.keyMetrics && Object.keys(memo.keyMetrics).length > 0 && (
            <div>
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#22201B] mb-3 bg-[#D9CBA8] px-2 py-1 border border-[#22201B] inline-block">
                SECTION 2 — FINANCIAL & OPERATIONAL METRICS
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(memo.keyMetrics).map(([key, val]) => (
                  <div key={key} className="bg-[#EDE4D3] border-2 border-[#22201B] p-3 text-center shadow-[2px_2px_0px_#22201B]">
                    <span className="text-[10px] font-mono uppercase text-[#6B6353] font-bold block truncate mb-1">
                      {key}
                    </span>
                    <span className="text-sm sm:text-base font-bold font-mono text-[#3E6B4F] truncate block">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Core Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Core Strengths */}
            <div className="bg-[#EDE4D3] border-2 border-[#3E6B4F] p-4 sm:p-5 shadow-[4px_4px_0px_#3E6B4F]">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#3E6B4F] mb-3 flex items-center gap-1.5">
                <span>[ CORE STRENGTHS & MOAT ]</span> ({memo.strengths?.length || 0})
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#22201B]">
                {memo.strengths?.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#3E6B4F] shrink-0 font-bold font-mono">[{i + 1}]</span>
                    <span className="leading-relaxed font-sans">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Weaknesses */}
            <div className="bg-[#EDE4D3] border-2 border-[#8B2E2E] p-4 sm:p-5 shadow-[4px_4px_0px_#8B2E2E]">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#8B2E2E] mb-3 flex items-center gap-1.5">
                <span>[ RISKS & VULNERABILITIES ]</span> ({memo.weaknesses?.length || 0})
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#22201B]">
                {memo.weaknesses?.map((wk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#8B2E2E] shrink-0 font-bold font-mono">[{i + 1}]</span>
                    <span className="leading-relaxed font-sans">{wk}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
