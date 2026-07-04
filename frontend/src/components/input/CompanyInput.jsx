import React, { useState } from 'react';

const EXAMPLE_COMPANIES = [
  { name: 'Tesla', subtitle: 'EV & Physical AI' },
  { name: 'Zomato', subtitle: 'Food Delivery & Quick Commerce' },
  { name: 'Paytm', subtitle: 'Fintech & Digital Payments' },
  { name: 'Stripe', subtitle: 'Global Payment Infrastructure' },
];

/**
 * CompanyInput component — boardroom hero input with clean serif title text.
 * Uses exact brand palette: ink (#12181B), parchment (#F6F1E7), brass (#B8860B), slate (#4A5A63).
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
    <div className="w-full max-w-4xl mx-auto text-center py-8 sm:py-16 px-4">
      
      {/* Boardroom Header Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B8860B]/10 border border-[#B8860B]/30 text-[#B8860B] text-xs font-semibold uppercase tracking-widest mb-6">
        <span className="w-2 h-2 rounded-full bg-[#B8860B] animate-pulse"></span>
        Multi-Agent Investment Committee
      </div>

      {/* Main Title - Serif Display */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-[#F6F1E7] mb-4 leading-tight">
        The Deal Desk
      </h1>

      {/* Tagline */}
      <p className="text-base sm:text-lg text-[#F6F1E7]/70 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-sans">
        Simulate a Wall Street Investment Committee review. Enter any company to run real-time market research, thesis drafting, parallel Bull vs. Bear debate, risk audit, and deterministic conviction verdict.
      </p>

      {/* Input Form with 44px+ min tap target on mobile */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center max-w-2xl mx-auto shadow-2xl rounded-2xl bg-[#12181B] border border-[#4A5A63]/60 p-2 sm:p-2.5 focus-within:border-[#B8860B] transition-all duration-300 gap-2 sm:gap-0">
          <div className="flex items-center flex-1 px-3">
            <svg
              className="w-5 h-5 text-[#4A5A63] shrink-0"
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
              placeholder="Enter company name (e.g. Tesla, Stripe)..."
              disabled={isLoading}
              className="w-full bg-transparent px-3 py-3 text-[#F6F1E7] placeholder-[#4A5A63] focus:outline-none text-base font-sans min-h-[44px]"
            />
          </div>
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-[#B8860B] hover:bg-[#966d09] active:bg-[#7a5807] disabled:opacity-50 text-[#12181B] font-bold rounded-xl transition-all duration-200 shrink-0 shadow-lg shadow-[#B8860B]/20 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base uppercase tracking-wider"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-[#12181B]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              'Convene Committee →'
            )}
          </button>
        </div>
      </form>

      {/* Example Chips with 44px min tap targets */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        <span className="text-xs font-semibold text-[#4A5A63] uppercase tracking-wider w-full sm:w-auto mb-1 sm:mb-0">
          Try evaluating:
        </span>
        {EXAMPLE_COMPANIES.map((company) => (
          <button
            key={company.name}
            type="button"
            onClick={() => handleChipClick(company.name)}
            disabled={isLoading}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#12181B] hover:bg-[#1f292d] active:bg-[#2a373d] border border-[#4A5A63]/50 text-xs font-medium text-[#F6F1E7] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md"
          >
            <span className="font-bold text-[#B8860B]">{company.name}</span>
            <span className="text-[#4A5A63] text-[11px] hidden md:inline">{company.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
