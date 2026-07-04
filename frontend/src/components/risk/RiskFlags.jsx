import React, { useState } from 'react';

/**
 * RiskFlags component — displays severity-coded risk flag badges using exact 5-color palette.
 * Palette:
 * - Critical / High: Claret (#7A2E2E)
 * - Medium: Brass (#B8860B)
 * - Low: Slate (#4A5A63)
 *
 * Clickable cards (min 44px height on mobile) to expand detail text.
 *
 * @param {{ riskFlags?: import('../../types/research.js').RiskFlag[] }} props
 */
export function RiskFlags({ riskFlags = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!riskFlags || riskFlags.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-[#12181B] border border-[#4A5A63]/60 rounded-2xl p-6 shadow-2xl mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#2F6F4E] font-bold">🛡️ Risk Audit Scan</span>
        </div>
        <p className="text-xs text-[#4A5A63]">No concrete red flags or critical risks identified during due diligence audit.</p>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-[#7A2E2E]/25 hover:bg-[#7A2E2E]/35',
          border: 'border-[#7A2E2E]',
          text: 'text-[#F6F1E7]',
          pill: 'bg-[#7A2E2E] text-[#F6F1E7] font-black',
        };
      case 'high':
        return {
          bg: 'bg-[#7A2E2E]/15 hover:bg-[#7A2E2E]/25',
          border: 'border-[#7A2E2E]/60',
          text: 'text-[#F6F1E7]',
          pill: 'bg-[#7A2E2E]/80 text-[#F6F1E7] font-bold',
        };
      case 'medium':
        return {
          bg: 'bg-[#B8860B]/15 hover:bg-[#B8860B]/25',
          border: 'border-[#B8860B]/50',
          text: 'text-[#F6F1E7]',
          pill: 'bg-[#B8860B] text-[#12181B] font-bold',
        };
      case 'low':
      default:
        return {
          bg: 'bg-[#12181B] hover:bg-[#1f292d]',
          border: 'border-[#4A5A63]/60',
          text: 'text-[#F6F1E7]',
          pill: 'bg-[#4A5A63] text-[#F6F1E7] font-semibold',
        };
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#12181B] border border-[#4A5A63]/60 rounded-2xl p-4 sm:p-6 shadow-2xl mb-8">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#4A5A63]/40">
        <div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#F6F1E7] flex items-center gap-2">
            🛡️ Risk Auditor Scan & Red Flags
          </h3>
          <p className="text-xs text-[#4A5A63] mt-0.5 font-sans">
            Governance, regulatory, financial distress & competitive risks ({riskFlags.length} flags found)
          </p>
        </div>
        <span className="text-[11px] text-[#4A5A63] font-mono hidden sm:inline">Click flag to toggle detail</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {riskFlags.map((flag, idx) => {
          const badgeStyle = getSeverityBadge(flag.severity);
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              onClick={() => toggleExpand(idx)}
              className={`min-h-[44px] p-3.5 rounded-xl border ${badgeStyle.bg} ${badgeStyle.border} transition-all cursor-pointer select-none flex flex-col justify-center`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${badgeStyle.pill} shrink-0`}>
                    {flag.severity}
                  </span>
                  <span className={`text-xs font-bold truncate ${badgeStyle.text}`}>
                    {flag.label}
                  </span>
                </div>
                <span className="text-[#4A5A63] text-xs shrink-0">{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <div className="mt-2.5 pt-2 border-t border-[#4A5A63]/40 text-xs text-[#F6F1E7]/90 leading-relaxed font-sans">
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
