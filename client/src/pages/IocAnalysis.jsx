import { useState } from 'react';
import { Fingerprint, Scan } from 'lucide-react';
import { api } from '../api/client';
import MarkdownView from '../components/MarkdownView';
import Loading from '../components/Loading';

const EXAMPLES = [
  { label: 'IP', value: '192.0.2.1' },
  { label: 'Domain', value: 'malicious-example.xyz' },
  { label: 'URL', value: 'https://evil.example/login' },
  { label: 'SHA256', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
];

export default function IocAnalysis() {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function analyze(e) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.ioc.analyze({ value: value.trim() });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const riskColors = {
    CRITICAL: 'text-red-400',
    HIGH: 'text-orange-400',
    MEDIUM: 'text-yellow-400',
    LOW: 'text-green-400',
    INFO: 'text-gray-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Fingerprint className="w-7 h-7 text-citadel-accent" />
          IOC Analysis Center
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Analyze IPs, domains, URLs, and file hashes with heuristic + AI assessment
        </p>
      </header>

      <div className="panel p-5">
        <form onSubmit={analyze} className="space-y-4">
          <input
            className="input-field font-mono"
            placeholder="Enter IP, domain, URL, or file hash..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => setValue(ex.value)}
                className="text-xs px-3 py-1 rounded-full border border-citadel-600 text-gray-400 hover:border-citadel-accent hover:text-citadel-accent transition-colors"
              >
                {ex.label}
              </button>
            ))}
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Scan className="w-4 h-4" />
            Analyze IOC
          </button>
        </form>
      </div>

      {error && <div className="panel p-4 text-red-400">{error}</div>}
      {loading && <Loading text="Running IOC heuristics and AI threat analysis..." />}

      {result && (
        <div className="grid lg:grid-cols-2 gap-4 animate-slide-up">
          <div className="panel p-5 space-y-4">
            <h2 className="font-semibold text-white">Heuristic Assessment</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Type', result.type],
                ['Classification', result.classification],
                ['Reputation', result.reputation],
                ['Risk Level', result.riskLevel],
              ].map(([k, v]) => (
                <div key={k} className="bg-citadel-950 rounded-lg p-3 border border-citadel-700/40">
                  <p className="text-[10px] text-gray-500 uppercase">{k}</p>
                  <p className={`text-sm mt-1 ${k === 'Risk Level' ? riskColors[v] || 'text-white' : 'text-gray-300'}`}>
                    {v}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-2">Risk Indicators</h3>
              <ul className="space-y-1">
                {(result.riskIndicators || []).map((r, i) => (
                  <li key={i} className="text-xs text-orange-300/80 flex gap-2">
                    <span className="text-orange-500">•</span> {r}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-2">Recommendations</h3>
              <ul className="space-y-1">
                {(result.recommendations || []).map((r, i) => (
                  <li key={i} className="text-xs text-green-300/80 flex gap-2">
                    <span className="text-green-500">✓</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="font-semibold text-citadel-accent mb-3">AI Threat Analysis</h2>
            <MarkdownView content={result.aiAnalysis} />
          </div>
        </div>
      )}
    </div>
  );
}
