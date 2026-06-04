import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { AlertTriangle, ShieldAlert, Activity, Zap } from 'lucide-react';
import { api } from '../api/client';
import Loading from '../components/Loading';
import SeverityBadge from '../components/SeverityBadge';
import { formatDate } from '../utils/severity';

const SEV_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
  UNKNOWN: '#6b7280',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="panel p-8 text-center text-red-400">
        Failed to load dashboard: {error}
      </div>
    );
  }

  if (!data) return <Loading text="Fetching live NVD threat intelligence..." />;

  const severityData = Object.entries(data.severityDist || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const vectorData = Object.entries(data.attackVectors || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  const scoreData = Object.entries(data.scoreBuckets || {}).map(([range, count]) => ({
    range,
    count,
  }));

  const stats = [
    { label: 'Monitored CVEs', value: data.statistics?.total, icon: Activity, color: 'text-citadel-accent' },
    { label: 'Critical', value: data.statistics?.criticalCount, icon: ShieldAlert, color: 'text-red-400' },
    { label: 'High Severity', value: data.statistics?.highCount, icon: AlertTriangle, color: 'text-orange-400' },
    { label: 'Avg CVSS', value: data.statistics?.avgScore?.toFixed(1), icon: Zap, color: 'text-citadel-purple' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-white">Threat Intelligence Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Live vulnerability intelligence • 14-day NVD monitoring window
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-2xl font-bold text-white font-sans">{value ?? 0}</span>
            </div>
            <p className="text-gray-500 text-xs mt-2 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="panel lg:col-span-2">
          <div className="panel-header">
            <h2 className="font-semibold text-white">Severity Distribution</h2>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {severityData.map((e) => (
                    <Cell key={e.name} fill={SEV_COLORS[e.name] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="font-semibold text-white">CVSS Distribution</h2>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {scoreData.map((_, i) => (
                    <Cell key={i} fill={['#22c55e', '#eab308', '#f97316', '#ef4444', '#6b7280'][i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel">
          <div className="panel-header">
            <h2 className="font-semibold text-white">Attack Vector Distribution</h2>
          </div>
          <div className="p-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vectorData}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
                <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="font-semibold text-white">Trending CWE Categories</h2>
          </div>
          <div className="p-4 space-y-2 max-h-56 overflow-y-auto">
            {(data.trendingCategories || []).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-mono text-xs truncate flex-1">{cat.name}</span>
                <span className="text-citadel-accent font-semibold ml-2">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="font-semibold text-white">Security Insights</h2>
        </div>
        <div className="p-5 space-y-3">
          {(data.insights || []).map((insight, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-lg bg-citadel-accent/5 border border-citadel-accent/10 text-sm text-gray-300"
            >
              <Zap className="w-4 h-4 text-citadel-accent shrink-0 mt-0.5" />
              {insight}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <CveList title="Critical Vulnerabilities" items={data.critical} />
        <CveList title="High Severity" items={data.high} />
      </div>

      <CveList title="Latest CVEs" items={data.latest} full />
    </div>
  );
}

function CveList({ title, items, full }) {
  return (
    <div className="panel animate-slide-up">
      <div className="panel-header">
        <h2 className="font-semibold text-white">{title}</h2>
      </div>
      <div className={`divide-y divide-citadel-700/30 ${full ? '' : 'max-h-80 overflow-y-auto'}`}>
        {(items || []).map((cve) => (
          <div key={cve.id} className="px-5 py-3 hover:bg-citadel-800/30 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <Link to={`/cve?id=${encodeURIComponent(cve.id)}`} className="font-mono text-citadel-accent text-sm hover:underline">
                {cve.id}
              </Link>
              <SeverityBadge severity={cve.severity} />
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cve.description}</p>
            <div className="flex gap-3 mt-1 text-[10px] text-gray-600">
              <span>CVSS: {cve.score ?? 'N/A'}</span>
              <span>{formatDate(cve.published)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
