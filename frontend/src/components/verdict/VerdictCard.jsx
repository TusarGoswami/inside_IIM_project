import React from 'react';

/**
 * VerdictSealWatermark component — Inline SVG of the Official Committee Seal.
 * Dynamically recolored based on verdict stamp color.
 */
function VerdictSealWatermark({ color }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-56 h-56 sm:w-72 sm:h-72 opacity-12 transform -rotate-6 pointer-events-none select-none"
    >
      <defs>
        <filter id="roughen-verdict-seal">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" result="noise" seed="7" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
        </filter>
      </defs>

      {/* Outer stamped rings */}
      <circle cx="100" cy="100" r="86" fill="none" stroke={color} strokeWidth="5" filter="url(#roughen-verdict-seal)" />
      <circle cx="100" cy="100" r="72" fill="none" stroke={color} strokeWidth="2.5" filter="url(#roughen-verdict-seal)" />

      {/* Top curved text */}
      <path id="topArcVerdict" d="M 32 100 A 68 68 0 0 1 168 100" fill="none" />
      <text fontFamily="'IBM Plex Mono', 'Courier New', monospace" fontSize="13" fontWeight="700" letterSpacing="3" fill={color} filter="url(#roughen-verdict-seal)">
        <textPath href="#topArcVerdict" startOffset="8%">INVESTMENT COMMITTEE</textPath>
      </text>

      {/* Bottom curved text */}
      <path id="bottomArcVerdict" d="M 168 100 A 68 68 0 0 1 32 100" fill="none" />
      <text fontFamily="'IBM Plex Mono', 'Courier New', monospace" fontSize="13" fontWeight="700" letterSpacing="4" fill={color} filter="url(#roughen-verdict-seal)">
        <textPath href="#bottomArcVerdict" startOffset="14%">THE DEAL DESK</textPath>
      </text>

      {/* Center monogram */}
      <text x="100" y="118" textAnchor="middle" fontFamily="'Lora', Georgia, serif" fontWeight="700" fontSize="58" fill={color} filter="url(#roughen-verdict-seal)">DD</text>

      {/* Divider stars */}
      <text x="60" y="106" textAnchor="middle" fontSize="14" fill={color} filter="url(#roughen-verdict-seal)">★</text>
      <text x="140" y="106" textAnchor="middle" fontSize="14" fill={color} filter="url(#roughen-verdict-seal)">★</text>
    </svg>
  );
}

/**
 * VerdictCard component — Rubber Ink Stamp pressed onto Official Cover Memo with Seal Watermark.
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
  const getStampStyle = () => {
    switch (verdict) {
      case 'Invest':
        return {
          textColor: 'text-[#3E6B4F]',
          borderColor: 'border-[#3E6B4F]',
          badgeClass: 'stamp-invest',
          label: 'INVEST',
          hexColor: '#3E6B4F',
        };
      case 'Watchlist':
        return {
          textColor: 'text-[#A9772E]',
          borderColor: 'border-[#A9772E]',
          badgeClass: 'stamp-watchlist',
          label: 'WATCHLIST',
          hexColor: '#A9772E',
        };
      case 'Pass':
      default:
        return {
          textColor: 'text-[#8B2E2E]',
          borderColor: 'border-[#8B2E2E]',
          badgeClass: 'stamp-pass',
          label: 'PASS',
          hexColor: '#8B2E2E',
        };
    }
  };

  const stampStyle = getStampStyle();
  const clampedConviction = Math.max(0, Math.min(100, conviction));

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-[#D9CBA8] border-2 border-[#22201B] p-5 sm:p-8 shadow-[8px_8px_0px_#22201B] mb-8 relative staple-clip overflow-hidden">
      
      {/* Background Seal Watermark - Large, dynamically colored, subtle opacity */}
      <div className="absolute right-4 sm:right-24 top-1/2 -translate-y-1/2 z-0 pointer-events-none hidden sm:block">
        <VerdictSealWatermark color={stampStyle.hexColor} />
      </div>

      {/* Document Control Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#22201B] pb-3 mb-6 font-mono text-xs text-[#6B6353] relative z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#22201B]">DOSSIER VERDICT RECORD</span>
          <span>•</span>
          <span className="text-[#22201B] font-bold">TARGET: {companyName?.toUpperCase()}</span>
        </div>
        <span className="font-bold text-[#22201B]">COMMITTEE ACTION CODE: 10-IC-DECISION</span>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Company & Rubber Ink Stamp */}
        <div className="flex-1 text-left w-full">
          <div className="mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6353] block font-bold mb-1">
              OFFICIAL DECISION STAMP:
            </span>
            
            {/* Rubber Ink Stamp - Animated slam reveal */}
            <div className="inline-block my-1 stamp-slam hover:rotate-0 transition-transform duration-200">
              <div className={`px-6 py-2.5 border-4 border-double font-mono font-black text-3xl sm:text-5xl uppercase tracking-widest bg-[#EDE4D3] shadow-[3px_3px_0px_#22201B] ${stampStyle.badgeClass}`}>
                {stampStyle.label}
              </div>
            </div>
          </div>

          {/* Thesis Summary Text */}
          {thesisSummary && (
            <div className="bg-[#EDE4D3]/95 backdrop-blur-[1px] border border-[#22201B] p-4 shadow-[3px_3px_0px_#22201B] mt-2">
              <span className="text-[10px] font-mono uppercase text-[#6B6353] block font-bold mb-1">
                EXECUTIVE THESIS SYNTHESIS:
              </span>
              <p className="text-xs sm:text-sm text-[#22201B] leading-relaxed font-sans font-medium">
                "{thesisSummary}"
              </p>
            </div>
          )}
        </div>

        {/* Right: Conviction Gauge & Action Button */}
        <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[#22201B]/30 shrink-0">
          
          {/* Stamped Conviction Box */}
          <div className="flex flex-col items-center bg-[#EDE4D3] border-2 border-[#22201B] p-4 shadow-[4px_4px_0px_#22201B] text-center min-w-[130px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6353] font-mono block mb-1">
              CONVICTION SCORE
            </span>
            <span className={`text-4xl sm:text-5xl font-mono font-black ${stampStyle.textColor}`}>
              {clampedConviction}<span className="text-base text-[#6B6353]">/100</span>
            </span>
            <div className="w-full bg-[#D9CBA8] border border-[#22201B] h-2 mt-2">
              <div
                className={`h-full ${
                  verdict === 'Invest' ? 'bg-[#3E6B4F]' :
                  verdict === 'Watchlist' ? 'bg-[#A9772E]' : 'bg-[#8B2E2E]'
                }`}
                style={{ width: `${clampedConviction}%` }}
              ></div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onReset}
            className="min-h-[44px] px-5 py-2.5 bg-[#22201B] hover:bg-[#38352e] text-[#EDE4D3] border-2 border-[#22201B] font-mono text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_#6B6353] transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            ← NEW REQUISITION
          </button>
        </div>

      </div>
    </div>
  );
}
