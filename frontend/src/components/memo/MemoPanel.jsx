import React, { useState } from 'react';

/**
 * MemoPanel component — document-styled investment memo with warm parchment paper aesthetic (#F6F1E7).
 * Serif display typography (Lora) for headings & thesis text.
 * Collapsed by default behind a toggle.
 *
 * @param {{ memo?: import('../../types/research.js').MemoData, companyName: string }} props
 */
export function MemoPanel({ memo, companyName }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!memo) return null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#12181B] border border-[#4A5A63]/60 rounded-2xl shadow-2xl mb-8 overflow-hidden">
      {/* Header Toggle Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-6 bg-[#12181B] hover:bg-[#1f292d] active:bg-[#2a373d] transition-colors text-left cursor-pointer min-h-[44px]"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl">📄</span>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#F6F1E7]">
              Full Investment Committee Memo — {companyName}
            </h3>
            <p className="text-xs text-[#4A5A63] mt-0.5 font-sans">
              Structured brief covering thesis, moat, metrics, and data conflict checks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {memo.dataConflict && (
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded bg-[#B8860B]/10 border border-[#B8860B]/30 text-[#B8860B] text-xs font-semibold">
              ⚠️ Data Conflict Noted
            </span>
          )}
          <span className="px-3.5 py-2 rounded-xl bg-[#4A5A63]/20 border border-[#4A5A63]/60 text-xs font-semibold text-[#F6F1E7] flex items-center gap-1 min-h-[44px]">
            {isOpen ? 'Collapse Memo ▲' : 'Read Full Memo ▾'}
          </span>
        </div>
      </button>

      {/* Expanded Paper Document Content - Warm Parchment (#F6F1E7) */}
      {isOpen && (
        <div className="p-5 sm:p-10 memo-paper border-t border-[#4A5A63]/40 space-y-6 sm:space-y-8 font-sans">
          
          {/* Document Header */}
          <div className="border-b border-[#12181B]/20 pb-4 sm:pb-6">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#4A5A63] uppercase tracking-widest mb-2">
              <span>CONFIDENTIAL — FOR IC REVIEW ONLY</span>
              <span>DATE: {new Date().toLocaleDateString()}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#12181B]">
              Investment Recommendation Brief: {companyName}
            </h2>
          </div>

          {/* Section 1: Thesis - Serif */}
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#B8860B] mb-2">
              1. Executive Thesis Statement
            </h4>
            <div className="p-4 sm:p-5 bg-[#12181B]/5 border-l-4 border-[#B8860B] rounded-r-xl text-sm sm:text-base text-[#12181B] leading-relaxed font-serif">
              {memo.thesis}
            </div>
          </div>

          {/* Section 2: Key Metrics Grid */}
          {memo.keyMetrics && Object.keys(memo.keyMetrics).length > 0 && (
            <div>
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#B8860B] mb-3">
                2. Key Financial & Business Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(memo.keyMetrics).map(([key, val]) => (
                  <div key={key} className="bg-[#12181B]/5 border border-[#12181B]/15 p-3 rounded-xl text-center">
                    <span className="text-[10px] font-mono uppercase text-[#4A5A63] block truncate mb-1">
                      {key}
                    </span>
                    <span className="text-sm sm:text-base font-bold font-mono text-[#2F6F4E] truncate block">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths - Ledger Green (#2F6F4E) */}
            <div className="bg-[#2F6F4E]/10 border border-[#2F6F4E]/30 p-4 sm:p-5 rounded-xl">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#2F6F4E] mb-3 flex items-center gap-1.5">
                <span>✅</span> Core Strengths & Moat ({memo.strengths?.length || 0})
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#12181B]">
                {memo.strengths?.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#2F6F4E] shrink-0 font-bold">•</span>
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses - Claret (#7A2E2E) */}
            <div className="bg-[#7A2E2E]/10 border border-[#7A2E2E]/30 p-4 sm:p-5 rounded-xl">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#7A2E2E] mb-3 flex items-center gap-1.5">
                <span>⚠️</span> Risks & Vulnerabilities ({memo.weaknesses?.length || 0})
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#12181B]">
                {memo.weaknesses?.map((wk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#7A2E2E] shrink-0 font-bold">•</span>
                    <span className="leading-relaxed">{wk}</span>
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
