import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { api } from '../api/client';
import Loading from '../components/Loading';
import SeverityBadge from '../components/SeverityBadge';

const COLORS = ['#06b6d4', '#8b5cf6', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];

export default function ThreatTrends() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.trends().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="panel p-6 text-red-400">{error}</div>;
  if (!data) return <Loading text="Computing threat trend analytics..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-citadel-accent" />
          Threat Trends Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">30-day vulnerability trends from live NVD data</p>
      </header>

      <div className="panel">
        <div className="panel-header">
          <h2 className="font-semibold">CVE Publication Timeline</h2>
        </div>
        <div className="p-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.timeline || []}>
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
              <Line type="monotone" dataKey="count" stroke="#06b6d4" name="Total" strokeWidth={2} />
              <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Critical" strokeWidth={2} />
              <Line type="monotone" dataKey="high" stroke="#f97316" name="High" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel">
          <div className="panel-header">
            <h2 className="font-semibold">Attack Vector Distribution</h2>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.attackVectorDist || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(data.attackVectorDist || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="font-semibold">CVSS Score Distribution</h2>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cvssDistribution || []}>
                <XAxis dataKey="range" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="font-semibold">Threat Intelligence Insights</h2>
        </div>
        <div className="p-5 space-y-2">
          {(data.insights || []).map((insight, i) => (
            <p key={i} className="text-sm text-gray-400 border-l-2 border-citadel-accent pl-3">
              {insight}
            </p>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel">
          <div className="panel-header">
            <h2 className="font-semibold">Most Severe Vulnerabilities</h2>
          </div>
          <div className="divide-y divide-citadel-700/30 max-h-96 overflow-y-auto">
            {(data.mostSevere || []).map((cve) => (
              <div key={cve.id} className="px-5 py-3">
                <div className="flex justify-between">
                  <span className="font-mono text-citadel-accent text-sm">{cve.id}</span>
                  <SeverityBadge severity={cve.severity} />
                </div>
                <p className="text-xs text-gray-500 mt-1">CVSS {cve.score}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="font-semibold">Trending Categories</h2>
          </div>
          <div className="p-4 space-y-2">
            {(data.trendingCategories || []).map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div
                  className="h-2 bg-citadel-accent rounded"
                  style={{ width: `${Math.min(100, cat.count * 8)}%`, minWidth: 4 }}
                />
                <span className="text-xs font-mono text-gray-400 flex-1 truncate">{cat.name}</span>
                <span className="text-citadel-accent text-sm font-semibold">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
