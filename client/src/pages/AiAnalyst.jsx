import { useState } from 'react';
import { Brain, Send } from 'lucide-react';
import { api } from '../api/client';
import MarkdownView from '../components/MarkdownView';
import Loading from '../components/Loading';

export default function AiAnalyst() {
  const [input, setInput] = useState('');
  const [cveId, setCveId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const data = await api.ai.analyze({ input, cveId: cveId || undefined });
      setAnalysis(data.analysis);
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
          <Brain className="w-8 h-8 text-citadel-accent" />
          <div>
            <h1 className="text-2xl font-bold text-white">AI Threat Analyst</h1>
            <p className="text-gray-500 text-sm">Llama 3.3 70B • GROQ-powered threat intelligence reports</p>
          </div>
        </div>
      </header>

      <div className="panel p-5">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Optional CVE ID for context</label>
            <input
              className="input-field mt-1 font-mono"
              placeholder="CVE-2024-XXXX"
              value={cveId}
              onChange={(e) => setCveId(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">
              Threat Input (CVE, advisory, IOCs, reports)
            </label>
            <textarea
              className="input-field mt-1 min-h-[160px] resize-y"
              placeholder="Paste vulnerability details, security advisories, threat reports, or IOC information..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" />
            {loading ? 'Analyzing...' : 'Generate Threat Intelligence Report'}
          </button>
        </form>
      </div>

      {error && <div className="panel p-4 text-red-400">{error}</div>}
      {loading && <Loading text="AI threat analyst processing intelligence..." />}

      {analysis && (
        <div className="panel p-6 animate-slide-up">
          <MarkdownView content={analysis} />
        </div>
      )}
    </div>
  );
}
