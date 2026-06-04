import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'CitadelDB/1.0 Threat Intelligence Portal' },
});

const FEEDS = [
  { url: 'https://krebsonsecurity.com/feed/', source: 'Krebs on Security', category: 'Threat Research' },
  { url: 'https://www.bleepingcomputer.com/feed/', source: 'BleepingComputer', category: 'Malware & Incidents' },
  { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News', category: 'Breaking News' },
  { url: 'https://www.darkreading.com/rss.xml', source: 'Dark Reading', category: 'Industry' },
  { url: 'https://threatpost.com/feed/', source: 'Threatpost', category: 'Vulnerabilities' },
  { url: 'https://www.cisa.gov/news.xml', source: 'CISA', category: 'Government Advisories' },
];

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

function categorize(item, feedCategory) {
  const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
  if (/ransomware|malware|trojan/.test(text)) return 'Malware';
  if (/cve-|vulnerability|zero-day|patch/.test(text)) return 'Vulnerabilities';
  if (/breach|leak|exposed/.test(text)) return 'Data Breach';
  if (/apt|nation-state|espionage/.test(text)) return 'APT';
  if (/phishing|fraud|scam/.test(text)) return 'Fraud';
  return feedCategory;
}

export async function fetchAllNews() {
  const articles = [];

  await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        (parsed.items || []).slice(0, 12).forEach((item) => {
          articles.push({
            id: Buffer.from(`${feed.source}-${item.link || item.guid}`).toString('base64url'),
            title: item.title || 'Untitled',
            source: feed.source,
            link: item.link || item.guid,
            published: item.isoDate || item.pubDate || new Date().toISOString(),
            summary: stripHtml(item.contentSnippet || item.content || item.summary || ''),
            category: categorize(item, feed.category),
          });
        });
      } catch (err) {
        console.warn(`Feed failed: ${feed.source}`, err.message);
      }
    })
  );

  articles.sort((a, b) => new Date(b.published) - new Date(a.published));
  return articles;
}

export function filterNews(articles, { search, category, sort = 'newest' }) {
  let filtered = [...articles];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((a) => a.category === category);
  }

  if (sort === 'oldest') {
    filtered.sort((a, b) => new Date(a.published) - new Date(b.published));
  } else if (sort === 'source') {
    filtered.sort((a, b) => a.source.localeCompare(b.source));
  } else {
    filtered.sort((a, b) => new Date(b.published) - new Date(a.published));
  }

  return filtered;
}

export function getCategories(articles) {
  const cats = new Set(articles.map((a) => a.category));
  return ['all', ...cats];
}
