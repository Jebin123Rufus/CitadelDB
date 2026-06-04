import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../api/client';
import Loading from './Loading';
import SeverityBadge from './SeverityBadge';

export default function CveSearchHelper({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.cve.search({
        keyword: keyword || undefined,
        year: year || undefined,
        type: type || undefined,
        severity: severity || undefined,
        limit: 10,
      });
      setResults(data.results || []);
      if ((data.results || []).length === 0) {
        setError('No matching CVEs found. Try broadening your filters.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-citadel-700/40 rounded-xl bg-citadel-950 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-citadel-900 hover:bg-citadel-800/60 flex items-center justify-between text-gray-300 transition-colors font-medium"
      >
        <span className="flex items-center gap-2">
          <Search className="w-4 h-4 text-citadel-accent" />
          Don't know the CVE ID? Search by Keyword, Year, or Vector...
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-citadel-700/30 space-y-4 animate-slide-up">
          <form onSubmit={handleSearch} className="grid sm:grid-cols-2 md:grid-cols-5 gap-2 items-end">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Keyword</label>
              <input
                className="input-field p-2 text-xs"
                placeholder="e.g. Outlook, Exchange..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Year</label>
              <input
                className="input-field p-2 text-xs font-mono"
                placeholder="e.g. 2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Vector Type</label>
              <select
                className="input-field p-2 text-xs"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">All Vectors</option>
                <option value="NETWORK">Network (Remote)</option>
                <option value="LOCAL">Local</option>
                <option value="ADJACENT">Adjacent Network</option>
                <option value="PHYSICAL">Physical Access</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Severity</label>
              <select
                className="input-field p-2 text-xs"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" /> Find CVEs
              </button>
            </div>
          </form>

          {loading && <Loading text="Searching..." />}
          {error && <p className="text-red-400 text-[11px] bg-red-500/5 p-2 rounded border border-red-500/10">{error}</p>}

          {!loading && results.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <p className="text-[10px] text-gray-500 mb-2 font-semibold">Select a vulnerability below to auto-fill:</p>
              {results.map((cve) => (
                <button
                  key={cve.id}
                  type="button"
                  onClick={() => {
                    onSelect(cve.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-citadel-900 border border-citadel-800 hover:border-citadel-accent/40 hover:bg-citadel-800/40 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-citadel-accent">{cve.id}</span>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{cve.description}</p>
                  </div>
                  <SeverityBadge severity={cve.severity} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
