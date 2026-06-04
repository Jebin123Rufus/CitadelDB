const PRIVATE_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^169\.254\./,
];

export function detectIocType(value) {
  const v = value.trim();
  if (/^[a-fA-F0-9]{32}$/.test(v)) return 'MD5';
  if (/^[a-fA-F0-9]{40}$/.test(v)) return 'SHA1';
  if (/^[a-fA-F0-9]{64}$/.test(v)) return 'SHA256';
  if (/^https?:\/\//i.test(v)) return 'URL';
  if (
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(
      v
    )
  )
    return 'IP';
  if (/^[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}$/.test(v)) return 'Domain';
  return 'Unknown';
}

export function analyzeIocHeuristics(value, type) {
  const risks = [];
  let classification = 'Unknown';
  let reputation = 'Unverified';
  let riskLevel = 'LOW';

  if (type === 'IP') {
    const isPrivate = PRIVATE_RANGES.some((r) => r.test(value));
    if (isPrivate) {
      classification = 'Internal/Private IP';
      reputation = 'Benign (RFC1918)';
      riskLevel = 'INFO';
    } else {
      classification = 'Public IPv4 Address';
      reputation = 'Requires external threat intel verification';
      riskLevel = 'MEDIUM';
      risks.push('Public IPs require correlation with threat feeds and internal logs');
    }
  } else if (type === 'Domain') {
    const suspiciousTlds = /\.(xyz|top|club|work|gq|tk|ml|cf|ga)$/i;
    const hasSuspiciousPattern = /\d{3,}|login-|secure-|update-|account-/i.test(value);
    classification = 'Domain Name';
    if (suspiciousTlds.test(value) || hasSuspiciousPattern) {
      reputation = 'Potentially suspicious patterns detected';
      riskLevel = 'MEDIUM';
      risks.push('Suspicious TLD or typosquatting-style subdomain pattern');
    } else {
      reputation = 'No obvious heuristic red flags';
      riskLevel = 'LOW';
    }
    risks.push('Check WHOIS, DNS history, passive DNS, and certificate transparency');
  } else if (type === 'URL') {
    classification = 'URL';
    const parsed = safeParseUrl(value);
    if (parsed?.protocol === 'http:') risks.push('Uses unencrypted HTTP');
    if (/@/.test(parsed?.pathname || value)) risks.push('Possible URL obfuscation with @ symbol');
    if (/\.(exe|dll|bat|ps1|vbs|scr|js)$/i.test(value)) {
      risks.push('Points to executable or script extension');
      riskLevel = 'HIGH';
      reputation = 'High-risk file extension in URL path';
    } else {
      reputation = 'Requires sandbox and reputation service lookup';
      riskLevel = 'MEDIUM';
    }
  } else if (['MD5', 'SHA1', 'SHA256'].includes(type)) {
    classification = `File Hash (${type})`;
    reputation = 'Submit to VirusTotal, MalwareBazaar, or internal sandbox';
    riskLevel = 'MEDIUM';
    risks.push('Hash-only analysis cannot determine prevalence without threat feeds');
    if (type === 'MD5') risks.push('MD5 is deprecated for security use — prefer SHA256');
  }

  return {
    ioc: value,
    type,
    classification,
    reputation,
    riskLevel,
    riskIndicators: risks,
    recommendations: getRecommendations(type),
  };
}

function safeParseUrl(str) {
  try {
    return new URL(str);
  } catch {
    return null;
  }
}

function getRecommendations(type) {
  const base = [
    'Correlate with SIEM/EDR telemetry',
    'Check blocklists and threat intelligence platforms',
    'Document findings in incident ticket',
  ];
  const byType = {
    IP: ['Review firewall/proxy logs', 'Check geolocation and ASN', 'Hunt for lateral movement'],
    Domain: ['Inspect DNS queries', 'Review email gateway logs', 'Check certificate issuance'],
    URL: ['Sandbox URL in isolated environment', 'Extract indicators from page/network traffic'],
    MD5: ['Query multi-engine scanners', 'Hunt for file hash in endpoint telemetry'],
    SHA1: ['Query multi-engine scanners', 'Hunt for file hash in endpoint telemetry'],
    SHA256: ['Query multi-engine scanners', 'Hunt for file hash in endpoint telemetry'],
  };
  return [...base, ...(byType[type] || [])];
}
