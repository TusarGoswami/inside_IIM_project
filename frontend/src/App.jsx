import React, { useState, useEffect, useRef } from 'react';
import logoSvg from './assets/logo.svg';
import { useResearchSession } from './hooks/useResearchSession.js';
import { fetchHistoryRun } from './api/researchClient.js';
import { STAGES } from './types/research.js';
import { CompanyInput } from './components/input/CompanyInput.jsx';
import { ProgressStepper } from './components/progress/ProgressStepper.jsx';
import { VerdictCard } from './components/verdict/VerdictCard.jsx';
import { ScoreBreakdownChart } from './components/verdict/ScoreBreakdownChart.jsx';
import { DebatePanel } from './components/debate/DebatePanel.jsx';
import { RiskFlags } from './components/risk/RiskFlags.jsx';
import { MemoPanel } from './components/memo/MemoPanel.jsx';
import { HistoryPanel } from './components/history/HistoryPanel.jsx';
import { ResearchPanel } from './components/research/ResearchPanel.jsx';

/** Scrolls into view when first mounted — used to auto-scroll to new live panels. */
function ScrollIntoView({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  return <div ref={ref}>{children}</div>;
}

export default function App() {
  const { stage, partialState, finalState, error, startSession, resetSession } = useResearchSession();
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  // History view state
  const [showHistory, setShowHistory] = useState(false);
  const [historyState, setHistoryState] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const state = historyState || finalState || partialState || {};
  const isRunning = !historyState && stage !== STAGES.IDLE && stage !== STAGES.COMPLETED && stage !== STAGES.ERROR;
  const isCompleted = historyState || (stage === STAGES.COMPLETED && Boolean(finalState || state.verdict));

  const isRateLimitError = error?.includes('rate limit') || error?.includes('429') || error?.includes('Quota');

  /** Load a past run from history into the result view */
  const handleLoadHistoryRun = async (id) => {
    setHistoryLoading(true);
    try {
      const result = await fetchHistoryRun(id);
      setHistoryState(result);
      setShowHistory(false);
    } catch (err) {
      console.error('Failed to load history run:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  /** Return to input screen, clearing any loaded history */
  const handleBackToInput = () => {
    setShowHistory(false);
    setHistoryState(null);
    setSourcesOpen(false);
    resetSession();
  };

  return (
    <div className="min-h-screen bg-[#EDE4D3] text-[#22201B] font-sans selection:bg-[#D9CBA8] selection:text-[#22201B] border-t-4 border-[#22201B]">
      {/* Top Header - Classified Investment Dossier Header */}
      <header className="border-b-2 border-[#22201B] bg-[#D9CBA8] sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleBackToInput}>
            <img
              src={logoSvg}
              alt="The Deal Desk Stamp Logo"
              className="w-10 h-10 object-contain shrink-0"
            />
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
        
        {/* History Loading Overlay */}
        {historyLoading && (
          <div className="w-full max-w-xl mx-auto text-center py-16 animate-fade-in">
            <span className="text-sm font-mono text-[#6B6353] animate-pulse">LOADING ARCHIVED DOSSIER...</span>
          </div>
        )}

        {/* VIEW: History List */}
        {showHistory && !historyLoading && (
          <HistoryPanel
            onLoadRun={handleLoadHistoryRun}
            onBack={() => setShowHistory(false)}
          />
        )}

        {/* VIEW 1: Input View */}
        {!showHistory && !historyLoading && stage === STAGES.IDLE && !historyState && (
          <>
            <CompanyInput onSubmit={startSession} isLoading={false} />
            {/* History Link */}
            <div className="text-center mt-4">
              <button
                onClick={() => setShowHistory(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D9CBA8] hover:bg-[#c9bb98] border-2 border-[#22201B] text-[#22201B] font-mono text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_#22201B] hover:shadow-[4px_4px_0px_#22201B] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                VIEW PAST DOSSIERS
              </button>
            </div>
          </>
        )}

        {/* VIEW 2: Live Progress Session View */}
        {!showHistory && !historyLoading && isRunning && (
          <div className="space-y-6">
            {/* Cancel Bar */}
            <div className="flex items-center justify-between bg-[#EDE4D3] border-2 border-[#22201B] px-4 py-2.5 shadow-[3px_3px_0px_#22201B]">
              <span className="text-xs font-mono font-bold text-[#22201B] uppercase tracking-wider">
                ANALYZING: {state.companyName?.toUpperCase() || '...'}
              </span>
              <button
                onClick={handleBackToInput}
                className="min-h-[36px] px-4 py-1.5 bg-[#8B2E2E] hover:bg-[#a33737] active:bg-[#722525] text-[#EDE4D3] font-mono text-xs font-bold uppercase tracking-wider border-2 border-[#22201B] shadow-[2px_2px_0px_#22201B] transition-all cursor-pointer"
              >
                ✕ CANCEL INVESTIGATION
              </button>
            </div>

            <ProgressStepper
              stage={stage}
              reasoningTrail={state.reasoningTrail || []}
              error={error}
              companyName={state.companyName}
            />

            {/* Render partial panels immediately as backend streams each stage */}
            {state.research && (
              <ScrollIntoView>
                <ResearchPanel research={state.research} companyName={state.companyName} />
              </ScrollIntoView>
            )}

            {state.memo && (
              <ScrollIntoView>
                <MemoPanel memo={state.memo} companyName={state.companyName} />
              </ScrollIntoView>
            )}

            {(state.bullCase || state.bearCase) && (
              <ScrollIntoView>
                <DebatePanel
                  bullCase={state.bullCase}
                  bearCase={state.bearCase}
                  rebuttalOccurred={state.rebuttalOccurred}
                  rebuttal={state.rebuttal}
                />
              </ScrollIntoView>
            )}

            {state.riskFlags && state.riskFlags.length > 0 && (
              <ScrollIntoView>
                <RiskFlags riskFlags={state.riskFlags} />
              </ScrollIntoView>
            )}
          </div>
        )}

        {/* Error State - Red Stamped Rejection Box */}
        {!showHistory && !historyLoading && stage === STAGES.ERROR && !historyState && (
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
              onClick={handleBackToInput}
              className="min-h-[44px] px-8 py-3 bg-[#8B2E2E] hover:bg-[#a33737] active:bg-[#722525] text-[#EDE4D3] font-mono font-bold uppercase tracking-wider text-xs sm:text-sm border-2 border-[#22201B] shadow-[3px_3px_0px_#22201B] transition-all cursor-pointer"
            >
              RE-INITIATE DOSSIER →
            </button>
          </div>
        )}

        {/* VIEW 3: Final IC Result View (also used for loaded history) */}
        {!showHistory && !historyLoading && isCompleted && (
          <div className="space-y-8 animate-fade-in">

            {/* Archived Record Banner (only for history-loaded results) */}
            {historyState && (
              <div className="bg-[#EDE4D3] border-2 border-[#6B6353] p-3 text-center shadow-[3px_3px_0px_#6B6353]">
                <span className="text-[11px] font-mono font-bold text-[#6B6353] uppercase tracking-widest">
                  📂 ARCHIVED RECORD — LOADED FROM HISTORY
                </span>
              </div>
            )}
            
            {/* Top Verdict Card */}
            <VerdictCard
              verdict={state.verdict}
              conviction={state.conviction}
              thesisSummary={state.thesisSummary}
              companyName={state.companyName}
              onReset={handleBackToInput}
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
                onClick={handleBackToInput}
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

