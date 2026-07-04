import React from 'react';
import { STAGES } from '../../types/research.js';

const STEP_CONFIG = [
  {
    key: STAGES.RESEARCHING,
    title: '1. Web Research & Extraction',
    shortTitle: '1. Research',
    description: 'Scanning live market sources, financial filings, competitors, and sentiment',
  },
  {
    key: STAGES.WRITING_MEMO,
    title: '2. Investment Memo Drafting',
    shortTitle: '2. Memo',
    description: 'Synthesizing thesis, competitive moat, financial metrics, and data conflicts',
  },
  {
    key: STAGES.DEBATING,
    title: '3. Parallel Bull vs. Bear Debate',
    shortTitle: '3. Debate',
    description: 'Running advocate nodes with evidence-backed scoring & conditional rebuttal',
  },
  {
    key: STAGES.AUDITING_RISK,
    title: '4. Risk Audit & Governance Scan',
    shortTitle: '4. Risk Audit',
    description: 'Auditing regulatory, financial distress, governance flags & data confidence caps',
  },
  {
    key: STAGES.VOTING,
    title: '5. Committee Voting & Verdict',
    shortTitle: '5. Voting',
    description: 'Calculating 5-dimension weighted score, risk penalty, and final verdict',
  },
];

/**
 * ProgressStepper component — responsive progress stepper.
 * Switches between horizontal scrollable bar on mobile (< 640px) and vertical rail on desktop.
 * Palette: Ink (#12181B), Parchment (#F6F1E7), Brass (#B8860B), Ledger-Green (#2F6F4E), Claret (#7A2E2E), Slate (#4A5A63).
 *
 * @param {{ stage: string, reasoningTrail?: string[], error?: string }} props
 */
export function ProgressStepper({ stage, reasoningTrail = [], error }) {
  const getStepStatus = (stepKey) => {
    const stageOrder = [
      STAGES.IDLE,
      STAGES.RESEARCHING,
      STAGES.WRITING_MEMO,
      STAGES.DEBATING,
      STAGES.AUDITING_RISK,
      STAGES.VOTING,
      STAGES.COMPLETED,
    ];

    const currentIndex = stageOrder.indexOf(stage);
    const stepTargetIndex = stageOrder.indexOf(stepKey);

    if (stage === STAGES.ERROR) {
      if (currentIndex === stepTargetIndex) return 'error';
      return stepTargetIndex < currentIndex ? 'completed' : 'pending';
    }

    if (currentIndex > stepTargetIndex || stage === STAGES.COMPLETED) {
      return 'completed';
    }
    if (currentIndex === stepTargetIndex) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#12181B] border border-[#4A5A63]/60 rounded-2xl p-4 sm:p-6 shadow-2xl mb-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-[#4A5A63]/40">
        <h2 className="text-base sm:text-lg font-serif font-bold text-[#F6F1E7] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B8860B] animate-ping"></span>
          Committee Session Progress
        </h2>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#B8860B]/10 text-[#B8860B] border border-[#B8860B]/30">
          SSE Stream Active
        </span>
      </div>

      {/* MOBILE (< 640px): Horizontal Scrollable Stepper */}
      <div className="block sm:hidden mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {STEP_CONFIG.map((step, index) => {
            const status = getStepStatus(step.key);

            return (
              <div
                key={step.key}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs whitespace-nowrap shrink-0 ${
                  status === 'completed'
                    ? 'bg-[#2F6F4E]/20 border-[#2F6F4E] text-[#F6F1E7]'
                    : status === 'active'
                    ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#B8860B] font-bold'
                    : status === 'error'
                    ? 'bg-[#7A2E2E]/20 border-[#7A2E2E] text-[#F6F1E7]'
                    : 'bg-[#12181B] border-[#4A5A63]/40 text-[#4A5A63]'
                }`}
              >
                <span className="font-mono">{index + 1}.</span>
                <span>{step.shortTitle}</span>
                {status === 'completed' && <span className="text-[#2F6F4E]">✓</span>}
                {status === 'active' && <span className="w-2 h-2 rounded-full bg-[#B8860B] animate-pulse"></span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* TABLET / DESKTOP (>= 640px): Vertical Stepper Rail */}
      <div className="hidden sm:block relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#4A5A63]/40">
        {STEP_CONFIG.map((step, index) => {
          const status = getStepStatus(step.key);

          return (
            <div key={step.key} className="relative flex items-start gap-4">
              {/* Step indicator icon */}
              <div className="absolute -left-6 top-0 flex items-center justify-center">
                {status === 'completed' && (
                  <span className="w-6 h-6 rounded-full bg-[#2F6F4E] text-[#F6F1E7] font-bold flex items-center justify-center text-xs shadow-md">
                    ✓
                  </span>
                )}
                {status === 'active' && (
                  <span className="relative flex h-6 w-6 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8860B] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#B8860B]"></span>
                  </span>
                )}
                {status === 'pending' && (
                  <span className="w-6 h-6 rounded-full bg-[#12181B] border border-[#4A5A63] text-[#4A5A63] flex items-center justify-center text-xs font-mono">
                    {index + 1}
                  </span>
                )}
                {status === 'error' && (
                  <span className="w-6 h-6 rounded-full bg-[#7A2E2E] text-[#F6F1E7] font-bold flex items-center justify-center text-xs shadow-md">
                    ✕
                  </span>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pl-2">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm font-semibold transition-colors ${
                      status === 'completed'
                        ? 'text-[#2F6F4E]'
                        : status === 'active'
                        ? 'text-[#B8860B] font-bold'
                        : status === 'error'
                        ? 'text-[#7A2E2E]'
                        : 'text-[#4A5A63]'
                    }`}
                  >
                    {step.title}
                  </h3>
                  {status === 'active' && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#B8860B]/10 text-[#B8860B] border border-[#B8860B]/30 animate-pulse">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4A5A63] mt-1 leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live reasoning log ticker */}
      {reasoningTrail.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[#4A5A63]/40">
          <div className="text-[11px] font-mono uppercase text-[#B8860B] mb-2 flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]"></span>
            Live Committee Reasoning Trail ({reasoningTrail.length} events)
          </div>
          <div className="bg-[#12181B] border border-[#4A5A63]/50 rounded-xl p-3 max-h-36 overflow-y-auto font-mono text-xs text-[#F6F1E7]/80 space-y-1.5">
            {reasoningTrail.map((msg, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#B8860B] select-none">›</span>
                <span className="leading-normal">{msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-[#7A2E2E]/20 border border-[#7A2E2E]/60 rounded-xl text-[#F6F1E7] text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
