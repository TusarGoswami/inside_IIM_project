import React from 'react';
import { STAGES } from '../../types/research.js';

const STEP_CONFIG = [
  {
    key: STAGES.RESEARCHING,
    title: '1. Web Research & Extraction',
    description: 'Scanning live market sources, financial filings, competitors, and sentiment via Tavily & Gemini',
    nodeNames: ['researcherNode'],
  },
  {
    key: STAGES.WRITING_MEMO,
    title: '2. Investment Memo Drafting',
    description: 'Synthesizing thesis, competitive moat, financial metrics, and data conflict checks',
    nodeNames: ['memoWriterNode'],
  },
  {
    key: STAGES.DEBATING,
    title: '3. Parallel Bull vs. Bear Debate',
    description: 'Running independent advocate nodes with evidence-backed scoring & conditional rebuttal round',
    nodeNames: ['bullNode', 'bearNode', 'debateJudgeCheck', 'rebuttalNode'],
  },
  {
    key: STAGES.AUDITING_RISK,
    title: '4. Risk Audit & Governance Scan',
    description: 'Auditing regulatory, financial distress, governance red flags & data confidence caps',
    nodeNames: ['riskAuditorNode'],
  },
  {
    key: STAGES.VOTING,
    title: '5. Deterministic Committee Voting',
    description: 'Calculating 5-dimension weighted score, risk penalty, critical override, and final verdict',
    nodeNames: ['scoreAggregatorNode', 'verdictJudgeNode'],
  },
];

/**
 * Vertical progress stepper showing stage transitions as backend streams SSE events.
 *
 * @param {{ stage: string, reasoningTrail?: string[], error?: string }} props
 */
export function ProgressStepper({ stage, reasoningTrail = [], error }) {
  const getStepStatus = (stepKey, stepIndex) => {
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
    <div className="w-full max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
          Live Committee Session Progress
        </h2>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-blue-400 border border-slate-700">
          SSE Stream Active
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {STEP_CONFIG.map((step, index) => {
          const status = getStepStatus(step.key, index);

          return (
            <div key={step.key} className="relative flex items-start gap-4 group">
              {/* Step indicator icon */}
              <div className="absolute -left-6 top-0 flex items-center justify-center">
                {status === 'completed' && (
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-md shadow-emerald-500/20">
                    ✓
                  </span>
                )}
                {status === 'active' && (
                  <span className="relative flex h-6 w-6 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                  </span>
                )}
                {status === 'pending' && (
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                )}
                {status === 'error' && (
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-xs shadow-md">
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
                        ? 'text-emerald-400'
                        : status === 'active'
                        ? 'text-blue-400 font-bold'
                        : status === 'error'
                        ? 'text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </h3>
                  {status === 'active' && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live reasoning log ticker */}
      {reasoningTrail.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="text-[11px] font-mono uppercase text-slate-500 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Committee Live Trail ({reasoningTrail.length} events)
          </div>
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 max-h-32 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5">
            {reasoningTrail.map((msg, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-slate-600 select-none">›</span>
                <span className="text-slate-300 leading-normal">{msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
