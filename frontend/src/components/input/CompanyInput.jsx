import React, { useState } from 'react';

const EXAMPLE_COMPANIES = [
  { name: 'Tesla', subtitle: 'EV & Physical AI' },
  { name: 'Zomato', subtitle: 'Food Delivery & Quick Commerce' },
  { name: 'Paytm', subtitle: 'Fintech & Digital Payments' },
  { name: 'Stripe', subtitle: 'Global Payment Infrastructure' },
];

/**
 * CompanyInput component — hero input section with example company chips.
 *
 * @param {{ onSubmit: (companyName: string) => void, isLoading: boolean }} props
 */
export function CompanyInput({ onSubmit, isLoading }) {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim() && !isLoading) {
      onSubmit(inputVal.trim());
    }
  };

  const handleChipClick = (name) => {
    if (!isLoading) {
      setInputVal(name);
      onSubmit(name);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-center py-12 px-4">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
        Multi-Agent AI Investment Committee
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
        The Deal Desk
      </h1>
      <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
        Simulate a full Wall Street investment committee review. Enter any company to run real-time web research, structured thesis memo, parallel Bull vs. Bear debate, risk audit, and deterministic conviction verdict.
      </p>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative flex items-center max-w-2xl mx-auto shadow-2xl rounded-2xl bg-slate-900/90 border border-slate-700/60 p-2 focus-within:border-blue-500 transition-all duration-300">
          <svg
            className="w-6 h-6 text-slate-400 ml-3 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter company name (e.g. Tesla, Zomato, Stripe)..."
            disabled={isLoading}
            className="w-full bg-transparent px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none text-base sm:text-lg"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all duration-200 shrink-0 shadow-lg shadow-blue-500/25 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Convene Committee →'
            )}
          </button>
        </div>
      </form>

      {/* Example Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
          Try evaluating:
        </span>
        {EXAMPLE_COMPANIES.map((company) => (
          <button
            key={company.name}
            type="button"
            onClick={() => handleChipClick(company.name)}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <span className="font-semibold text-blue-400">{company.name}</span>
            <span className="text-slate-500 ml-1.5 text-[10px] hidden sm:inline">{company.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
