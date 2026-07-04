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
 * ScoreBreakdownChart component — horizontal bar chart using strict boardroom 5-color palette:
 * - Ink (#12181B)
 * - Parchment (#F6F1E7)
 * - Brass (#B8860B)
 * - Ledger-Green (#2F6F4E)
 * - Claret (#7A2E2E)
 * - Slate (#4A5A63)
 *
 * Fixed: Single YAxis component to prevent text overlap artifact.
 *
 * @param {{ scores: import('../../types/research.js').ScoreBreakdown }} props
 */
export function ScoreBreakdownChart({ scores }) {
  if (!scores) return null;

  const data = [
    {
      name: 'Market Position (25%)',
      score: scores.marketPosition ?? 0,
      color: '#B8860B', // brass
    },
    {
      name: 'Financial Health (25%)',
      score: scores.financialHealth ?? 0,
      color: '#2F6F4E', // ledger-green
    },
    {
      name: 'Growth Trajectory (20%)',
      score: scores.growthTrajectory ?? 0,
      color: '#B8860B', // brass
    },
    {
      name: 'Bear-Adjusted (15%)',
      score: scores.bearAdjustedConviction ?? 0,
      color: '#2F6F4E', // ledger-green
    },
    {
      name: 'Source Quality (10%)',
      score: scores.sourceQuality ?? 0,
      color: '#4A5A63', // slate
    },
    {
      name: 'Risk Penalty',
      score: scores.riskPenalty ? -Math.abs(scores.riskPenalty) : 0,
      color: '#7A2E2E', // claret negative bar
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#12181B] border border-[#4A5A63]/60 rounded-2xl p-4 sm:p-6 shadow-2xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#4A5A63]/40">
        <div>
          <h3 className="text-base font-serif font-bold text-[#F6F1E7] flex items-center gap-2">
            📊 Committee Score Breakdown
          </h3>
          <p className="text-xs text-[#4A5A63] mt-0.5 font-sans">
            Weighted dimension scores (0-100) & risk penalty subtraction
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[#4A5A63]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8860B]"></span> Dimension Score
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7A2E2E]"></span> Risk Penalty
          </span>
        </div>
      </div>

      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 25, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5A63" opacity={0.3} horizontal={false} />
            <XAxis
              type="number"
              domain={[-25, 100]}
              stroke="#4A5A63"
              tick={{ fill: '#4A5A63', fontSize: 11 }}
            />
            {/* Single YAxis to guarantee no label overlapping */}
            <YAxis
              type="category"
              dataKey="name"
              stroke="#4A5A63"
              tick={{ fill: '#F6F1E7', fontSize: 11, fontWeight: 500 }}
              width={140}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const val = item.score;
                  return (
                    <div className="bg-[#12181B] border border-[#4A5A63] p-2.5 rounded-xl shadow-xl text-xs font-mono text-[#F6F1E7]">
                      <p className="font-serif font-bold text-[#F6F1E7] mb-1">{item.name}</p>
                      <p className={val < 0 ? 'text-[#7A2E2E] font-bold' : 'text-[#B8860B] font-bold'}>
                        {val < 0 ? `Penalty: ${val}` : `Score: ${val} / 100`}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={0} stroke="#4A5A63" strokeWidth={1.5} />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={22}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
