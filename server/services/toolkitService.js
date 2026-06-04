export function explainCvss(vectorOrScore) {
  const input = String(vectorOrScore).trim();

  if (/^\d+(\.\d+)?$/.test(input)) {
    const score = parseFloat(input);
    return {
      score,
      severity: scoreToSeverity(score),
      explanation: severityExplanation(score),
      metrics: null,
    };
  }

  const metrics = parseVector(input);
  const score = estimateFromVector(metrics);
  return {
    score,
    severity: scoreToSeverity(score),
    metrics,
    explanation: buildVectorExplanation(metrics),
  };
}

function scoreToSeverity(score) {
  if (score >= 9) return 'CRITICAL';
  if (score >= 7) return 'HIGH';
  if (score >= 4) return 'MEDIUM';
  if (score > 0) return 'LOW';
  return 'NONE';
}

function severityExplanation(score) {
  const sev = scoreToSeverity(score);
  const texts = {
    CRITICAL: 'Immediate emergency response. Exploitation may cause full system compromise with minimal complexity.',
    HIGH: 'Prioritize patching within days. Significant impact to confidentiality, integrity, or availability.',
    MEDIUM: 'Schedule remediation in normal patch cycles. May require additional conditions to exploit.',
    LOW: 'Limited impact. Address during routine maintenance.',
    NONE: 'No measurable CVSS base score.',
  };
  return { severity: sev, narrative: texts[sev] };
}

function parseVector(vector) {
  const parts = {};
  const pairs = vector.match(/[A-Z]+:[A-Z]+/g) || [];
  pairs.forEach((p) => {
    const [k, v] = p.split(':');
    parts[k] = v;
  });
  return parts;
}

function estimateFromVector(m) {
  let score = 5.0;
  if (m.AV === 'N') score += 1.5;
  if (m.AC === 'L') score += 0.5;
  if (m.PR === 'N') score += 0.5;
  if (m.UI === 'N') score += 0.5;
  if (m.C === 'H') score += 1;
  if (m.I === 'H') score += 1;
  if (m.A === 'H') score += 1;
  return Math.min(10, Math.round(score * 10) / 10);
}

function buildVectorExplanation(m) {
  const labels = {
    AV: { N: 'Network — exploitable remotely', A: 'Adjacent network', L: 'Local', P: 'Physical' },
    AC: { L: 'Low complexity', H: 'High complexity' },
    PR: { N: 'No privileges required', L: 'Low privileges', H: 'High privileges' },
    UI: { N: 'No user interaction', R: 'Requires user interaction' },
    S: { U: 'Unchanged scope', C: 'Changed scope — can affect other components' },
    C: { N: 'No confidentiality impact', L: 'Low', H: 'High confidentiality impact' },
    I: { N: 'No integrity impact', L: 'Low', H: 'High integrity impact' },
    A: { N: 'No availability impact', L: 'Low', H: 'High availability impact' },
  };

  const breakdown = Object.entries(m).map(([key, val]) => ({
    metric: key,
    value: val,
    meaning: labels[key]?.[val] || val,
  }));

  return {
    severity: scoreToSeverity(estimateFromVector(m)),
    narrative: 'Parsed CVSS vector string. Official scores should be taken from NVD when available.',
    breakdown,
  };
}

export function identifyHash(value) {
  const v = value.trim().toLowerCase();
  const len = v.length;
  const hex = /^[a-f0-9]+$/.test(v);

  if (!hex) return { valid: false, type: null, message: 'Not a valid hexadecimal hash' };

  const types = {
    32: 'MD5',
    40: 'SHA-1',
    64: 'SHA-256',
    128: 'SHA-512',
  };

  const type = types[len];
  if (!type) {
    return {
      valid: false,
      type: null,
      message: `Unrecognized hash length (${len} chars). Common: MD5(32), SHA-1(40), SHA-256(64)`,
    };
  }

  const security = {
    MD5: 'Cryptographically broken — do not use for security',
    'SHA-1': 'Deprecated for collision resistance',
    'SHA-256': 'Secure for integrity verification',
    'SHA-512': 'Secure, larger output',
  };

  return {
    valid: true,
    type,
    length: len,
    securityNote: security[type],
    useCases: getHashUseCases(type),
  };
}

function getHashUseCases(type) {
  const cases = {
    MD5: ['Legacy file identification only', 'Not for passwords or signatures'],
    'SHA-1': ['Legacy Git commits', 'Being phased out'],
    'SHA-256': ['Malware IOCs', 'File integrity', 'Blockchain'],
    'SHA-512': ['High-security integrity checks', 'Password hashing (with proper KDF)'],
  };
  return cases[type] || [];
}

export function analyzeUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, risks: ['Invalid URL format'], score: 0 };
  }

  const risks = [];
  let score = 100;

  if (parsed.protocol === 'http:') {
    risks.push({ level: 'HIGH', message: 'Unencrypted HTTP — credentials and data exposed in transit' });
    score -= 30;
  }

  if (parsed.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    risks.push({ level: 'MEDIUM', message: 'IP-based URL — often used in phishing' });
    score -= 15;
  }

  if (parsed.hostname.length > 50) {
    risks.push({ level: 'MEDIUM', message: 'Unusually long hostname' });
    score -= 10;
  }

  if (/@/.test(url)) {
    risks.push({ level: 'HIGH', message: '@ symbol may hide true destination (credential phishing)' });
    score -= 25;
  }

  const suspiciousPorts = ['8080', '8443', '4444', '1337'];
  if (parsed.port && suspiciousPorts.includes(parsed.port)) {
    risks.push({ level: 'LOW', message: `Non-standard port ${parsed.port}` });
    score -= 5;
  }

  const path = parsed.pathname.toLowerCase();
  if (/\.(exe|dll|bat|cmd|ps1|vbs|scr|msi|jar)$/.test(path)) {
    risks.push({ level: 'CRITICAL', message: 'URL serves executable content' });
    score -= 40;
  }

  if (/login|signin|account|password|secure|update|verify/i.test(path + parsed.hostname)) {
    risks.push({ level: 'MEDIUM', message: 'Credential-harvesting keywords detected' });
    score -= 10;
  }

  return {
    valid: true,
    hostname: parsed.hostname,
    protocol: parsed.protocol,
    port: parsed.port || (parsed.protocol === 'https:' ? '443' : '80'),
    path: parsed.pathname,
    risks,
    riskScore: Math.max(0, score),
    rating: score >= 80 ? 'Lower Risk' : score >= 50 ? 'Moderate Risk' : 'High Risk',
  };
}

export function analyzePassword(password) {
  let score = 0;
  const feedback = [];

  if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  else feedback.push('Use at least 12 characters');

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
  else feedback.push('Mix uppercase and lowercase');

  if (/\d/.test(password)) score += 15;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  else feedback.push('Include special characters');

  const common = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (common.some((c) => password.toLowerCase().includes(c))) {
    score -= 30;
    feedback.push('Avoid common dictionary words');
  }

  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Avoid repeated character sequences');
  }

  const entropy = estimateEntropy(password);
  if (entropy < 40) feedback.push('Low entropy — predictable patterns');

  score = Math.max(0, Math.min(100, score));

  const strength =
    score >= 80 ? 'Strong' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Weak';

  return {
    score,
    strength,
    length: password.length,
    entropy: Math.round(entropy),
    feedback,
    estimatedCrackTime: crackTimeEstimate(entropy),
  };
}

function estimateEntropy(str) {
  let charset = 0;
  if (/[a-z]/.test(str)) charset += 26;
  if (/[A-Z]/.test(str)) charset += 26;
  if (/\d/.test(str)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(str)) charset += 32;
  return str.length * Math.log2(charset || 1);
}

function crackTimeEstimate(entropy) {
  if (entropy > 80) return 'Centuries+ at 10B guesses/sec';
  if (entropy > 60) return 'Years to decades';
  if (entropy > 40) return 'Days to months';
  return 'Seconds to hours';
}

export async function analyzeSecurityHeaders(url) {
  let targetUrl = url;
  if (!/^https?:\/\//i.test(url)) targetUrl = `https://${url}`;

  try {
    const res = await fetch(targetUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    const headers = {};
    res.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });

    const checks = [
      {
        name: 'Strict-Transport-Security',
        present: !!headers['strict-transport-security'],
        recommendation: 'Enforce HTTPS with HSTS max-age ≥ 31536000',
      },
      {
        name: 'Content-Security-Policy',
        present: !!headers['content-security-policy'],
        recommendation: 'Mitigate XSS with restrictive CSP',
      },
      {
        name: 'X-Frame-Options',
        present: !!headers['x-frame-options'],
        recommendation: 'Prevent clickjacking (DENY or SAMEORIGIN)',
      },
      {
        name: 'X-Content-Type-Options',
        present: !!headers['x-content-type-options'],
        recommendation: 'Set nosniff to prevent MIME sniffing',
      },
      {
        name: 'Referrer-Policy',
        present: !!headers['referrer-policy'],
        recommendation: 'Control referrer leakage',
      },
      {
        name: 'Permissions-Policy',
        present: !!(headers['permissions-policy'] || headers['feature-policy']),
        recommendation: 'Restrict browser features (camera, geolocation, etc.)',
      },
    ];

    const score = Math.round((checks.filter((c) => c.present).length / checks.length) * 100);

    return {
      url: targetUrl,
      status: res.status,
      score,
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
      checks,
      rawHeaders: headers,
    };
  } catch (err) {
    return {
      url: targetUrl,
      error: err.message,
      checks: [],
      score: 0,
      grade: 'F',
    };
  }
}
