import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ExternalLink, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../api/client';
import Loading from '../components/Loading';
import SeverityBadge from '../components/SeverityBadge';
import GlossaryTerm from '../components/GlossaryTerm';
import CvssGauge from '../components/CvssGauge';
import VectorMap from '../components/VectorMap';
import { formatDate } from '../utils/severity';

export default function CveCenter() {
  const [params] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('id') || '');
  const [year, setYear] = useState('');
  const [type, setType] = useState('');
  const [cwe, setCwe] = useState('');
  const [severity, setSeverity] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = params.get('id');
    if (id) {
      setKeyword(id);
      lookupCve(id);
    }
  }, [params]);

  async function handleSearch(e) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setSelected(null);
    
    const term = keyword.trim().toUpperCase();
    // If it looks like a CVE ID, look it up directly
    if (term.match(/^CVE-\d{4}-\d{4,8}$/)) {
      await lookupCve(term);
      return;
    }

    try {
      const data = await api.cve.search({
        keyword: keyword || undefined,
        year: year || undefined,
        type: type || undefined,
        cwe: cwe || undefined,
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
        <p className="text-gray-500 text-sm mt-1">
          Search and analyze vulnerabilities from the <GlossaryTerm term="NVD">NVD</GlossaryTerm> database
        </p>
      </header>

      {/* Developer & Analyst Guide */}
      <DeveloperGuide />

      {/* Unified Search Panel */}
      <div className="panel p-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                Keyword or <GlossaryTerm term="CVE">CVE ID</GlossaryTerm>
              </label>
              <input
                className="input-field"
                placeholder="Search by keywords, software, or ID (e.g., Exchange, CVE-2024-21413)..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                Publication Year
              </label>
              <input
                className="input-field font-mono"
                placeholder="e.g. 2024, 2023..."
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                <GlossaryTerm term="Attack Vector">Exploit Vector (Type)</GlossaryTerm>
              </label>
              <select
                className="input-field"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">All Attack Vectors</option>
                <option value="NETWORK">Network (Remote)</option>
                <option value="LOCAL">Local console</option>
                <option value="ADJACENT">Adjacent Network</option>
                <option value="PHYSICAL">Physical Access</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                <GlossaryTerm term="CWE">CWE Weakness Category</GlossaryTerm>
              </label>
              <input
                className="input-field font-mono"
                placeholder="e.g. CWE-89, CWE-79..."
                value={cwe}
                onChange={(e) => setCwe(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                <GlossaryTerm term="CVSS">Severity Rating</GlossaryTerm>
              </label>
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
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button type="submit" className="btn-primary px-6 flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> Search Vulnerabilities
            </button>
          </div>
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
                <p className="text-sm text-gray-400 mt-1.5 line-clamp-2">{cve.description}</p>
                <div className="flex gap-4 mt-2 text-[10px] text-gray-500 font-mono">
                  <span>CVSS: {cve.score ?? 'N/A'}</span>
                  <span>Vector: {cve.impact?.attackVector || 'UNKNOWN'}</span>
                  <span>Published: {formatDate(cve.published)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DeveloperGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-citadel-700/40 rounded-xl bg-citadel-900/60 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3.5 hover:bg-citadel-800/40 flex items-center justify-between text-gray-300 transition-colors font-semibold"
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-citadel-accent" />
          Developer & Analyst Guide: How to search and read CVEs
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="p-5 border-t border-citadel-700/30 space-y-3 bg-citadel-950/40 leading-relaxed text-gray-400">
          <p>
            Welcome to the <strong>CVE Intelligence Center</strong>! This page communicates directly with the{' '}
            <GlossaryTerm term="NVD">NVD (National Vulnerability Database)</GlossaryTerm> to search and retrieve security flaws.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-white mb-1">Search Parameters:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Keyword/ID:</strong> Search for product/vendor names or lookup ID directly (e.g. CVE-2024-21413).</li>
                <li><strong>Year:</strong> Filters the calendar year of publication.</li>
                <li><strong>Exploit Vector:</strong> Filters by the entry point path (Network, Local, Adjacent, Physical).</li>
                <li><strong>CWE ID:</strong> Search by software bug category (e.g. CWE-89 for SQL injection).</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Visual Threat Metrics:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>CVSS Score Gauge:</strong> Circular visual speedometer indicating severity from low to critical.</li>
                <li><strong>Exploit Vector Map:</strong> Step-by-step visual map tracing attacker to targets.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollapsibleText({ text }) {
  const [expanded, setExpanded] = useState(false);
  const words = text ? text.split(' ') : [];
  const isLong = words.length > 35;

  if (!isLong) return <p className="text-gray-300 text-sm leading-relaxed">{text}</p>;

  return (
    <div>
      <p className={`text-gray-300 text-sm leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
        {text}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-citadel-accent mt-1 hover:underline focus:outline-none font-medium"
      >
        {expanded ? 'Read Less' : 'Read More'}
      </button>
    </div>
  );
}

function CveDetail({ cve }) {
  return (
    <div className="panel animate-slide-up">
      <div className="panel-header border-b border-citadel-700/50 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-xl text-citadel-accent font-bold">{cve.id}</h2>
          <SeverityBadge severity={cve.severity} />
        </div>
        <span className="text-sm font-semibold text-gray-500">
          Source: {cve.sourceIdentifier || 'NVD'}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Description Section with Collapsible Text */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vulnerability Summary</h3>
          <CollapsibleText text={cve.description} />
        </div>

        {/* Visual Metrics Row */}
        <div className="grid md:grid-cols-3 gap-4 items-stretch">
          {/* Circular Severity Gauge */}
          <div className="flex flex-col items-center justify-center p-5 bg-citadel-950 rounded-xl border border-citadel-800">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Severity Rating</h3>
            <CvssGauge score={cve.score} />
          </div>

          {/* Exploit Vector Map */}
          <div className="md:col-span-2">
            <VectorMap impact={cve.impact} severity={cve.severity} />
          </div>
        </div>

        {/* Technical Data Badges */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ['Published Date', formatDate(cve.published)],
            ['Last Modified', formatDate(cve.lastModified)],
            ['Status', cve.vulnStatus || 'N/A'],
            ['CWE Categories', cve.categories?.join(', ') || 'N/A'],
          ].map(([k, v]) => (
            <div key={k} className="bg-citadel-950 rounded-lg p-3 border border-citadel-800">
              <p className="text-[9px] text-gray-500 uppercase font-semibold">{k}</p>
              <p className="text-xs text-gray-300 mt-1 font-mono break-all">{v}</p>
            </div>
          ))}
        </div>

        {/* Raw CVSS Metrics */}
        {cve.impact && Object.keys(cve.impact).length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Raw <GlossaryTerm term="vector">CVSS Metrics</GlossaryTerm>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(cve.impact).map(([k, v]) =>
                v ? (
                  <div key={k} className="text-xs bg-citadel-950/40 rounded border border-citadel-800 p-2.5">
                    <span className="text-gray-500 block text-[9px] uppercase font-semibold">{k}</span>
                    <span className="text-gray-300 font-mono text-[11px] block mt-0.5">{v}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* References List */}
        {cve.references?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">References</h3>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
              {cve.references.map((ref, i) => (
                <a
                  key={i}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-citadel-accent hover:underline truncate"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
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
