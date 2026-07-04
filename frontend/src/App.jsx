import React from 'react';
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

  const state = finalState || partialState || {};
  const isRunning = stage !== STAGES.IDLE && stage !== STAGES.COMPLETED && stage !== STAGES.ERROR;
  const isCompleted = stage === STAGES.COMPLETED && Boolean(finalState || state.verdict);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetSession}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              DD
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight block leading-none">
                The Deal Desk
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mt-0.5">
                AI Investment Committee Simulator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Gemini 2.5 + Tavily + LangGraph
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
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

        {/* Error State */}
        {stage === STAGES.ERROR && (
          <div className="w-full max-w-2xl mx-auto bg-rose-950/20 border border-rose-500/40 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✕
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Research Session Failed</h2>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {error || 'An unexpected error occurred during execution.'}
            </p>
            <button
              onClick={resetSession}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* VIEW 3: Final IC Result View */}
        {isCompleted && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Sticky Top Verdict Card */}
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

            {/* Research Sources Footer List */}
            {state.research?.sources?.length > 0 && (
              <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  🔗 Primary Web Sources ({state.research.sources.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {state.research.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all group block"
                    >
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-blue-400 block truncate mb-1">
                        {src.title || 'Web Source'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block truncate">
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
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-xl shadow-blue-500/20 transition-all cursor-pointer"
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
