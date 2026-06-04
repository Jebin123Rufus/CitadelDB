import { useEffect, useState } from 'react';
import { Target, ChevronRight, Search, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../api/client';
import Loading from '../components/Loading';
import GlossaryTerm from '../components/GlossaryTerm';

const TACTIC_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e',
  '#84cc16', '#6366f1', '#a855f7', '#0ea5e9',
];

export default function AttackExplorer() {
  const [tactics, setTactics] = useState([]);
  const [techniques, setTechniques] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTactic, setActiveTactic] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.attack.tactics().then((d) => setTactics(d.tactics || [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = activeTactic ? { tactic: activeTactic } : {};
    if (search) params.search = search;
    api.attack.techniques(params).then((d) => setTechniques(d.techniques || []));
  }, [activeTactic, search]);

  async function selectTechnique(id) {
    try {
      const tech = await api.attack.technique(id);
      setSelected(tech);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <Loading text="Loading MITRE ATT&CK framework..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="w-7 h-7 text-red-400" />
          <GlossaryTerm term="mitre att&ck">MITRE ATT&CK</GlossaryTerm> Explorer
        </h1>
        <p className="text-gray-500 text-sm mt-1">Browse tactics, techniques, and defensive guidance</p>
      </header>

      <DeveloperGuide />

      <div className="panel p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            className="input-field pl-10"
            placeholder="Search techniques by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <button
          onClick={() => setActiveTactic(null)}
          className={`p-3 rounded-lg text-xs text-center border transition-all ${
            !activeTactic
              ? 'border-citadel-accent bg-citadel-accent/10 text-citadel-accent'
              : 'border-citadel-700 text-gray-400 hover:border-citadel-600'
          }`}
        >
          All Tactics
        </button>
        {tactics.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActiveTactic(t.shortName || t.name)}
            className={`p-3 rounded-lg text-xs text-center border transition-all ${
              activeTactic === (t.shortName || t.name)
                ? 'border-citadel-accent bg-citadel-accent/10 text-white'
                : 'border-citadel-700 text-gray-400 hover:border-citadel-600'
            }`}
            style={{ borderLeftColor: TACTIC_COLORS[i % TACTIC_COLORS.length], borderLeftWidth: 3 }}
          >
            <span className="font-mono block text-[10px] text-gray-500">{t.id}</span>
            {t.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel max-h-[500px] overflow-y-auto">
          <div className="panel-header sticky top-0 bg-citadel-900 z-10">
            <h2 className="font-semibold">Techniques ({techniques.length})</h2>
          </div>
          <div className="divide-y divide-citadel-700/30">
            {techniques.map((tech) => (
              <button
                key={tech.id}
                onClick={() => selectTechnique(tech.id)}
                className="w-full text-left px-4 py-3 hover:bg-citadel-800/40 flex items-center gap-2 group"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs text-citadel-accent">{tech.id}</span>
                  <p className="text-sm text-white truncate">{tech.name}</p>
                  <p className="text-[10px] text-gray-500">{tech.tactics?.join(', ')}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-citadel-accent" />
              </button>
            ))}
          </div>
        </div>

        <div className="panel min-h-[400px]">
          {selected ? (
            <div className="p-5 space-y-4 animate-slide-up">
              <div>
                <span className="font-mono text-citadel-accent">{selected.id}</span>
                <h2 className="text-xl font-bold text-white mt-1">{selected.name}</h2>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selected.tactics?.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed max-h-40 overflow-y-auto">
                {selected.description?.slice(0, 800)}
                {(selected.description?.length || 0) > 800 && '...'}
              </p>

              {selected.detection && (
                <div>
                  <h3 className="text-sm font-semibold text-citadel-accent mb-1">Detection Guidance</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{selected.detection}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-green-400 mb-2">Defensive Recommendations</h3>
                <div className="space-y-2">
                  {(selected.defensiveRecommendations || []).map((m) => (
                    <div key={m.id} className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                      <p className="text-sm font-medium text-white">{m.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{m.description?.slice(0, 300)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selected.url && (
                <a href={selected.url} target="_blank" rel="noopener noreferrer" className="text-xs text-citadel-accent hover:underline">
                  View on MITRE ATT&CK →
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm p-8">
              Select a technique to view details
            </div>
          )}
        </div>
      </div>
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
          Developer & Analyst Guide: Exploring MITRE ATT&CK
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="p-5 border-t border-citadel-700/30 space-y-3 bg-citadel-950/40 leading-relaxed text-gray-400">
          <p>
            Welcome to the <strong>MITRE ATT&CK</strong> interface! This globally adopted framework indexes real-world adversary behavior.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-white mb-1">Structure:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong><GlossaryTerm term="tactic">Tactics</GlossaryTerm>:</strong> The actor's objective (e.g. <em>Execution</em> or <em>Persistence</em>).</li>
                <li><strong><GlossaryTerm term="technique">Techniques</GlossaryTerm>:</strong> The specific method used to perform that objective (e.g., using PowerShell script engines).</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Defense & Detection:</h4>
              <p>
                Each technique links to <strong>Detection Guidance</strong> (logs or signs of activity) and <strong>Defensive Recommendations</strong> (concrete settings to stop the exploit).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
