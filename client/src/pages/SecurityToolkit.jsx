import { useState } from 'react';
import { Wrench } from 'lucide-react';
import { api } from '../api/client';
import MarkdownView from '../components/MarkdownView';
import Loading from '../components/Loading';

const TOOLS = [
  { id: 'cvss', name: 'CVSS Score Explainer', placeholder: '9.8 or CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', field: 'input' },
  { id: 'hash', name: 'Hash Identifier', placeholder: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', field: 'hash' },
  { id: 'url', name: 'URL Risk Analyzer', placeholder: 'https://example.com/path', field: 'url' },
  { id: 'password', name: 'Password Strength Analyzer', placeholder: 'Enter password to analyze', field: 'password' },
  { id: 'headers', name: 'Security Header Analyzer', placeholder: 'example.com', field: 'url' },
];

export default function SecurityToolkit() {
  const [active, setActive] = useState('cvss');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  const tool = TOOLS.find((t) => t.id === active);

  async function runTool(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setExplanation(null);
    try {
      const body = { [tool.field]: input };
      const data = await api.toolkit[active](body);
      setResult(data.result);
      setExplanation(data.explanation);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wrench className="w-7 h-7 text-citadel-accent" />
          Security Toolkit
        </h1>
        <p className="text-gray-500 text-sm mt-1">Educational cybersecurity utilities with AI explanations</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActive(t.id);
              setInput('');
              setResult(null);
              setExplanation(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm border transition-all ${
              active === t.id
                ? 'border-citadel-accent bg-citadel-accent/10 text-citadel-accent'
                : 'border-citadel-700 text-gray-400 hover:border-citadel-600'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="panel p-5">
        <h2 className="font-semibold text-white mb-4">{tool.name}</h2>
        <form onSubmit={runTool} className="flex gap-3">
          <input
            className="input-field flex-1"
            type={active === 'password' ? 'password' : 'text'}
            placeholder={tool.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary">
            Analyze
          </button>
        </form>
      </div>

      {loading && <Loading />}
      {result && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="panel p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Results</h3>
            <pre className="text-xs text-gray-400 overflow-auto max-h-96 font-mono bg-citadel-950 p-4 rounded-lg border border-citadel-700/40">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
          {explanation && (
            <div className="panel p-5">
              <h3 className="text-sm font-semibold text-citadel-accent mb-3">Educational Explanation</h3>
              <MarkdownView content={explanation} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
