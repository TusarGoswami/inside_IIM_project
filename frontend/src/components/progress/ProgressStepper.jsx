import React, { useState, useEffect } from 'react';
import { STAGES } from '../../types/research.js';

const STEP_CONFIG = [
  {
    key: STAGES.RESEARCHING,
    title: 'SECTION 1 — WEB RESEARCH & EXTRACTION',
    shortTitle: 'SEC 1: RESEARCH',
    description: 'Scanning live market sources, financial filings, competitors, and sentiment',
    statusMessages: [
      'Connecting to research sources...',
      'Querying financial databases...',
      'Scanning news and press releases...',
      'Extracting market sentiment data...',
      'Compiling competitor landscape...',
      'Aggregating source material...',
    ],
  },
  {
    key: STAGES.WRITING_MEMO,
    title: 'SECTION 2 — IC INVESTMENT MEMO DRAFT',
    shortTitle: 'SEC 2: MEMO',
    description: 'Synthesizing thesis, competitive moat, financial metrics, and data conflicts',
    statusMessages: [
      'Structuring investment thesis...',
      'Analyzing competitive moat strength...',
      'Evaluating financial health indicators...',
      'Cross-referencing data conflicts...',
      'Drafting executive summary...',
    ],
  },
  {
    key: STAGES.DEBATING,
    title: 'SECTION 3 — PARALLEL BULL VS BEAR DEBATE',
    shortTitle: 'SEC 3: DEBATE',
    description: 'Running advocate nodes with evidence-backed scoring & conditional rebuttal',
    statusMessages: [
      'Bull agent building investment case...',
      'Bear agent building counter-case...',
      'Marshalling evidence for arguments...',
      'Scoring argument strength...',
      'Evaluating rebuttal conditions...',
      'Synthesizing debate outcome...',
    ],
  },
  {
    key: STAGES.AUDITING_RISK,
    title: 'SECTION 4 — DUE DILIGENCE RISK AUDIT',
    shortTitle: 'SEC 4: RISK AUDIT',
    description: 'Auditing regulatory, financial distress, governance flags & data confidence caps',
    statusMessages: [
      'Scanning for regulatory red flags...',
      'Evaluating financial distress signals...',
      'Auditing governance structure...',
      'Assessing data confidence level...',
      'Classifying risk severity tiers...',
    ],
  },
  {
    key: STAGES.VOTING,
    title: 'SECTION 5 — VERDICT & CONVICTION COMPUTATION',
    shortTitle: 'SEC 5: VERDICT',
    description: 'Calculating 5-dimension weighted score, risk penalty, and final verdict',
    statusMessages: [
      'Computing market position score...',
      'Calculating financial health weight...',
      'Applying bear-adjusted conviction...',
      'Factoring risk penalty deductions...',
      'Determining final verdict label...',
      'Generating thesis synthesis...',
    ],
  },
];

/**
 * RotatingStatus — Cycles through status messages for the active step.
 * Styled as typewriter log entries to match the classified dossier aesthetic.
 *
 * @param {{ messages: string[] }} props
 */
function RotatingStatus({ messages }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex items-center gap-2 mt-2 animate-fade-in" key={index}>
      <span className="inline-block w-1.5 h-1.5 bg-[#A9772E] animate-pulse shrink-0"></span>
      <span className="text-[11px] font-mono text-[#A9772E] font-semibold typewriter-line">
        {messages[index]}
      </span>
    </div>
  );
}

/**
 * ThinkingIndicator — Animated thinking state shown before any data arrives.
 * Gives immediate visual feedback that the pipeline has started.
 */
function ThinkingIndicator({ companyName }) {
  const [dotCount, setDotCount] = useState(1);
  const [msgIndex, setMsgIndex] = useState(0);

  const messages = [
    `Initiating dossier for ${companyName || 'target entity'}`,
    'Establishing secure research channels',
    'Preparing analysis framework',
    'Connecting to intelligence sources',
  ];

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDotCount(prev => (prev % 3) + 1);
    }, 500);
    const msgTimer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 4000);
    return () => { clearInterval(dotTimer); clearInterval(msgTimer); };
  }, []);

  return (
    <div className="bg-[#EDE4D3] border-2 border-[#22201B] p-4 sm:p-5 shadow-[4px_4px_0px_#22201B] animate-fade-in">
      {/* Scanning animation header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-[#3E6B4F] animate-pulse" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-[#A9772E] animate-pulse" style={{ animationDelay: '200ms' }}></span>
          <span className="w-2 h-2 bg-[#3E6B4F] animate-pulse" style={{ animationDelay: '400ms' }}></span>
        </div>
        <span className="text-[11px] font-mono font-bold text-[#22201B] uppercase tracking-wider">
          COMMITTEE PIPELINE INITIALIZING{'.'.repeat(dotCount)}
        </span>
      </div>

      {/* Rotating status line */}
      <div className="flex items-start gap-2 pl-1">
        <span className="text-[10px] font-mono text-[#6B6353] font-bold select-none mt-0.5">▸</span>
        <span className="text-xs font-mono text-[#6B6353] typewriter-line" key={msgIndex}>
          {messages[msgIndex]}
        </span>
      </div>

      {/* Animated progress bar */}
      <div className="mt-3 h-1 bg-[#D9CBA8] border border-[#22201B]/30 overflow-hidden">
        <div className="h-full bg-[#3E6B4F]/60 progress-slide"></div>
      </div>
    </div>
  );
}

/**
 * ProgressStepper component — Stack of Folder Tabs (Dossier File Case Style).
 * Each stage is represented as a physical folder tab that lifts/opens as work progresses.
 * Mobile: Degradation into compact tab strip.
 *
 * @param {{ stage: string, reasoningTrail?: string[], error?: string, companyName?: string }} props
 */
export function ProgressStepper({ stage, reasoningTrail = [], error, companyName }) {
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

  // Calculate completed step count for the activity summary
  const completedSteps = STEP_CONFIG.filter(s => getStepStatus(s.key) === 'completed').length;
  const activeStep = STEP_CONFIG.find(s => getStepStatus(s.key) === 'active');

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-[#D9CBA8] border-2 border-[#22201B] p-4 sm:p-6 shadow-[6px_6px_0px_#22201B] mb-8 staple-clip">
      
      {/* Dossier Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-[#22201B]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6353] block font-bold">
            CASE FILE WORKFLOW STATUS
          </span>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#22201B] flex items-center gap-2 mt-0.5">
            <span className="w-2.5 h-2.5 bg-[#3E6B4F] animate-pulse inline-block"></span>
            DOSSIER EXECUTION PIPELINE
          </h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] font-mono px-3 py-1 bg-[#EDE4D3] text-[#22201B] border border-[#22201B] font-bold shadow-[2px_2px_0px_#22201B]">
            STREAM ACTIVE
          </span>
          <span className="text-[10px] font-mono text-[#6B6353] font-bold">
            {completedSteps}/{STEP_CONFIG.length} SECTIONS COMPLETE
          </span>
        </div>
      </div>

      {/* Thinking Indicator — shown immediately before any node completes */}
      {stage === STAGES.RESEARCHING && reasoningTrail.length === 0 && (
        <div className="mb-6">
          <ThinkingIndicator companyName={companyName} />
        </div>
      )}

      {/* MOBILE (< 640px): Compact Horizontal Folder Tabs Strip */}
      <div className="block sm:hidden mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {STEP_CONFIG.map((step, index) => {
            const status = getStepStatus(step.key);

            return (
              <div
                key={step.key}
                className={`flex flex-col px-3 py-2 border-2 text-xs font-mono whitespace-nowrap shrink-0 ${
                  status === 'completed'
                    ? 'bg-[#3E6B4F]/10 border-[#3E6B4F] text-[#3E6B4F] font-bold'
                    : status === 'active'
                    ? 'bg-[#EDE4D3] border-[#22201B] text-[#22201B] font-bold shadow-[2px_2px_0px_#22201B]'
                    : status === 'error'
                    ? 'bg-[#8B2E2E]/10 border-[#8B2E2E] text-[#8B2E2E] font-bold'
                    : 'bg-[#D9CBA8] border-[#6B6353]/40 text-[#6B6353]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>[{index + 1}]</span>
                  <span>{step.shortTitle}</span>
                  {status === 'completed' && <span>✓</span>}
                  {status === 'active' && <span className="animate-pulse">▶</span>}
                </div>
                {/* Rotating sub-status on active mobile tab */}
                {status === 'active' && (
                  <RotatingStatus messages={step.statusMessages} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DESKTOP / TABLET (>= 640px): Stacked Manila Folder Tabs */}
      <div className="hidden sm:block space-y-3 mb-6">
        {STEP_CONFIG.map((step, index) => {
          const status = getStepStatus(step.key);

          return (
            <div
              key={step.key}
              className={`border-2 transition-all duration-200 ${
                status === 'completed'
                  ? 'bg-[#EDE4D3] border-[#22201B] shadow-[3px_3px_0px_#3E6B4F]'
                  : status === 'active'
                  ? 'bg-[#EDE4D3] border-[#22201B] shadow-[5px_5px_0px_#22201B] translate-x-1'
                  : status === 'error'
                  ? 'bg-[#EDE4D3] border-[#8B2E2E] shadow-[3px_3px_0px_#8B2E2E]'
                  : 'bg-[#D9CBA8] border-[#6B6353]/50 opacity-70'
              }`}
            >
              {/* Tab Handle Strip */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#EDE4D3]/60 border-b border-[#22201B]/30 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 border text-[10px] font-bold ${
                    status === 'completed' ? 'border-[#3E6B4F] text-[#3E6B4F] bg-[#3E6B4F]/10' :
                    status === 'active' ? 'border-[#22201B] text-[#22201B] bg-[#22201B]/10' :
                    status === 'error' ? 'border-[#8B2E2E] text-[#8B2E2E] bg-[#8B2E2E]/10' :
                    'border-[#6B6353] text-[#6B6353]'
                  }`}>
                    TAB 0{index + 1}
                  </span>
                  <h3 className={`font-mono font-bold tracking-wide uppercase ${
                    status === 'completed' ? 'text-[#3E6B4F]' :
                    status === 'active' ? 'text-[#22201B]' :
                    status === 'error' ? 'text-[#8B2E2E]' :
                    'text-[#6B6353]'
                  }`}>
                    {step.title}
                  </h3>
                </div>

                <div className="font-mono text-[11px] font-bold">
                  {status === 'completed' && <span className="text-[#3E6B4F]">[ COMPLETED ✓ ]</span>}
                  {status === 'active' && <span className="text-[#22201B] animate-pulse">[ PROCESSING... ]</span>}
                  {status === 'pending' && <span className="text-[#6B6353]">[ QUEUED ]</span>}
                  {status === 'error' && <span className="text-[#8B2E2E]">[ FAILED ✕ ]</span>}
                </div>
              </div>

              {/* Tab Description Body + Rotating Sub-Status */}
              <div className="px-4 py-2.5">
                <p className="text-xs text-[#22201B]/80 font-sans">
                  {step.description}
                </p>
                {/* Rotating sub-status for the active step */}
                {status === 'active' && (
                  <RotatingStatus messages={step.statusMessages} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Committee Reasoning Log Ticker */}
      {reasoningTrail.length > 0 && (
        <div className="pt-4 border-t-2 border-[#22201B]">
          <div className="text-[11px] font-mono uppercase text-[#22201B] mb-2 flex items-center gap-2 font-bold tracking-wider">
            <span className="w-2 h-2 bg-[#22201B]"></span>
            AGENT REASONING LOG ({reasoningTrail.length} RECORDS):
          </div>
          <div className="bg-[#EDE4D3] border-2 border-[#22201B] p-3 max-h-36 overflow-y-auto font-mono text-xs text-[#22201B] space-y-1.5 shadow-[inset_0_0_4px_rgba(0,0,0,0.1)]">
            {reasoningTrail.map((msg, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#6B6353] font-bold select-none">[{String(i+1).padStart(2, '0')}]</span>
                <span className="leading-snug">{msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-[#EDE4D3] border-2 border-[#8B2E2E] text-[#8B2E2E] text-xs font-mono flex items-center gap-2 shadow-[2px_2px_0px_#8B2E2E]">
          <span>[WARNING]</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
