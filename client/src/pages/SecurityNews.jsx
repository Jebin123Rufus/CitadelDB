import { useEffect, useState } from 'react';
import { Newspaper, Sparkles, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import Loading from '../components/Loading';
import MarkdownView from '../components/MarkdownView';
import { formatDate } from '../utils/severity';

export default function SecurityNews() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState(null);
  const [briefingLoad, setBriefingLoad] = useState(false);
  const [summaries, setSummaries] = useState({});

  function loadNews() {
    setLoading(true);
    api.news
      .list({ search, category, sort })
      .then((data) => {
        setArticles(data.articles || []);
        setCategories(data.categories || ['all']);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadNews();
  }, [search, category, sort]);

  async function generateBriefing() {
    setBriefingLoad(true);
    try {
      const data = await api.news.briefing();
      setBriefing(data.briefing);
    } catch (err) {
      setBriefing(`Error: ${err.message}`);
    } finally {
      setBriefingLoad(false);
    }
  }

  async function summarizeArticle(article) {
    if (summaries[article.id]) return;
    try {
      const data = await api.news.summarize({
        title: article.title,
        summary: article.summary,
        source: article.source,
      });
      setSummaries((s) => ({ ...s, [article.id]: data.summary }));
    } catch {
      setSummaries((s) => ({ ...s, [article.id]: 'Summary unavailable' }));
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-citadel-accent" />
            Security News Center
          </h1>
          <p className="text-gray-500 text-sm mt-1">Aggregated RSS feeds from trusted security sources</p>
        </div>
        <button
          onClick={generateBriefing}
          disabled={briefingLoad}
          className="btn-primary flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {briefingLoad ? 'Generating...' : 'AI Threat Briefing'}
        </button>
      </header>

      <div className="panel p-4 flex flex-wrap gap-3">
        <input
          className="input-field flex-1 min-w-[200px]"
          placeholder="Search headlines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field w-40" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className="input-field w-36" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="source">By Source</option>
        </select>
      </div>

      {briefing && (
        <div className="panel p-5 border-citadel-accent/20">
          <h2 className="font-semibold text-citadel-accent mb-3">AI Analyst Briefing</h2>
          <MarkdownView content={briefing} />
        </div>
      )}

      {loading ? (
        <Loading text="Fetching security news feeds..." />
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <article key={article.id} className="panel p-5 hover:border-citadel-accent/30 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-citadel-accent px-2 py-0.5 rounded bg-citadel-accent/10 border border-citadel-accent/20">
                    {article.category}
                  </span>
                  <h2 className="text-white font-semibold mt-2">{article.title}</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {article.source} • {formatDate(article.published)}
                  </p>
                </div>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-1 text-xs"
                >
                  <ExternalLink className="w-3 h-3" /> Read
                </a>
              </div>
              <p className="text-sm text-gray-400 mt-3">{article.summary || 'No summary available.'}</p>
              <button
                onClick={() => summarizeArticle(article)}
                className="text-xs text-citadel-accent mt-3 hover:underline"
              >
                {summaries[article.id] ? 'AI Summary' : 'Generate AI Summary & Takeaway'}
              </button>
              {summaries[article.id] && (
                <div className="mt-3 p-3 rounded-lg bg-citadel-950 border border-citadel-700/40 text-sm">
                  <MarkdownView content={summaries[article.id]} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
