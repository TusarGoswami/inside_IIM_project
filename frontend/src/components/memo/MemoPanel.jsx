import React, { useState } from 'react';

/**
 * MemoPanel component — document-styled investment memo collapsed behind a toggle.
 *
 * @param {{ memo?: import('../../types/research.js').MemoData, companyName: string }} props
 */
export function MemoPanel({ memo, companyName }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!memo) return null;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl mb-8 overflow-hidden">
      {/* Header Toggle Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-slate-900 hover:bg-slate-800/80 transition-colors text-left cursor-pointer border-b border-slate-800"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📄</span>
          <div>
            <h3 className="text-base font-bold text-white">
              Full Investment Committee Memo — {companyName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured brief covering thesis, moat, metrics, and data conflict checks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {memo.dataConflict && (
            <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              ⚠️ Data Conflict Noted
            </span>
          )}
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1">
            {isOpen ? 'Collapse Memo ▲' : 'Read Full Memo ▾'}
          </span>
        </div>
      </button>

      {/* Expanded Document Content */}
      {isOpen && (
        <div className="p-8 bg-slate-950/90 border-t border-slate-800 space-y-8 font-sans">
          
          {/* Document Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
              <span>CONFIDENTIAL — FOR IC REVIEW ONLY</span>
              <span>DATE: {new Date().toLocaleDateString()}</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-100">
              Investment Recommendation Brief: {companyName}
            </h2>
          </div>

          {/* Section 1: Thesis */}
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-blue-400 mb-2">
              1. Executive Thesis Statement
            </h4>
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-200 leading-relaxed font-serif">
              {memo.thesis}
            </div>
          </div>

          {/* Section 2: Key Metrics Grid */}
          {memo.keyMetrics && Object.keys(memo.keyMetrics).length > 0 && (
            <div>
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-blue-400 mb-3">
                2. Key Financial & Business Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(memo.keyMetrics).map(([key, val]) => (
                  <div key={key} className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block truncate mb-1">
                      {key}
                    </span>
                    <span className="text-base font-bold font-mono text-emerald-400 truncate block">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="bg-emerald-950/10 border border-emerald-500/20 p-5 rounded-xl">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                <span>✅</span> Core Strengths & Moat ({memo.strengths?.length || 0})
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {memo.strengths?.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">•</span>
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-rose-950/10 border border-rose-500/20 p-5 rounded-xl">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
                <span>⚠️</span> Risks & Vulnerabilities ({memo.weaknesses?.length || 0})
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {memo.weaknesses?.map((wk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 shrink-0 font-bold">•</span>
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
