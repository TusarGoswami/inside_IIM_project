import React, { useState, useEffect } from 'react';
import { fetchHistory } from '../../api/researchClient.js';

/**
 * Verdict badge styling — matches VerdictCard stamp colors.
 */
function VerdictBadge({ verdict }) {
  const styles = {
    Invest: 'border-[#3E6B4F] text-[#3E6B4F]',
    Watchlist: 'border-[#A9772E] text-[#A9772E]',
    Pass: 'border-[#8B2E2E] text-[#8B2E2E]',
  };
  const cls = styles[verdict] || styles.Pass;

  return (
    <span className={`inline-block px-2.5 py-0.5 border-2 font-mono font-black text-xs uppercase tracking-wider ${cls}`}>
      {verdict}
    </span>
  );
}

/**
 * Formats a timestamp for display.
 * @param {string} isoDate
 */
function formatDate(isoDate) {
  try {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

/**
 * HistoryPanel — "Past Evaluations" list with classified dossier aesthetic.
 * Shows a list of completed runs and allows loading any past run into the result view.
 *
 * @param {{ onLoadRun: (id: string) => void, onBack: () => void }} props
 */
export function HistoryPanel({ onLoadRun, onBack }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchHistory()
      .then((data) => {
        if (!cancelled) setRuns(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="w-full max-w-[1200px] mx-auto py-6 sm:py-12 px-4 animate-fade-in">
      <div className="bg-[#D9CBA8] border-2 border-[#22201B] p-6 sm:p-10 shadow-[8px_8px_0px_#22201B] relative staple-clip">

        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#22201B] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 border-2 border-[#6B6353] text-[#6B6353] font-mono font-bold text-[11px] tracking-widest uppercase">
              ARCHIVED // HISTORICAL RECORDS
            </span>
          </div>
          <button
            onClick={onBack}
            className="min-h-[36px] px-4 py-1.5 bg-[#22201B] hover:bg-[#38352e] text-[#EDE4D3] font-mono text-xs font-bold uppercase tracking-wider border-2 border-[#22201B] shadow-[2px_2px_0px_#6B6353] transition-all cursor-pointer"
          >
            ← BACK TO INPUT
          </button>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#22201B] tracking-tight mb-2">
          Past Evaluations Archive
        </h2>
        <p className="text-xs sm:text-sm text-[#22201B]/80 font-sans leading-relaxed mb-8">
          Previously completed Investment Committee dossier verdicts. Click any entry to review the full evaluation report.
        </p>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <span className="text-sm font-mono text-[#6B6353] animate-pulse">RETRIEVING RECORDS...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-[#EDE4D3] border-2 border-[#8B2E2E] p-4 text-center shadow-[3px_3px_0px_#8B2E2E] mb-6">
            <span className="text-xs font-mono text-[#8B2E2E] font-bold">
              ARCHIVE UNAVAILABLE — {error}
            </span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && runs.length === 0 && (
          <div className="bg-[#EDE4D3] border-2 border-[#22201B] p-8 text-center shadow-[4px_4px_0px_#22201B]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6353] block font-bold mb-2">
              NO RECORDS FOUND
            </span>
            <p className="text-sm text-[#22201B] font-sans">
              Complete an evaluation to populate the archive. Run history is persisted across sessions.
            </p>
          </div>
        )}

        {/* Runs List */}
        {!loading && runs.length > 0 && (
          <div className="space-y-3">
            {runs.map((run) => (
              <button
                key={run.id}
                onClick={() => onLoadRun(run.id)}
                className="w-full text-left bg-[#EDE4D3] border-2 border-[#22201B] p-4 sm:p-5 shadow-[3px_3px_0px_#22201B] hover:bg-white hover:shadow-[4px_4px_0px_#22201B] transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Company + Verdict */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <VerdictBadge verdict={run.verdict} />
                    <span className="text-base sm:text-lg font-serif font-bold text-[#22201B] group-hover:underline">
                      {run.company_name}
                    </span>
                  </div>

                  {/* Right: Conviction + Date */}
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs font-mono text-[#6B6353] font-bold">
                      CONVICTION: <span className="text-[#22201B] text-sm">{run.conviction}</span>/100
                    </span>
                    <span className="text-[10px] font-mono text-[#6B6353]">
                      {formatDate(run.created_at)}
                    </span>
                    <span className="text-xs text-[#6B6353] group-hover:text-[#22201B] transition-colors font-mono font-bold">
                      VIEW →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
