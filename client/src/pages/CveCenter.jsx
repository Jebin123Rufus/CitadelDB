import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import Loading from '../components/Loading';
import SeverityBadge from '../components/SeverityBadge';
import { formatDate } from '../utils/severity';

export default function CveCenter() {
  const [params] = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [severity, setSeverity] = useState('');
  const [cveId, setCveId] = useState(params.get('id') || '');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = params.get('id');
    if (id) {
      setCveId(id);
      lookupCve(id);
    }
  }, [params]);

  async function handleSearch(e) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const data = await api.cve.search({
        keyword: keyword || undefined,
        severity: severity || undefined,
        limit: 25,
      });
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function lookupCve(id) {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const cve = await api.cve.get(id.trim());
      setSelected(cve);
      setResults([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-white">CVE Intelligence Center</h1>
        <p className="text-gray-500 text-sm mt-1">Search and analyze vulnerabilities from the NVD API</p>
      </header>

      <div className="panel p-5">
        <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-3">
          <input
            className="input-field md:col-span-2"
            placeholder="Search by keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <select
            className="input-field"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button type="submit" className="btn-primary flex items-center justify-center gap-2">
            <Search className="w-4 h-4" /> Search
          </button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookupCve(cveId);
          }}
          className="flex gap-3 mt-3"
        >
          <input
            className="input-field flex-1 font-mono"
            placeholder="CVE-2024-12345"
            value={cveId}
            onChange={(e) => setCveId(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Lookup CVE ID</button>
        </form>
      </div>

      {error && <div className="panel p-4 text-red-400 text-sm">{error}</div>}
      {loading && <Loading />}

      {selected && <CveDetail cve={selected} />}

      {!loading && results.length > 0 && (
        <div className="panel">
          <div className="panel-header">
            <h2 className="font-semibold">Results ({results.length})</h2>
          </div>
          <div className="divide-y divide-citadel-700/30">
            {results.map((cve) => (
              <button
                key={cve.id}
                onClick={() => setSelected(cve)}
                className="w-full text-left px-5 py-4 hover:bg-citadel-800/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-citadel-accent">{cve.id}</span>
                  <SeverityBadge severity={cve.severity} />
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cve.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CveDetail({ cve }) {
  return (
    <div className="panel animate-slide-up">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-xl text-citadel-accent">{cve.id}</h2>
          <SeverityBadge severity={cve.severity} />
        </div>
        <span className="text-lg font-bold text-white">CVSS {cve.score ?? 'N/A'}</span>
      </div>

      <div className="p-5 space-y-5">
        <p className="text-gray-300 text-sm leading-relaxed">{cve.description}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ['Published', formatDate(cve.published)],
            ['Modified', formatDate(cve.lastModified)],
            ['Status', cve.vulnStatus || 'N/A'],
            ['Vector', cve.vector?.slice(0, 30) + '...' || 'N/A'],
          ].map(([k, v]) => (
            <div key={k} className="bg-citadel-950 rounded-lg p-3 border border-citadel-700/40">
              <p className="text-[10px] text-gray-500 uppercase">{k}</p>
              <p className="text-sm text-gray-300 mt-1 font-mono break-all">{v}</p>
            </div>
          ))}
        </div>

        {cve.impact && Object.keys(cve.impact).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Impact & Attack Metrics</h3>
            <div className="grid sm:grid-cols-3 gap-2">
              {Object.entries(cve.impact).map(([k, v]) =>
                v ? (
                  <div key={k} className="text-xs bg-citadel-800/50 rounded px-3 py-2">
                    <span className="text-gray-500">{k}: </span>
                    <span className="text-citadel-accent">{v}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {cve.references?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">References</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {cve.references.map((ref, i) => (
                <a
                  key={i}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-citadel-accent hover:underline truncate"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  {ref.url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
