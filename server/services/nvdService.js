import axios from 'axios';

const NVD_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

const client = axios.create({
  baseURL: NVD_BASE,
  timeout: 30000,
  headers: process.env.NVD_API_KEY
    ? { apiKey: process.env.NVD_API_KEY }
    : {},
});

function parseCvss(cve) {
  const metrics = cve.metrics || {};
  const v31 = metrics.cvssMetricV31?.[0]?.cvssData;
  const v30 = metrics.cvssMetricV30?.[0]?.cvssData;
  const v2 = metrics.cvssMetricV2?.[0]?.cvssData;
  const data = v31 || v30 || v2;
  if (!data) return { score: null, severity: 'UNKNOWN', vector: null, impact: {} };

  return {
    score: data.baseScore ?? null,
    severity: data.baseSeverity || severityFromScore(data.baseScore),
    vector: data.vectorString || null,
    impact: {
      confidentiality: data.confidentialityImpact,
      integrity: data.integrityImpact,
      availability: data.availabilityImpact,
      attackVector: data.attackVector,
      attackComplexity: data.attackComplexity,
      privilegesRequired: data.privilegesRequired,
      userInteraction: data.userInteraction,
      scope: data.scope,
    },
  };
}

function severityFromScore(score) {
  if (score == null) return 'UNKNOWN';
  if (score >= 9) return 'CRITICAL';
  if (score >= 7) return 'HIGH';
  if (score >= 4) return 'MEDIUM';
  if (score > 0) return 'LOW';
  return 'NONE';
}

export function normalizeCve(item) {
  const cve = item.cve;
  const cvss = parseCvss(cve);
  const desc =
    cve.descriptions?.find((d) => d.lang === 'en')?.value ||
    cve.descriptions?.[0]?.value ||
    'No description available';

  const refs = (cve.references || []).slice(0, 15).map((r) => ({
    url: r.url,
    source: r.source,
    tags: r.tags || [],
  }));

  const categories = new Set();
  (cve.weaknesses || []).forEach((w) => {
    (w.description || []).forEach((d) => {
      if (d.value?.startsWith('CWE-')) categories.add(d.value);
    });
  });

  return {
    id: cve.id,
    description: desc,
    published: cve.published,
    lastModified: cve.lastModified,
    score: cvss.score,
    severity: cvss.severity,
    vector: cvss.vector,
    impact: cvss.impact,
    references: refs,
    categories: [...categories],
    sourceIdentifier: cve.sourceIdentifier,
    vulnStatus: cve.vulnStatus,
  };
}

async function fetchNvd(params) {
  const { data } = await client.get('', { params });
  const vulnerabilities = data.vulnerabilities || [];
  return {
    total: data.totalResults ?? vulnerabilities.length,
    results: vulnerabilities.map(normalizeCve),
  };
}

export async function getCveById(cveId) {
  const id = cveId.toUpperCase().replace(/^CVE-?/i, 'CVE-');
  const formatted = id.startsWith('CVE-') ? id : `CVE-${id}`;
  const { results } = await fetchNvd({ cveId: formatted });
  if (!results.length) {
    const err = new Error(`CVE not found: ${formatted}`);
    err.status = 404;
    throw err;
  }
  return results[0];
}

export async function searchCves({
  keyword,
  severity,
  pubStartDate,
  pubEndDate,
  resultsPerPage = 20,
  startIndex = 0,
}) {
  const params = {
    resultsPerPage: Math.min(resultsPerPage, 100),
    startIndex,
  };
  if (keyword) params.keywordSearch = keyword;
  if (pubStartDate) params.pubStartDate = pubStartDate;
  if (pubEndDate) params.pubEndDate = pubEndDate;

  const { total, results } = await fetchNvd(params);

  let filtered = results;
  if (severity) {
    const sev = severity.toUpperCase();
    filtered = results.filter((r) => r.severity === sev);
  }

  return { total: filtered.length, results: filtered, startIndex };
}

export async function getRecentCves(days = 7, limit = 50) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const fmt = (d) => d.toISOString().replace(/\.\d{3}Z$/, '.000');

  return searchCves({
    pubStartDate: fmt(start),
    pubEndDate: fmt(end),
    resultsPerPage: limit,
  });
}

export async function getDashboardData() {
  const recent = await getRecentCves(14, 100);
  const results = recent.results;

  const critical = results.filter((r) => r.severity === 'CRITICAL');
  const high = results.filter((r) => r.severity === 'HIGH');
  const medium = results.filter((r) => r.severity === 'MEDIUM');
  const low = results.filter((r) => r.severity === 'LOW');

  const severityDist = {
    CRITICAL: critical.length,
    HIGH: high.length,
    MEDIUM: medium.length,
    LOW: low.length,
    UNKNOWN: results.filter((r) => r.severity === 'UNKNOWN').length,
  };

  const categoryCount = {};
  results.forEach((r) => {
    r.categories.forEach((c) => {
      categoryCount[c] = (categoryCount[c] || 0) + 1;
    });
  });

  const trendingCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const attackVectors = {};
  results.forEach((r) => {
    const av = r.impact?.attackVector || 'UNKNOWN';
    attackVectors[av] = (attackVectors[av] || 0) + 1;
  });

  const scoreBuckets = { '0-3.9': 0, '4-6.9': 0, '7-8.9': 0, '9-10': 0, none: 0 };
  results.forEach((r) => {
    const s = r.score;
    if (s == null) scoreBuckets.none++;
    else if (s < 4) scoreBuckets['0-3.9']++;
    else if (s < 7) scoreBuckets['4-6.9']++;
    else if (s < 9) scoreBuckets['7-8.9']++;
    else scoreBuckets['9-10']++;
  });

  const insights = generateInsights(results, severityDist);

  return {
    latest: results.slice(0, 12),
    critical: critical.slice(0, 10),
    high: high.slice(0, 10),
    recent: results.slice(0, 15),
    statistics: {
      total: results.length,
      criticalCount: critical.length,
      highCount: high.length,
      mediumCount: medium.length,
      lowCount: low.length,
      avgScore:
        results.filter((r) => r.score != null).reduce((a, r) => a + r.score, 0) /
          (results.filter((r) => r.score != null).length || 1) || 0,
    },
    severityDist,
    trendingCategories,
    attackVectors,
    scoreBuckets,
    insights,
  };
}

function generateInsights(results, severityDist) {
  const insights = [];
  const critPct =
    results.length > 0
      ? ((severityDist.CRITICAL / results.length) * 100).toFixed(1)
      : 0;
  if (severityDist.CRITICAL > 0) {
    insights.push(
      `${severityDist.CRITICAL} critical vulnerabilities (${critPct}%) published in the last 14 days require immediate triage.`
    );
  }
  if (severityDist.HIGH > 5) {
    insights.push(
      `Elevated high-severity activity: ${severityDist.HIGH} high-rated CVEs detected in the monitoring window.`
    );
  }
  const network = results.filter((r) => r.impact?.attackVector === 'NETWORK').length;
  if (network > results.length * 0.3) {
    insights.push(
      `${network} vulnerabilities are network-exploitable — prioritize perimeter controls and exposure management.`
    );
  }
  if (insights.length === 0) {
    insights.push(
      'Threat landscape within normal parameters for the 14-day window. Continue routine vulnerability monitoring.'
    );
  }
  return insights;
}

export async function getTrendsAnalytics() {
  const recent = await getRecentCves(30, 100);
  const results = recent.results;

  const byDay = {};
  results.forEach((r) => {
    const day = r.published?.slice(0, 10) || 'unknown';
    if (!byDay[day]) byDay[day] = { date: day, count: 0, critical: 0, high: 0 };
    byDay[day].count++;
    if (r.severity === 'CRITICAL') byDay[day].critical++;
    if (r.severity === 'HIGH') byDay[day].high++;
  });

  const timeline = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));

  const mostSevere = [...results]
    .filter((r) => r.score != null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  const categoryCount = {};
  results.forEach((r) => {
    r.categories.forEach((c) => {
      categoryCount[c] = (categoryCount[c] || 0) + 1;
    });
  });

  return {
    timeline,
    mostSevere,
    recentlyPublished: results.slice(0, 20),
    trendingCategories: Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count })),
    attackVectorDist: aggregateAttackVectors(results),
    cvssDistribution: aggregateCvss(results),
    insights: generateInsights(results, {
      CRITICAL: results.filter((r) => r.severity === 'CRITICAL').length,
      HIGH: results.filter((r) => r.severity === 'HIGH').length,
      MEDIUM: results.filter((r) => r.severity === 'MEDIUM').length,
      LOW: results.filter((r) => r.severity === 'LOW').length,
      UNKNOWN: 0,
    }),
  };
}

function aggregateAttackVectors(results) {
  const map = {};
  results.forEach((r) => {
    const av = r.impact?.attackVector || 'UNKNOWN';
    map[av] = (map[av] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function aggregateCvss(results) {
  const buckets = [
    { range: '0.0-3.9', count: 0 },
    { range: '4.0-6.9', count: 0 },
    { range: '7.0-8.9', count: 0 },
    { range: '9.0-10.0', count: 0 },
  ];
  results.forEach((r) => {
    const s = r.score;
    if (s == null) return;
    if (s < 4) buckets[0].count++;
    else if (s < 7) buckets[1].count++;
    else if (s < 9) buckets[2].count++;
    else buckets[3].count++;
  });
  return buckets;
}
