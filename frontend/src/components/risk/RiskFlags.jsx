import React, { useState } from 'react';

/**
 * RiskFlags component — Stamped Red Flag Labels (Dossier Audit Scan).
 * Aesthetic: Small stamped labels ("FLAGGED — HIGH SEVERITY"), manila paper cards, typewriter font.
 *
 * @param {{ riskFlags?: import('../../types/research.js').RiskFlag[] }} props
 */
export function RiskFlags({ riskFlags = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!riskFlags || riskFlags.length === 0) {
    return (
      <div className="w-full max-w-[1200px] mx-auto bg-[#D9CBA8] border-2 border-[#22201B] p-6 shadow-[6px_6px_0px_#22201B] mb-8 staple-clip">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6353] block font-bold mb-1">
          EXHIBIT C — DUE DILIGENCE AUDIT SCAN
        </span>
        <h3 className="text-base font-serif font-bold text-[#3E6B4F] flex items-center gap-2">
          [ AUDIT CLEAN — NO CRITICAL RED FLAGS IDENTIFIED ]
        </h3>
        <p className="text-xs text-[#22201B]/80 mt-1 font-sans">No concrete red flags or critical risks identified during due diligence audit.</p>
      </div>
    );
  }

  const getSeverityStamp = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          cardBg: 'bg-[#EDE4D3]',
          borderColor: 'border-[#8B2E2E]',
          shadow: 'shadow-[3px_3px_0px_#8B2E2E]',
          stampClass: 'stamp-pass',
          label: 'FLAGGED — CRITICAL SEVERITY',
        };
      case 'high':
        return {
          cardBg: 'bg-[#EDE4D3]',
          borderColor: 'border-[#8B2E2E]',
          shadow: 'shadow-[3px_3px_0px_#8B2E2E]',
          stampClass: 'stamp-pass',
          label: 'FLAGGED — HIGH SEVERITY',
        };
      case 'medium':
        return {
          cardBg: 'bg-[#EDE4D3]',
          borderColor: 'border-[#A9772E]',
          shadow: 'shadow-[3px_3px_0px_#A9772E]',
          stampClass: 'stamp-watchlist',
          label: 'FLAGGED — MEDIUM SEVERITY',
        };
      case 'low':
      default:
        return {
          cardBg: 'bg-[#EDE4D3]',
          borderColor: 'border-[#22201B]',
          shadow: 'shadow-[3px_3px_0px_#22201B]',
          stampClass: 'text-[#6B6353] border-[#6B6353]',
          label: 'FLAGGED — LOW SEVERITY',
        };
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-[#D9CBA8] border-2 border-[#22201B] p-4 sm:p-6 shadow-[6px_6px_0px_#22201B] mb-8 staple-clip">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#22201B]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6353] block font-bold">
            EXHIBIT C — DUE DILIGENCE AUDIT SCAN
          </span>
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#22201B] flex items-center gap-2 mt-0.5">
            RISK AUDITOR RED FLAGS ({riskFlags.length} DETECTED)
          </h3>
          <p className="text-xs text-[#6B6353] font-sans">
            Governance, regulatory, financial distress & competitive risks
          </p>
        </div>
        <span className="text-[11px] text-[#22201B] font-mono font-bold hidden sm:inline">[ CLICK FLAG TO EXPAND ]</span>
      </div>

      {/* Grid of Stamped Labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {riskFlags.map((flag, idx) => {
          const stampStyle = getSeverityStamp(flag.severity);
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              onClick={() => toggleExpand(idx)}
              className={`min-h-[44px] p-3.5 border-2 ${stampStyle.cardBg} ${stampStyle.borderColor} ${stampStyle.shadow} transition-all cursor-pointer select-none flex flex-col justify-center`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 border inline-block self-start ${stampStyle.stampClass}`}>
                    {stampStyle.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#22201B] truncate">
                    {flag.label}
                  </span>
                </div>
                <span className="text-[#22201B] font-mono font-bold text-xs shrink-0">{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <div className="mt-2.5 pt-2 border-t border-[#22201B]/30 text-xs text-[#22201B] leading-relaxed font-sans bg-[#D9CBA8]/40 p-2 border">
                  {flag.detail}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
