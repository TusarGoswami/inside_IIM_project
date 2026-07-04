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
 * ScoreBreakdownChart component — renders horizontal bar chart of the 5 weighted dimensions
 * plus the negative risk penalty bar.
 *
 * @param {{ scores: import('../../types/research.js').ScoreBreakdown }} props
 */
export function ScoreBreakdownChart({ scores }) {
  if (!scores) return null;

  const data = [
    {
      name: 'Market Position (25%)',
      score: scores.marketPosition ?? 0,
      color: '#3b82f6', // blue
    },
    {
      name: 'Financial Health (25%)',
      score: scores.financialHealth ?? 0,
      color: '#10b981', // emerald
    },
    {
      name: 'Growth Trajectory (20%)',
      score: scores.growthTrajectory ?? 0,
      color: '#8b5cf6', // purple
    },
    {
      name: 'Bear-Adjusted (15%)',
      score: scores.bearAdjustedConviction ?? 0,
      color: '#06b6d4', // cyan
    },
    {
      name: 'Source Quality (10%)',
      score: scores.sourceQuality ?? 0,
      color: '#64748b', // slate
    },
    {
      name: 'Risk Penalty',
      score: scores.riskPenalty ? -Math.abs(scores.riskPenalty) : 0,
      color: '#f43f5e', // rose negative bar
    },
  ];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            📊 Committee Score Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Weighted dimension scores (0-100) & risk penalty subtraction
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Positive Dimension
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Risk Penalty
          </span>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 30, left: 140, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis
              type="number"
              domain={[-25, 100]}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#64748b"
              tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }}
              width={140}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const val = item.score;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                      <p className="font-semibold text-white mb-1">{item.name}</p>
                      <p className={val < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {val < 0 ? `Penalty: ${val}` : `Score: ${val} / 100`}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} />
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
