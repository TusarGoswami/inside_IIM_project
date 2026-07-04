import React, { useState } from 'react';

/**
 * RiskFlags component — displays severity-coded risk flag badges (low, medium, high, critical).
 * Clickable to expand one-sentence detail text.
 *
 * @param {{ riskFlags?: import('../../types/research.js').RiskFlag[] }} props
 */
export function RiskFlags({ riskFlags = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!riskFlags || riskFlags.length === 0) {
    return (
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-emerald-400 font-bold">🛡️ Risk Audit Scan</span>
        </div>
        <p className="text-xs text-slate-400">No concrete red flags or critical risks identified during due diligence audit.</p>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-rose-950/80 hover:bg-rose-900/80',
          border: 'border-rose-500/80',
          text: 'text-rose-200',
          pill: 'bg-rose-500 text-slate-950 font-black',
          icon: '🚨 CRITICAL OVERRIDE',
        };
      case 'high':
        return {
          bg: 'bg-orange-950/60 hover:bg-orange-900/60',
          border: 'border-orange-500/50',
          text: 'text-orange-200',
          pill: 'bg-orange-500 text-slate-950 font-bold',
          icon: '⚠️ HIGH RISK',
        };
      case 'medium':
        return {
          bg: 'bg-amber-950/40 hover:bg-amber-900/40',
          border: 'border-amber-500/40',
          text: 'text-amber-200',
          pill: 'bg-amber-500 text-slate-950 font-bold',
          icon: '⚡ MEDIUM',
        };
      case 'low':
      default:
        return {
          bg: 'bg-slate-800/80 hover:bg-slate-700/80',
          border: 'border-slate-700',
          text: 'text-slate-300',
          pill: 'bg-slate-700 text-slate-300 font-semibold',
          icon: 'ℹ️ LOW',
        };
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            🛡️ Risk Auditor Scan & Red Flags
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Governance, regulatory, financial distress & competitive risks ({riskFlags.length} flags found)
          </p>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Click flag to toggle detail</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {riskFlags.map((flag, idx) => {
          const badgeStyle = getSeverityBadge(flag.severity);
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              onClick={() => toggleExpand(idx)}
              className={`p-3.5 rounded-xl border ${badgeStyle.bg} ${badgeStyle.border} transition-all cursor-pointer select-none`}
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
                <span className="text-slate-500 text-xs shrink-0">{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/50 text-xs text-slate-300 leading-relaxed">
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
