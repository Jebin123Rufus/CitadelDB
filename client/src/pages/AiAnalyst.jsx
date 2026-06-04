import { useState } from 'react';
import { Brain, Send, HelpCircle, ChevronDown, ChevronUp, Sparkles, ShieldCheck, ClipboardList, BookOpen } from 'lucide-react';
import { api } from '../api/client';
import MarkdownView from '../components/MarkdownView';
import Loading from '../components/Loading';
import GlossaryTerm from '../components/GlossaryTerm';
import CveSearchHelper from '../components/CveSearchHelper';

export default function AiAnalyst() {
  const [input, setInput] = useState('');
  const [cveId, setCveId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  async function handleAnalyze(e) {
    e?.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setActiveTab('summary');
    try {
      const data = await api.ai.analyze({ input, cveId: cveId || undefined });
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Parse markdown into segments for cleaner presentation
  function getPartitionedReport(markdown) {
    if (!markdown) return { summary: '', defenses: '', full: '' };

    const sections = markdown.split(/(?=^#+ )/m);
    let summary = '';
    let defenses = '';

    sections.forEach((sec) => {
      const lower = sec.toLowerCase();
      if (
        lower.includes('summary') ||
        lower.includes('overview') ||
        lower.includes('executive') ||
        lower.includes('brief')
      ) {
        summary += sec + '\n\n';
      } else if (
        lower.includes('remediation') ||
        lower.includes('mitigation') ||
        lower.includes('defense') ||
        lower.includes('prevent') ||
        lower.includes('control')
      ) {
        defenses += sec + '\n\n';
      }
    });

    if (!summary.trim()) {
      summary = '### Executive Summary\n\n' + markdown.split('\n\n').slice(0, 3).join('\n\n');
    }
    if (!defenses.trim()) {
      const lines = markdown.split('\n');
      const lists = lines.filter(
        (l) => l.trim().startsWith('-') || l.trim().startsWith('*') || /^\d+\./.test(l.trim())
      );
      defenses =
        lists.length > 0
          ? '### Mitigation Steps & Action Items\n\n' + lists.slice(0, 15).join('\n')
          : '### Defensive Recommendations\n\nRefer to the Full Report tab for general advice and mitigation procedures.';
    }

    return {
      summary,
      defenses,
      full: markdown,
    };
  }

  const reportParts = getPartitionedReport(analysis);

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-citadel-accent" />
          <div>
            <h1 className="text-2xl font-bold text-white">AI Threat Analyst</h1>
            <p className="text-gray-500 text-sm">
              Generate structured, learnable security briefs from threat feeds and logs
            </p>
          </div>
        </div>
      </header>

      {/* Developer & Analyst Guide */}
      <DeveloperGuide />

      {/* Inputs Form */}
      <div className="panel p-5 space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                Optional <GlossaryTerm term="CVE">CVE ID</GlossaryTerm> context
              </label>
              <input
                className="input-field font-mono uppercase"
                placeholder="e.g. CVE-2024-21413"
                value={cveId}
                onChange={(e) => setCveId(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                Analyze Threat Details
              </button>
            </div>
          </div>

          {/* Search assistant helper */}
          <CveSearchHelper onSelect={(id) => setCveId(id)} />

          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
              Threat Data Input (Advisory logs, reports, CVE description)
            </label>
            <textarea
              className="input-field min-h-[140px] resize-y font-sans text-sm"
              placeholder="Paste raw vulnerability details, firewall alerts, server advisories, or IOC logs..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
            />
          </div>
        </form>
      </div>

      {error && <div className="panel p-4 text-red-400">{error}</div>}
      {loading && <Loading text="Secure AI model parsing threat logs and building summary..." />}

      {analysis && (
        <div className="panel overflow-hidden animate-slide-up">
          {/* Tab Selector Header */}
          <div className="flex border-b border-citadel-700/50 bg-citadel-900/60">
            {[
              { id: 'summary', label: 'Executive Summary', icon: ClipboardList },
              { id: 'defenses', label: 'Defensive Playbook', icon: ShieldCheck },
              { id: 'full', label: 'Full Analyst Report', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
                    isActive
                      ? 'border-citadel-accent text-citadel-accent bg-citadel-accent/5'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-citadel-800/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="p-6">
            {activeTab === 'summary' && <MarkdownView content={reportParts.summary} />}
            {activeTab === 'defenses' && <MarkdownView content={reportParts.defenses} />}
            {activeTab === 'full' && <MarkdownView content={reportParts.full} />}
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
          Developer & Analyst Guide: AI Report Structuring
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="p-5 border-t border-citadel-700/30 space-y-3 bg-citadel-950/40 leading-relaxed text-gray-400">
          <p>
            Welcome to the <strong>AI Threat Analyst</strong>! This model digests raw logs, threat reports, and advisories to output a clean security brief.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-white mb-1">Tab Sections Explained:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Executive Summary:</strong> High-level business overview explaining risk scope.</li>
                <li><strong>Defensive Playbook:</strong> Bulleted checklist of action items, patches, and configurations.</li>
                <li><strong>Full Report:</strong> Exhaustive detail output from the Llama model.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Developer Tips:</h4>
              <p>
                Optionally import a <GlossaryTerm term="CVE">CVE ID</GlossaryTerm> to supply the AI model with precise scoring and exploit vector configurations, leading to highly customized defense strategies.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
