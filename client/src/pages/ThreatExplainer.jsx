import { useState } from 'react';
import { BookOpen, Sparkles, HelpCircle, ChevronDown, ChevronUp, Target, Search, ShieldAlert, Cpu } from 'lucide-react';
import { api } from '../api/client';
import MarkdownView from '../components/MarkdownView';
import Loading from '../components/Loading';
import SeverityBadge from '../components/SeverityBadge';
import GlossaryTerm from '../components/GlossaryTerm';
import CveSearchHelper from '../components/CveSearchHelper';

export default function ThreatExplainer() {
  const [cveId, setCveId] = useState('');
  const [cve, setCve] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  async function handleExplain(e) {
    e?.preventDefault();
    if (!cveId.trim()) return;
    setLoading(true);
    setError(null);
    setExplanation(null);
    setCve(null);
    setActiveStep(1);
    try {
      const data = await api.ai.explain({ cveId: cveId.trim() });
      setCve(data.cve);
      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const stepsData = cve
    ? [
        {
          num: 1,
          title: 'Reconnaissance',
          subtitle: 'Target Identification',
          desc: 'Attacker scans for active hosts running software vulnerable to this vulnerability. Identifies port exposures or specific header patterns.',
          mitigation: 'Implement IP filtering, disable open version banners, and run vulnerability scans regularly.',
        },
        {
          num: 2,
          title: 'Weaponization',
          subtitle: 'Exploit Packaging',
          desc: `Attacker designs or obtains an exploit matching the ${cve.impact?.attackComplexity || 'Low'} complexity parameters and targets specific library triggers.`,
          mitigation: 'Use Intrusion Detection Systems (IDS) signature rules to identify known exploit code patterns.',
        },
        {
          num: 3,
          title: 'Exploitation',
          subtitle: 'Access Execution',
          desc: `Payload is delivered via the ${cve.impact?.attackVector || 'NETWORK'} exploit path. The vulnerability triggers, causing unauthorized operations.`,
          mitigation: 'Patch vulnerable software immediately. Restrict host permissions using least privilege policies.',
        },
        {
          num: 4,
          title: 'Impact',
          subtitle: 'Goal Accomplishment',
          desc: `Exploit succeeds. Targets confidentiality (${cve.impact?.confidentiality || 'HIGH'}), integrity (${cve.impact?.integrity || 'HIGH'}), and availability (${cve.impact?.availability || 'HIGH'}).`,
          mitigation: 'Establish database backups, segment critical networks, and run real-time endpoint monitoring.',
        },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-citadel-purple" />
          <div>
            <h1 className="text-2xl font-bold text-white">Threat Explainer</h1>
            <p className="text-gray-500 text-sm">
              Visual attack flow animations and explanations for CVE vulnerabilities
            </p>
          </div>
        </div>
      </header>

      {/* Developer & Analyst Guide */}
      <DeveloperGuide />

      {/* Exploit Target Inputs */}
      <div className="panel p-5 border-citadel-purple/20 space-y-4">
        <form onSubmit={handleExplain} className="flex gap-3">
          <input
            className="input-field flex-1 font-mono text-base uppercase"
            placeholder="Enter CVE ID (e.g. CVE-2024-21413)"
            value={cveId}
            onChange={(e) => setCveId(e.target.value)}
          />
          <button type="submit" disabled={loading || !cveId.trim()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Sparkles className="w-4 h-4" />
            Explain Threat
          </button>
        </form>

        {/* Search Assistant Component */}
        <CveSearchHelper
          onSelect={(selectedId) => {
            setCveId(selectedId);
            lookupDirectly(selectedId);
          }}
        />
      </div>

      {error && <div className="panel p-4 text-red-400">{error}</div>}
      {loading && <Loading text="Building visual attack path and analysis..." />}

      {cve && (
        <div className="space-y-6 animate-slide-up">
          {/* Interactive SVG Attack Flow Map */}
          <div className="panel p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 text-center sm:text-left">
              Interactive Attack Path Diagram (Click a Node to Explore)
            </h3>

            {/* Horizontal Flow Map */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 px-4 bg-citadel-950 rounded-xl border border-citadel-800 relative">
              {stepsData.map((step, index) => {
                const isActive = activeStep === step.num;
                return (
                  <div
                    key={step.num}
                    className="flex-1 flex flex-col md:flex-row items-center w-full md:w-auto"
                  >
                    {/* Node Button */}
                    <button
                      onClick={() => setActiveStep(step.num)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 w-44 ${
                        isActive
                          ? 'bg-citadel-accent/15 border-citadel-accent shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                          : 'bg-citadel-900 border-citadel-800 hover:border-citadel-700 text-gray-400'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isActive ? 'bg-citadel-accent text-white' : 'bg-citadel-800 text-gray-400'
                        }`}
                      >
                        {step.num}
                      </div>
                      <span className={`text-xs font-bold mt-2 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {step.title}
                      </span>
                      <span className="text-[9px] text-gray-500 mt-0.5">{step.subtitle}</span>
                    </button>

                    {/* Flow Arrow */}
                    {index < stepsData.length - 1 && (
                      <div className="flex items-center justify-center w-full md:w-auto my-2 md:my-0 md:flex-1">
                        <div
                          className={`h-0.5 w-8 md:w-full max-w-[80px] transition-colors duration-500 ${
                            activeStep > step.num ? 'bg-citadel-accent' : 'bg-citadel-800'
                          }`}
                        />
                        <span
                          className={`text-[8px] mx-1 md:-ml-6 md:mr-0 font-bold ${
                            activeStep > step.num ? 'text-citadel-accent' : 'text-zinc-700'
                          }`}
                        >
                          ➔
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Display Selected Stage Info */}
            <div className="mt-4 p-4 rounded-xl bg-citadel-950 border border-citadel-800 grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <span className="text-[10px] uppercase font-bold text-citadel-accent tracking-wider bg-citadel-accent/10 px-2.5 py-0.5 rounded-full border border-citadel-accent/20">
                  Stage {activeStep}: {stepsData[activeStep - 1].title}
                </span>
                <p className="text-sm text-gray-300 leading-relaxed font-sans pt-1">
                  {stepsData[activeStep - 1].desc}
                </p>
              </div>
              <div className="p-3 bg-citadel-900 border border-citadel-800 rounded-lg flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Recommended defense</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {stepsData[activeStep - 1].mitigation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="panel p-4 flex flex-wrap items-center gap-5 justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-citadel-accent text-lg font-bold">{cve.id}</span>
              <SeverityBadge severity={cve.severity} />
            </div>
            <div className="flex gap-4 text-xs text-gray-400 font-mono">
              <span>CVSS: {cve.score}</span>
              <span>Vector: {cve.impact?.attackVector || 'N/A'}</span>
            </div>
          </div>

          {/* AI Generated Textual Details */}
          {explanation && (
            <div className="panel p-6 space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-citadel-800 pb-2 mb-2">
                AI Exploit Walkthrough & Remediation Guide
              </h3>
              <MarkdownView content={explanation} />
            </div>
          )}
        </div>
      )}
    </div>
  );

  async function lookupDirectly(id) {
    setLoading(true);
    setError(null);
    setExplanation(null);
    setCve(null);
    setActiveStep(1);
    try {
      const data = await api.ai.explain({ cveId: id });
      setCve(data.cve);
      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
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
          <HelpCircle className="w-4 h-4 text-citadel-purple" />
          Developer & Analyst Guide: What is an Attack Flow?
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="p-5 border-t border-citadel-700/30 space-y-3 bg-citadel-950/40 leading-relaxed text-gray-400">
          <p>
            Welcome to the <strong>Threat Explainer</strong>! This module translates technical CVE parameters into a step-by-step
            recreation of a cyberattack using the standard <strong>Cyber Kill Chain</strong> model.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-white mb-1">Attack Stages Explained:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>1. Recon:</strong> Scans and identifies unpatched software versions.</li>
                <li><strong>2. Weaponize:</strong> Tailors an exploit bundle matching vulnerability constraints.</li>
                <li><strong>3. Exploit:</strong> Delivers the exploit to hijack or crash targeted processes.</li>
                <li><strong>4. Impact:</strong> Extracts files, modifies systems, or causes severe downtime.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Educational Value:</h4>
              <p>
                By mapping these steps, developers learn which defenses (like firewall rule changes or input sanitization) prevent
                compromise at various stages of the exploit cycle.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
