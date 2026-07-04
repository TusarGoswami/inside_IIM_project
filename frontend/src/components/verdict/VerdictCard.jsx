import React from 'react';

/**
 * VerdictCard component — top verdict banner card with solid opacity boardroom palette:
 * - Invest: ledger-green (#2F6F4E)
 * - Watchlist: brass (#B8860B)
 * - Pass: claret (#7A2E2E)
 *
 * Fixed: Solid opacity background and relative positioning to prevent scroll bleed & overlapping text artifacts.
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
          cardBg: 'bg-[#182420]',
          border: 'border-[#2F6F4E]',
          badgeBg: 'bg-[#2F6F4E] text-[#F6F1E7]',
          stroke: '#2F6F4E',
          text: 'text-[#2F6F4E]',
        };
      case 'Watchlist':
        return {
          cardBg: 'bg-[#242018]',
          border: 'border-[#B8860B]',
          badgeBg: 'bg-[#B8860B] text-[#12181B]',
          stroke: '#B8860B',
          text: 'text-[#B8860B]',
        };
      case 'Pass':
      default:
        return {
          cardBg: 'bg-[#241818]',
          border: 'border-[#7A2E2E]',
          badgeBg: 'bg-[#7A2E2E] text-[#F6F1E7]',
          stroke: '#7A2E2E',
          text: 'text-[#7A2E2E]',
        };
    }
  };

  const style = getVerdictStyle();

  // Radial gauge calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const clampedConviction = Math.max(0, Math.min(100, conviction));
  const strokeDashoffset = circumference - (clampedConviction / 100) * circumference;

  return (
    <div className={`w-full max-w-4xl mx-auto ${style.cardBg} border ${style.border} rounded-2xl p-5 sm:p-7 shadow-2xl transition-all duration-300 mb-8`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Company & Verdict Badge */}
        <div className="flex-1 text-center md:text-left w-full">
          <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4A5A63] font-semibold">
              Final Committee Verdict
            </span>
            <span className="text-xs text-[#4A5A63]">•</span>
            <span className="text-xs font-sans text-[#F6F1E7] font-bold">{companyName}</span>
          </div>

          <div className="flex items-center justify-center md:justify-start mb-3">
            <span className={`text-2xl sm:text-4xl font-serif font-black uppercase tracking-wider px-5 py-2 rounded-xl font-mono shadow-md ${style.badgeBg}`}>
              {verdict || 'PENDING'}
            </span>
          </div>

          {thesisSummary && (
            <p className="text-sm text-[#F6F1E7]/90 leading-relaxed font-sans max-w-2xl text-left">
              {thesisSummary}
            </p>
          )}
        </div>

        {/* Right: Radial Gauge & Action Button (44px min tap target) */}
        <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[#4A5A63]/30 shrink-0">
          
          {/* Gauge + Label Block */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-[#12181B]"
                  strokeWidth="8"
                  fill="transparent"
                />
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
              {/* Score number perfectly centered inside circle */}
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-black text-[#F6F1E7] font-mono leading-none">
                  {clampedConviction}
                </span>
              </div>
            </div>
            {/* Label placed cleanly below circle */}
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#4A5A63] mt-1 font-mono">
              Conviction
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={onReset}
            className="min-h-[44px] px-5 py-2.5 bg-[#12181B] hover:bg-[#1f292d] active:bg-[#2a373d] text-[#F6F1E7] border border-[#4A5A63] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            ← New Research
          </button>
        </div>

      </div>
    </div>
  );
}
