import React, { useState } from 'react';

/**
 * ResearchPanel component — Classified Intelligence Summary Exhibit (Exhibit 01).
 * Rendered immediately as soon as researcherNode completes.
 *
 * @param {{ research: import('../../types/research.js').ResearchData, companyName: string }} props
 */
export function ResearchPanel({ research, companyName }) {
  const [sourcesOpen, setSourcesOpen] = useState(true);

  if (!research) return null;

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-[#D9CBA8] border-2 border-[#22201B] p-5 sm:p-7 shadow-[6px_6px_0px_#22201B] animate-fade-in staple-clip space-y-5">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#22201B] pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 border-2 border-[#3E6B4F] text-[#3E6B4F] bg-[#3E6B4F]/10 font-mono font-bold text-[10px] tracking-widest uppercase">
            EXHIBIT 01 // INTELLIGENCE DOSSIER
          </span>
          <span className="text-xs font-mono font-bold text-[#22201B]">
            TARGET: {companyName?.toUpperCase() || 'SUBJECT'}
          </span>
        </div>
        {research.lowDataConfidence && (
          <span className="px-2 py-0.5 border border-[#8B2E2E] text-[#8B2E2E] bg-[#8B2E2E]/10 font-mono text-[10px] font-bold uppercase">
            [LOW DATA CONFIDENCE CAP APPLIED]
          </span>
        )}
      </div>

      {/* Primary Research Summary */}
      {research.summary && (
        <div className="bg-[#EDE4D3] border border-[#22201B] p-4 shadow-[3px_3px_0px_#22201B]">
          <span className="text-[10px] font-mono uppercase text-[#6B6353] block font-bold mb-1 tracking-wider">
            PRIMARY MARKET INTELLIGENCE SYNTHESIS:
          </span>
          <p className="text-xs sm:text-sm text-[#22201B] leading-relaxed font-sans font-medium">
            {research.summary}
          </p>
        </div>
      )}

      {/* Grid: Financials & Competitors & Sentiment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Financial Highlights */}
        {research.financials && Object.keys(research.financials).length > 0 && (
          <div className="bg-[#EDE4D3] border border-[#22201B] p-3 shadow-[2px_2px_0px_#22201B]">
            <span className="text-[10px] font-mono uppercase text-[#6B6353] block font-bold mb-1.5 tracking-wider">
              FINANCIAL METRICS:
            </span>
            <div className="space-y-1 font-mono text-xs">
              {Object.entries(research.financials).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-[#22201B]/20 pb-0.5">
                  <span className="text-[#6B6353] capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-bold text-[#22201B]">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitor Landscape */}
        {research.competitors && research.competitors.length > 0 && (
          <div className="bg-[#EDE4D3] border border-[#22201B] p-3 shadow-[2px_2px_0px_#22201B]">
            <span className="text-[10px] font-mono uppercase text-[#6B6353] block font-bold mb-1.5 tracking-wider">
              COMPETITOR LANDSCAPE:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {research.competitors.map((comp, i) => (
                <span key={i} className="px-2 py-0.5 bg-[#D9CBA8] border border-[#22201B] text-xs font-mono font-bold text-[#22201B]">
                  {comp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Market Sentiment */}
        {research.sentiment && (
          <div className="bg-[#EDE4D3] border border-[#22201B] p-3 shadow-[2px_2px_0px_#22201B]">
            <span className="text-[10px] font-mono uppercase text-[#6B6353] block font-bold mb-1.5 tracking-wider">
              MARKET SENTIMENT:
            </span>
            <p className="text-xs font-mono font-bold text-[#22201B] uppercase">
              {research.sentiment}
            </p>
          </div>
        )}
      </div>

      {/* Sources Attachments */}
      {research.sources && research.sources.length > 0 && (
        <div className="bg-[#EDE4D3] border border-[#22201B] p-3 sm:p-4 shadow-[3px_3px_0px_#22201B]">
          <button
            onClick={() => setSourcesOpen(!sourcesOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <span className="text-xs font-mono font-bold text-[#22201B] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-[#3E6B4F]"></span>
              VERIFIED SOURCES ATTACHED ({research.sources.length})
            </span>
            <span className="text-[10px] font-mono font-bold text-[#6B6353]">
              {sourcesOpen ? 'COLLAPSE ▲' : 'EXPAND ▾'}
            </span>
          </button>

          {sourcesOpen && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {research.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#D9CBA8]/60 border border-[#22201B] hover:bg-[#D9CBA8] transition-all block truncate shadow-[1px_1px_0px_#22201B]"
                >
                  <span className="text-xs font-mono font-bold text-[#22201B] block truncate hover:underline">
                    [{i + 1}] {src.title || 'Source'}
                  </span>
                  <span className="text-[10px] font-mono text-[#6B6353] block truncate">
                    {src.url}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
