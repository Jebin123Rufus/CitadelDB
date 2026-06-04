const API = '/api';

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  health: () => request('/health'),
  dashboard: () => request('/dashboard'),
  trends: () => request('/dashboard/trends'),
  cve: {
    search: (params) => request(`/cve/search${buildQuery(params)}`),
    get: (id) => request(`/cve/${encodeURIComponent(id)}`),
    recent: (days = 7) => request(`/cve?days=${encodeURIComponent(days)}`),
  },
  ai: {
    analyze: (body) => request('/ai/analyze', { method: 'POST', body: JSON.stringify(body) }),
    explain: (body) => request('/ai/explain', { method: 'POST', body: JSON.stringify(body) }),
    chat: (body) => request('/ai/chat', { method: 'POST', body: JSON.stringify(body) }),
  },
  news: {
    list: (params) => request(`/news${buildQuery(params)}`),
    briefing: () => request('/news/briefing', { method: 'POST', body: '{}' }),
    summarize: (body) => request('/news/summarize', { method: 'POST', body: JSON.stringify(body) }),
  },
  attack: {
    tactics: () => request('/attack/tactics'),
    techniques: (params) => request(`/attack/techniques${buildQuery(params)}`),
    technique: (id) => request(`/attack/techniques/${encodeURIComponent(id)}`),
    search: (q) => request(`/attack/search${buildQuery({ q })}`),
  },
  ioc: {
    analyze: (body) => request('/ioc/analyze', { method: 'POST', body: JSON.stringify(body) }),
    detectType: (value) => request(`/ioc/detect-type${buildQuery({ value })}`),
  },
  toolkit: {
    cvss: (body) => request('/toolkit/cvss', { method: 'POST', body: JSON.stringify(body) }),
    hash: (body) => request('/toolkit/hash', { method: 'POST', body: JSON.stringify(body) }),
    url: (body) => request('/toolkit/url', { method: 'POST', body: JSON.stringify(body) }),
    password: (body) => request('/toolkit/password', { method: 'POST', body: JSON.stringify(body) }),
    headers: (body) => request('/toolkit/headers', { method: 'POST', body: JSON.stringify(body) }),
  },
};
