import { useState } from 'react';

const DEFINITIONS = {
  cve: {
    title: 'Common Vulnerabilities and Exposures (CVE)',
    desc: 'A standardized catalog of publicly disclosed cybersecurity vulnerabilities. Each entry is assigned a unique tracking ID (e.g., CVE-2024-21413).',
  },
  cvss: {
    title: 'Common Vulnerability Scoring System (CVSS)',
    desc: 'An industry standard (0.0 to 10.0) measuring a vulnerability\'s severity. Higher scores represent higher exploitability and impact.',
  },
  cwe: {
    title: 'Common Weakness Enumeration (CWE)',
    desc: 'A community-developed list of common software and hardware security weaknesses (e.g., CWE-89 for SQL Injection, CWE-79 for XSS).',
  },
  'mitre att&ck': {
    title: 'MITRE ATT&CK Framework',
    desc: 'A globally-accessible knowledge base of adversary tactics, techniques, and procedures (TTPs) based on real-world cyberattacks.',
  },
  tactic: {
    title: 'Tactical Goal (MITRE)',
    desc: 'The immediate objective of the threat actor (e.g., "Initial Access" to enter the network or "Exfiltration" to steal data).',
  },
  technique: {
    title: 'Attack Method (MITRE)',
    desc: 'The specific technique used by the attacker to achieve a tactical goal (e.g., using "Phishing" to achieve "Initial Access").',
  },
  ioc: {
    title: 'Indicator of Compromise (IOC)',
    desc: 'Forensic evidence of a potential security breach, such as malicious IP addresses, domain names, file hashes, or suspicious URLs.',
  },
  hash: {
    title: 'Cryptographic Hash',
    desc: 'A unique digital fingerprint of a file (e.g., SHA-256 or MD5). Used to verify file integrity and identify malware binaries.',
  },
  nvd: {
    title: 'National Vulnerability Database (NVD)',
    desc: 'The U.S. government repository of standards-based vulnerability management data synced with the CVE list.',
  },
  vector: {
    title: 'CVSS Vector String',
    desc: 'A shorthand text representation of the CVSS metrics (e.g., "AV:N" means Attack Vector is Network) used to calculate the score.',
  },
  'attack vector': {
    title: 'Attack Vector',
    desc: 'The path or method by which an attacker reaches and exploits a vulnerability (e.g., Network/Remote vs. Local console).',
  },
};

export default function GlossaryTerm({ term, children }) {
  const key = term.toLowerCase().trim();
  const definition = DEFINITIONS[key] || { title: term, desc: 'Cybersecurity metric/vocabulary term.' };

  return (
    <span className="relative group inline-block cursor-help border-b border-dashed border-citadel-accent/60 hover:text-citadel-accent transition-colors">
      {children || term}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-citadel-900 border border-citadel-700/80 rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 text-left normal-case font-sans">
        <h4 className="text-xs font-bold text-white mb-1">{definition.title}</h4>
        <p className="text-[11px] text-gray-400 leading-normal">{definition.desc}</p>
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-citadel-900 filter drop-shadow-[0_1px_0_rgba(255,255,255,0.1)]"></span>
      </span>
    </span>
  );
}
