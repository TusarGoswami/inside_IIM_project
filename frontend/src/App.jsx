import React, { useState } from 'react';
import { useResearchSession } from './hooks/useResearchSession.js';
import { STAGES } from './types/research.js';
import { CompanyInput } from './components/input/CompanyInput.jsx';
import { ProgressStepper } from './components/progress/ProgressStepper.jsx';
import { VerdictCard } from './components/verdict/VerdictCard.jsx';
import { ScoreBreakdownChart } from './components/verdict/ScoreBreakdownChart.jsx';
import { DebatePanel } from './components/debate/DebatePanel.jsx';
import { RiskFlags } from './components/risk/RiskFlags.jsx';
import { MemoPanel } from './components/memo/MemoPanel.jsx';

export default function App() {
  const { stage, partialState, finalState, error, startSession, resetSession } = useResearchSession();
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  const state = finalState || partialState || {};
  const isRunning = stage !== STAGES.IDLE && stage !== STAGES.COMPLETED && stage !== STAGES.ERROR;
  const isCompleted = stage === STAGES.COMPLETED && Boolean(finalState || state.verdict);

  const isRateLimitError = error?.includes('rate limit') || error?.includes('429') || error?.includes('Quota');

  return (
    <div className="min-h-screen bg-[#EDE4D3] text-[#22201B] font-sans selection:bg-[#D9CBA8] selection:text-[#22201B] border-t-4 border-[#22201B]">
      {/* Top Header - Classified Investment Dossier Header */}
      <header className="border-b-2 border-[#22201B] bg-[#D9CBA8] sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetSession}>
            <div className="w-9 h-9 border-2 border-[#22201B] bg-[#EDE4D3] flex items-center justify-center font-mono font-bold text-xs shadow-[2px_2px_0px_#22201B]">
              DD
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-[#22201B] tracking-tight block leading-none">
                THE DEAL DESK
              </span>
              <span className="text-[10px] font-mono text-[#6B6353] uppercase tracking-widest block mt-0.5 font-semibold">
                INVESTMENT COMMITTEE DOSSIER SYSTEM
              </span>
            </div>
          </div>

          {/* Dossier Control Tags */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EDE4D3] border border-[#22201B] text-xs font-mono text-[#22201B] font-bold shadow-[2px_2px_0px_#22201B]">
              <span className="w-2 h-2 bg-[#3E6B4F]"></span>
              CONFIDENTIAL // FORM 10-IC
            </span>
          </div>

        </div>
      </header>

      {/* Main Dossier Container */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* VIEW 1: Input View */}
        {stage === STAGES.IDLE && (
          <CompanyInput onSubmit={startSession} isLoading={false} />
        )}

        {/* VIEW 2: Live Progress Session View */}
        {isRunning && (
          <div className="space-y-6">
            <ProgressStepper
              stage={stage}
              reasoningTrail={state.reasoningTrail || []}
              error={error}
            />
            {/* Render partial panels as backend streams data */}
            {state.memo && <MemoPanel memo={state.memo} companyName={state.companyName} />}
            {(state.bullCase || state.bearCase) && (
              <DebatePanel
                bullCase={state.bullCase}
                bearCase={state.bearCase}
                rebuttalOccurred={state.rebuttalOccurred}
                rebuttal={state.rebuttal}
              />
            )}
          </div>
        )}

        {/* Error State - Red Stamped Rejection Box */}
        {stage === STAGES.ERROR && (
          <div className="w-full max-w-xl mx-auto bg-[#EDE4D3] border-2 border-[#8B2E2E] p-5 sm:p-8 text-center shadow-[4px_4px_0px_#8B2E2E] animate-fade-in my-6">
            <div className="inline-block px-4 py-1 border-2 border-[#8B2E2E] text-[#8B2E2E] font-mono font-bold text-xs uppercase tracking-widest mb-4">
              [SYSTEM ERROR / EXECUTION ABORTED]
            </div>
            
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#8B2E2E] mb-2">
              {isRateLimitError ? 'API Rate Limit Reached' : 'Research Session Failed'}
            </h2>
            
            <p className="text-xs sm:text-sm text-[#22201B] mb-5 leading-relaxed font-sans max-w-md mx-auto">
              {isRateLimitError
                ? 'The Gemini API free-tier rate limit window was temporarily reached. Please wait 15–20 seconds for the quota window to reset, then click Try Again.'
                : 'An error occurred during committee agent execution.'}
            </p>

            {/* Technical Details Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setShowTechDetails(!showTechDetails)}
                className="text-[11px] font-mono text-[#6B6353] hover:text-[#22201B] underline transition-colors cursor-pointer"
              >
                {showTechDetails ? 'Hide Details ▲' : 'Show Technical Error Details ▾'}
              </button>

              {showTechDetails && (
                <div className="mt-3 p-3 bg-[#D9CBA8] border border-[#22201B] text-left text-[11px] font-mono text-[#22201B] break-all max-h-40 overflow-y-auto">
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={resetSession}
              className="min-h-[44px] px-8 py-3 bg-[#8B2E2E] hover:bg-[#a33737] active:bg-[#722525] text-[#EDE4D3] font-mono font-bold uppercase tracking-wider text-xs sm:text-sm border-2 border-[#22201B] shadow-[3px_3px_0px_#22201B] transition-all cursor-pointer"
            >
              RE-INITIATE DOSSIER →
            </button>
          </div>
        )}

        {/* VIEW 3: Final IC Result View */}
        {isCompleted && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Top Verdict Card */}
            <VerdictCard
              verdict={state.verdict}
              conviction={state.conviction}
              thesisSummary={state.thesisSummary}
              companyName={state.companyName}
              onReset={resetSession}
            />

            {/* Score Breakdown Chart */}
            <ScoreBreakdownChart scores={state.scores} />

            {/* Bull vs Bear Debate Panel */}
            <DebatePanel
              bullCase={state.bullCase}
              bearCase={state.bearCase}
              rebuttalOccurred={state.rebuttalOccurred}
              rebuttal={state.rebuttal}
            />

            {/* Risk Auditor Scan & Red Flags */}
            <RiskFlags riskFlags={state.riskFlags} />

            {/* Full Investment Memo */}
            <MemoPanel memo={state.memo} companyName={state.companyName} />

            {/* Research Sources List - Collapsible on mobile (<640px) */}
            {state.research?.sources?.length > 0 && (
              <div className="w-full max-w-[1200px] mx-auto bg-[#D9CBA8] border-2 border-[#22201B] p-4 sm:p-6 shadow-[4px_4px_0px_#22201B]">
                <button
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="w-full flex items-center justify-between text-left cursor-pointer min-h-[44px]"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6353] block font-bold">
                      EXHIBIT A — EVIDENCE ATTACHMENTS
                    </span>
                    <h3 className="text-sm font-serif font-bold text-[#22201B] uppercase tracking-wider flex items-center gap-2 mt-0.5">
                      PRIMARY WEB SOURCES ({state.research.sources.length})
                    </h3>
                  </div>
                  <span className="text-xs text-[#22201B] font-mono font-bold sm:hidden">
                    {sourcesOpen ? 'COLLAPSE ▲' : 'EXPAND ▾'}
                  </span>
                </button>

                <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${sourcesOpen ? 'block' : 'hidden sm:grid'}`}>
                  {state.research.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-[#EDE4D3] border border-[#22201B] hover:bg-[#EDE4D3]/80 transition-all group block min-h-[44px] shadow-[2px_2px_0px_#22201B]"
                    >
                      <span className="text-xs font-mono font-bold text-[#22201B] group-hover:underline block truncate mb-1">
                        [{i + 1}] {src.title || 'Web Source'}
                      </span>
                      <span className="text-[10px] font-mono text-[#6B6353] block truncate">
                        {src.url}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Reset Button */}
            <div className="text-center py-6">
              <button
                onClick={resetSession}
                className="min-h-[44px] px-8 py-3.5 bg-[#22201B] hover:bg-[#38352e] active:bg-[#151411] text-[#EDE4D3] font-mono font-bold uppercase tracking-wider shadow-[4px_4px_0px_#6B6353] transition-all cursor-pointer text-sm border-2 border-[#22201B]"
              >
                EVALUATE ANOTHER DOSSIER →
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
