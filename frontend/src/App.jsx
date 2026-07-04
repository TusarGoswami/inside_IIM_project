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
    <div className="min-h-screen bg-[#12181B] text-[#F6F1E7] font-sans selection:bg-[#B8860B] selection:text-[#12181B]">
      {/* Top Navbar */}
      <header className="border-b border-[#4A5A63]/40 bg-[#12181B]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetSession}>
            <img
              src="/logo.jpg"
              alt="The Deal Desk Logo"
              className="w-10 h-10 rounded-full border border-[#B8860B]/60 shadow-md object-cover bg-[#F6F1E7]"
            />
            <div>
              <span className="font-serif font-bold text-lg text-[#F6F1E7] tracking-tight block leading-none">
                The Deal Desk
              </span>
              <span className="text-[10px] font-mono text-[#4A5A63] uppercase tracking-widest block mt-0.5">
                AI Investment Committee Simulator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12181B] border border-[#4A5A63]/60 text-xs font-mono text-[#B8860B]">
              <span className="w-2 h-2 rounded-full bg-[#2F6F4E]"></span>
              Gemini + LangGraph Engine
            </span>
          </div>
        </div>
      </header>

      {/* Main Container - max-w-6xl so it doesn't stretch edge-to-edge on 1440px+ displays */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
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

        {/* Error State - Responsive & Clean */}
        {stage === STAGES.ERROR && (
          <div className="w-full max-w-xl mx-auto bg-[#241818] border border-[#7A2E2E] rounded-2xl p-5 sm:p-8 text-center shadow-2xl animate-fade-in my-6">
            <div className="w-12 h-12 rounded-full bg-[#7A2E2E]/30 text-[#F6F1E7] flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-[#7A2E2E]">
              ✕
            </div>
            
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F6F1E7] mb-2">
              {isRateLimitError ? 'API Rate Limit Reached' : 'Research Session Failed'}
            </h2>
            
            <p className="text-xs sm:text-sm text-[#F6F1E7]/90 mb-5 leading-relaxed font-sans max-w-md mx-auto">
              {isRateLimitError
                ? 'The Gemini API free-tier rate limit window was temporarily reached. Please wait 15–20 seconds for the quota window to reset, then click Try Again.'
                : 'An error occurred during committee agent execution.'}
            </p>

            {/* Technical Details Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setShowTechDetails(!showTechDetails)}
                className="text-[11px] font-mono text-[#4A5A63] hover:text-[#F6F1E7] underline transition-colors cursor-pointer"
              >
                {showTechDetails ? 'Hide Details ▲' : 'Show Technical Error Details ▾'}
              </button>

              {showTechDetails && (
                <div className="mt-3 p-3 bg-[#12181B] border border-[#4A5A63]/50 rounded-xl text-left text-[11px] font-mono text-[#F6F1E7]/80 break-all max-h-40 overflow-y-auto">
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={resetSession}
              className="min-h-[44px] px-8 py-3 bg-[#7A2E2E] hover:bg-[#913737] active:bg-[#612424] text-[#F6F1E7] font-bold uppercase tracking-wider rounded-xl text-xs sm:text-sm transition-all shadow-lg cursor-pointer"
            >
              Try Again →
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
              <div className="w-full max-w-4xl mx-auto bg-[#12181B] border border-[#4A5A63]/60 rounded-2xl p-4 sm:p-6 shadow-2xl">
                <button
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="w-full flex items-center justify-between text-left cursor-pointer sm:cursor-default min-h-[44px]"
                >
                  <h3 className="text-sm font-serif font-bold text-[#F6F1E7] uppercase tracking-wider flex items-center gap-2">
                    🔗 Primary Web Sources ({state.research.sources.length})
                  </h3>
                  <span className="text-xs text-[#4A5A63] font-mono sm:hidden">
                    {sourcesOpen ? 'Collapse ▲' : 'Expand ▾'}
                  </span>
                </button>

                <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${sourcesOpen ? 'block' : 'hidden sm:grid'}`}>
                  {state.research.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-[#12181B] border border-[#4A5A63]/40 hover:border-[#B8860B] transition-all group block min-h-[44px]"
                    >
                      <span className="text-xs font-semibold text-[#F6F1E7] group-hover:text-[#B8860B] block truncate mb-1">
                        {src.title || 'Web Source'}
                      </span>
                      <span className="text-[10px] font-mono text-[#4A5A63] block truncate">
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
                className="min-h-[44px] px-8 py-3.5 bg-[#B8860B] hover:bg-[#966d09] active:bg-[#7a5807] text-[#12181B] font-bold uppercase tracking-wider rounded-xl shadow-xl shadow-[#B8860B]/20 transition-all cursor-pointer text-sm"
              >
                Evaluate Another Company →
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
