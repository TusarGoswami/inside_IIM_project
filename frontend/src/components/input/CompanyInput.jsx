import React, { useState } from 'react';

const EXAMPLE_COMPANIES = [
  { name: 'Tesla', subtitle: 'EV & Physical AI' },
  { name: 'Zomato', subtitle: 'Food Delivery & Quick Commerce' },
  { name: 'Paytm', subtitle: 'Fintech & Digital Payments' },
  { name: 'Stripe', subtitle: 'Global Payment Infrastructure' },
];

/**
 * CompanyInput component — Classified Case File Requisition Form (Form 10-IC).
 * Aesthetic: Warm Manila paper, kraft borders, typewriter mono text, rubber stamp submit.
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
    <div className="w-full max-w-[1200px] mx-auto text-center py-6 sm:py-12 px-4 animate-fade-in">
      
      {/* Dossier Card Container - Manila paper folder look */}
      <div className="bg-[#D9CBA8] border-2 border-[#22201B] p-6 sm:p-10 shadow-[8px_8px_0px_#22201B] relative text-left staple-clip">
        
        {/* Top Confidential Stamp */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#22201B] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 border-2 border-[#8B2E2E] text-[#8B2E2E] font-mono font-bold text-[11px] tracking-widest uppercase rotate-[-1deg]">
              CLASSIFIED // RESTRICTED ACCESS
            </span>
            <span className="text-xs font-mono text-[#6B6353] font-bold hidden sm:inline">
              REF: IC-REQ-2026
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-[#22201B] bg-[#EDE4D3] px-3 py-1 border border-[#22201B]">
            FORM 10-IC
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#22201B] tracking-tight mb-3">
          Investment Committee Dossier System
        </h1>

        {/* Description / Subtitle */}
        <p className="text-xs sm:text-sm text-[#22201B]/80 font-sans leading-relaxed mb-8 max-w-2xl">
          Simulate a Wall Street Investment Committee review. Enter any target corporation to execute live web research, IC memo drafting, parallel Bull vs. Bear debate, due diligence risk audit, and deterministic conviction calculation.
        </p>

        {/* Input Form Box */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-[#EDE4D3] border-2 border-[#22201B] p-3 sm:p-4 shadow-[4px_4px_0px_#22201B]">
            <label className="block text-[11px] font-mono uppercase font-bold text-[#6B6353] mb-2 tracking-wider">
              TARGET ENTITY IDENTIFIER:
            </label>
            
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="ENTER ENTITY NAME (E.G. TESLA, STRIPE, ZOMATO)..."
                disabled={isLoading}
                className="w-full bg-[#EDE4D3] border-2 border-[#22201B] px-4 py-3 text-[#22201B] placeholder-[#6B6353] focus:outline-none focus:bg-white text-sm font-mono font-bold min-h-[44px]"
              />
              
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="min-h-[44px] px-6 py-3 bg-[#22201B] hover:bg-[#38352e] active:bg-[#151411] disabled:opacity-50 text-[#EDE4D3] font-mono font-bold border-2 border-[#22201B] transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider shadow-[2px_2px_0px_#6B6353]"
              >
                {isLoading ? (
                  <span>INITIATING DOSSIER...</span>
                ) : (
                  <span>INITIATE INVESTIGATION →</span>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Example Case Chips */}
        <div>
          <span className="text-[11px] font-mono font-bold uppercase text-[#6B6353] block mb-2 tracking-wider">
            PRE-INDEXED CASE DOSSIERS:
          </span>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {EXAMPLE_COMPANIES.map((company) => (
              <button
                key={company.name}
                type="button"
                onClick={() => handleChipClick(company.name)}
                disabled={isLoading}
                className="min-h-[44px] px-3.5 py-2 bg-[#EDE4D3] hover:bg-white active:bg-[#EDE4D3] border border-[#22201B] text-xs font-mono text-[#22201B] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-[2px_2px_0px_#22201B]"
              >
                <span className="font-bold">[{company.name}]</span>
                <span className="text-[10px] text-[#6B6353] hidden sm:inline">{company.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
