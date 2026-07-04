import React from 'react';

/**
 * DebatePanel component — displays Bull and Bear advocate cases side by side,
 * with argument points, memo evidence citations, strength scores, and rebuttal round.
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
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            ⚔️ Investment Committee Debate
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Parallel AI advocates arguing strictly from the memo evidence base
          </p>
        </div>
        {rebuttalOccurred && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Rebuttal Round Triggered (Score Gap ≤ 15)
          </span>
        )}
      </div>

      {/* Two Columns: Bull vs Bear */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bull Column */}
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h4 className="text-base font-bold text-emerald-400 uppercase tracking-wide">
                  Bull Case
                </h4>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30 text-xs font-mono text-emerald-300 font-bold">
                Strength: {bullCase?.strength ?? 0}/100
              </div>
            </div>

            <div className="space-y-4">
              {bullCase?.arguments?.map((arg, i) => (
                <div key={i} className="bg-slate-900/90 border border-emerald-500/20 rounded-lg p-4">
                  <div className="text-xs font-semibold text-emerald-300 mb-1.5 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">#{i + 1}</span>
                    <span>{arg.point}</span>
                  </div>
                  <div className="bg-emerald-950/40 border-l-2 border-emerald-500/60 pl-3 py-1.5 pr-2 rounded-r text-xs text-slate-300 italic">
                    <span className="text-[10px] font-mono uppercase text-emerald-400/80 not-italic block mb-0.5">
                      Evidence from Memo:
                    </span>
                    "{arg.evidence}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bear Column */}
        <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <h4 className="text-base font-bold text-rose-400 uppercase tracking-wide">
                  Bear Case
                </h4>
              </div>
              <div className="flex items-center gap-1 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/30 text-xs font-mono text-rose-300 font-bold">
                Strength: {bearCase?.strength ?? 0}/100
              </div>
            </div>

            <div className="space-y-4">
              {bearCase?.arguments?.map((arg, i) => (
                <div key={i} className="bg-slate-900/90 border border-rose-500/20 rounded-lg p-4">
                  <div className="text-xs font-semibold text-rose-300 mb-1.5 flex items-start gap-2">
                    <span className="text-rose-500 font-bold">#{i + 1}</span>
                    <span>{arg.point}</span>
                  </div>
                  <div className="bg-rose-950/40 border-l-2 border-rose-500/60 pl-3 py-1.5 pr-2 rounded-r text-xs text-slate-300 italic">
                    <span className="text-[10px] font-mono uppercase text-rose-400/80 not-italic block mb-0.5">
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

      {/* Rebuttal Round Section (if triggered) */}
      {rebuttalOccurred && rebuttal && (
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 rounded-xl p-5">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🔄</span> Rebuttal Round: Counter-Arguments
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bull Rebuttal */}
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-lg p-3.5">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Bull Counter to Bear's Strongest Point:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  "{rebuttal.bullRebuttal}"
                </p>
              </div>

              {/* Bear Rebuttal */}
              <div className="bg-slate-950/80 border border-rose-500/30 rounded-lg p-3.5">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                  Bear Counter to Bull's Strongest Point:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
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
