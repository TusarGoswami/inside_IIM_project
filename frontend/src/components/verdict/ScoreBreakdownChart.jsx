import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

/**
 * ScoreBreakdownChart component — Horizontal Bar Chart with Dossier Manila & Ink theme.
 *
 * @param {{ scores: import('../../types/research.js').ScoreBreakdown }} props
 */
export function ScoreBreakdownChart({ scores }) {
  if (!scores) return null;

  const data = [
    {
      name: 'Market Position (25%)',
      score: scores.marketPosition ?? 0,
      color: '#A9772E', // stamp amber
    },
    {
      name: 'Financial Health (25%)',
      score: scores.financialHealth ?? 0,
      color: '#3E6B4F', // stamp green
    },
    {
      name: 'Growth Trajectory (20%)',
      score: scores.growthTrajectory ?? 0,
      color: '#A9772E', // stamp amber
    },
    {
      name: 'Bear-Adjusted (15%)',
      score: scores.bearAdjustedConviction ?? 0,
      color: '#3E6B4F', // stamp green
    },
    {
      name: 'Source Quality (10%)',
      score: scores.sourceQuality ?? 0,
      color: '#22201B', // ink
    },
    {
      name: 'Risk Penalty',
      score: scores.riskPenalty ? -Math.abs(scores.riskPenalty) : 0,
      color: '#8B2E2E', // stamp red
    },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-[#D9CBA8] border-2 border-[#22201B] p-4 sm:p-6 shadow-[6px_6px_0px_#22201B] mb-8 staple-clip">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-[#22201B]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6353] block font-bold">
            EXHIBIT D — WEIGHTED SCORE CALCULATION
          </span>
          <h3 className="text-base font-serif font-bold text-[#22201B] flex items-center gap-2 mt-0.5">
            COMMITTEE DIMENSION BREAKDOWN
          </h3>
          <p className="text-xs text-[#6B6353] font-sans">
            Weighted dimension scores (0-100) & risk penalty subtraction
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[#22201B] font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#3E6B4F] border border-[#22201B]"></span> DIMENSION
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#8B2E2E] border border-[#22201B]"></span> PENALTY
          </span>
        </div>
      </div>

      <div className="w-full h-72 sm:h-80 bg-[#EDE4D3] border-2 border-[#22201B] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 25, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#6B6353" opacity={0.3} horizontal={false} />
            <XAxis
              type="number"
              domain={[-25, 100]}
              stroke="#22201B"
              tick={{ fill: '#22201B', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#22201B"
              tick={{ fill: '#22201B', fontSize: 11, fontWeight: 600, fontFamily: 'IBM Plex Mono' }}
              width={140}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const val = item.score;
                  return (
                    <div className="bg-[#EDE4D3] border-2 border-[#22201B] p-2.5 shadow-[3px_3px_0px_#22201B] text-xs font-mono text-[#22201B]">
                      <p className="font-serif font-bold text-[#22201B] mb-1">{item.name}</p>
                      <p className={val < 0 ? 'text-[#8B2E2E] font-bold' : 'text-[#3E6B4F] font-bold'}>
                        {val < 0 ? `Penalty: ${val}` : `Score: ${val} / 100`}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={0} stroke="#22201B" strokeWidth={1.5} />
            <Bar dataKey="score" radius={[0, 0, 0, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#22201B" strokeWidth={1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
