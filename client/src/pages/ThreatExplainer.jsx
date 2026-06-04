import { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import MarkdownView from '../components/MarkdownView';
import Loading from '../components/Loading';
import SeverityBadge from '../components/SeverityBadge';

export default function ThreatExplainer() {
  const [cveId, setCveId] = useState('');
  const [cve, setCve] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleExplain(e) {
    e.preventDefault();
    if (!cveId.trim()) return;
    setLoading(true);
    setError(null);
    setExplanation(null);
    setCve(null);
    try {
      const data = await api.ai.explain({ cveId: cveId.trim() });
      setCve(data.cve);
      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-citadel-purple" />
          <div>
            <h1 className="text-2xl font-bold text-white">Threat Explainer</h1>
            <p className="text-gray-500 text-sm">
              Visual and textual attack flow explanations for learners and professionals
            </p>
          </div>
        </div>
      </header>

      <div className="panel p-5 border-citadel-purple/20">
        <form onSubmit={handleExplain} className="flex gap-3">
          <input
            className="input-field flex-1 font-mono text-lg"
            placeholder="Enter CVE ID (e.g. CVE-2024-21413)"
            value={cveId}
            onChange={(e) => setCveId(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Explain Threat
          </button>
        </form>
      </div>

      {error && <div className="panel p-4 text-red-400">{error}</div>}
      {loading && <Loading text="Building threat explanation from NVD + AI..." />}

      {cve && (
        <div className="grid lg:grid-cols-4 gap-4 animate-slide-up">
          <FlowStep num={1} title="Reconnaissance" desc="Identify vulnerable targets running affected software versions." />
          <FlowStep num={2} title="Weaponization" desc="Prepare exploit payload aligned with attack vector from CVSS." />
          <FlowStep num={3} title="Exploitation" desc={`Leverage ${cve.impact?.attackVector || 'known'} vector to trigger the vulnerability.`} />
          <FlowStep num={4} title="Impact" desc={`Potential ${cve.impact?.confidentiality || 'C'}/${cve.impact?.integrity || 'I'}/${cve.impact?.availability || 'A'} impact on affected systems.`} />
        </div>
      )}

      {cve && (
        <div className="panel p-4 flex flex-wrap items-center gap-4">
          <span className="font-mono text-citadel-accent text-lg">{cve.id}</span>
          <SeverityBadge severity={cve.severity} />
          <span className="text-gray-400 text-sm">CVSS {cve.score}</span>
        </div>
      )}

      {explanation && (
        <div className="panel p-6">
          <MarkdownView content={explanation} />
        </div>
      )}
    </div>
  );
}

function FlowStep({ num, title, desc }) {
  return (
    <div className="panel p-4 relative overflow-hidden group hover:border-citadel-accent/40 transition-colors">
      <div className="absolute top-0 right-0 text-6xl font-bold text-citadel-700/30 -mr-2 -mt-2">
        {num}
      </div>
      <h3 className="font-semibold text-citadel-accent text-sm">{title}</h3>
      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}
