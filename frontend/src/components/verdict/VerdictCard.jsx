import React from 'react';

/**
 * VerdictCard component — sticky top verdict card with color-coded badge,
 * conviction score radial gauge, and narrative thesis summary.
 *
 * @param {{
 *   verdict: "Invest" | "Watchlist" | "Pass",
 *   conviction: number,
 *   thesisSummary: string,
 *   companyName: string,
 *   onReset: () => void
 * }} props
 */
export function VerdictCard({ verdict, conviction = 0, thesisSummary, companyName, onReset }) {
  const getVerdictStyle = () => {
    switch (verdict) {
      case 'Invest':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          badgeBg: 'bg-emerald-500 text-slate-950',
          text: 'text-emerald-400',
          stroke: '#10b981', // emerald-500
          glow: 'shadow-emerald-500/20',
        };
      case 'Watchlist':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          badgeBg: 'bg-amber-500 text-slate-950',
          text: 'text-amber-400',
          stroke: '#f59e0b', // amber-500
          glow: 'shadow-amber-500/20',
        };
      case 'Pass':
      default:
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          badgeBg: 'bg-rose-500 text-white',
          text: 'text-rose-400',
          stroke: '#f43f5e', // rose-500
          glow: 'shadow-rose-500/20',
        };
    }
  };

  const style = getVerdictStyle();

  // Gauge calculation (radial SVG arc)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const clampedConviction = Math.max(0, Math.min(100, conviction));
  const strokeDashoffset = circumference - (clampedConviction / 100) * circumference;

  return (
    <div className={`sticky top-4 z-30 w-full max-w-4xl mx-auto ${style.bg} backdrop-blur-md border ${style.border} rounded-2xl p-6 shadow-2xl ${style.glow} mb-8 transition-all duration-300`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left: Company & Verdict Badge */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Final IC Verdict
            </span>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400 font-medium">{companyName}</span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-4 mb-3">
            <span className={`text-3xl sm:text-4xl font-black uppercase tracking-tight px-4 py-1.5 rounded-xl font-mono shadow-lg ${style.badgeBg}`}>
              {verdict || 'PENDING'}
            </span>
          </div>

          {thesisSummary && (
            <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
              {thesisSummary}
            </p>
          )}
        </div>

        {/* Right: Conviction Radial Gauge + Reset button */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={style.stroke}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Score text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white font-mono leading-none">
                  {clampedConviction}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
                  Conviction
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1">Scale 0 - 100</span>
          </div>

          <button
            onClick={onReset}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all shadow-md hover:text-white cursor-pointer"
          >
            ← New Research
          </button>
        </div>

      </div>
    </div>
  );
}
