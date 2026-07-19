'use client';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface DataPoint {
  date: string;
  appearance?: number;
  voice?: number;
  social?: number;
}

interface Props {
  data: DataPoint[];
}

export function ProgressChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No data yet — complete some sessions to see your progress
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#94a3b8' }}
          itemStyle={{ color: '#e2e8f0' }}
        />
        <Line type="monotone" dataKey="appearance" stroke="#8b5cf6" strokeWidth={2}
          dot={{ fill: '#8b5cf6', r: 4 }} name="Appearance" connectNulls />
        <Line type="monotone" dataKey="voice" stroke="#38bdf8" strokeWidth={2}
          dot={{ fill: '#38bdf8', r: 4 }} name="Voice" connectNulls />
        <Line type="monotone" dataKey="social" stroke="#f472b6" strokeWidth={2}
          dot={{ fill: '#f472b6', r: 4 }} name="Social IQ" connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
