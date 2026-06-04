import React from 'react';
import {
  Globe,
  Wifi,
  Terminal,
  Cpu,
  User,
  Server,
  ArrowRight,
  ShieldAlert,
  Zap,
  Lock,
  UserCheck,
  Eye,
  Edit3,
  Power,
} from 'lucide-react';

export default function VectorMap({ impact, severity }) {
  if (!impact || !impact.attackVector) {
    return (
      <div className="p-4 bg-citadel-900 border border-citadel-700/40 rounded-xl text-center text-xs text-gray-500">
        Exploit vector details not available.
      </div>
    );
  }

  const {
    attackVector = 'UNKNOWN',
    attackComplexity = 'UNKNOWN',
    privilegesRequired = 'UNKNOWN',
    userInteraction = 'UNKNOWN',
    confidentiality = 'UNKNOWN',
    integrity = 'UNKNOWN',
    availability = 'UNKNOWN',
  } = impact;

  // Attacker configuration
  let VectorIcon = Globe;
  let vectorLabel = 'Network (Internet)';
  let vectorDesc = 'Exploitable remotely over the open internet without local access.';
  let vectorColor = 'text-red-400 bg-red-500/10 border-red-500/20';

  if (attackVector === 'ADJACENT') {
    VectorIcon = Wifi;
    vectorLabel = 'Adjacent Network';
    vectorDesc = 'Requires shared local network (e.g. same subnet or Wi-Fi).';
    vectorColor = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
  } else if (attackVector === 'LOCAL') {
    VectorIcon = Terminal;
    vectorLabel = 'Local Console';
    vectorDesc = 'Requires local shell access or executing code directly on the host.';
    vectorColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  } else if (attackVector === 'PHYSICAL') {
    VectorIcon = Cpu;
    vectorLabel = 'Physical Device';
    vectorDesc = 'Requires direct physical hardware interaction with the machine.';
    vectorColor = 'text-green-400 bg-green-500/10 border-green-500/20';
  }

  // Privilege level
  let privilegeLabel = 'None';
  let privilegeDesc = 'No account credentials or privileges required to run exploit.';
  if (privilegesRequired === 'LOW') {
    privilegeLabel = 'Low Privileges';
    privilegeDesc = 'Requires a basic user or guest account.';
  } else if (privilegesRequired === 'HIGH') {
    privilegeLabel = 'High Privileges';
    privilegeDesc = 'Requires administrative or root privileges.';
  }

  // User Interaction
  let interactionLabel = 'None';
  let interactionDesc = 'Exploit runs silently without any victim intervention.';
  if (userInteraction === 'REQUIRED') {
    interactionLabel = 'Victim Required';
    interactionDesc = 'Requires victim to open a file, link, or click a button.';
  }

  return (
    <div className="p-5 bg-citadel-900 border border-citadel-700/40 rounded-xl space-y-4 backdrop-blur-sm">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Visual Exploit Vector Map</h3>

      {/* Exploit Flow Diagram */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-citadel-950 rounded-lg border border-citadel-800">
        {/* Step 1: Attacker */}
        <div className="flex flex-col items-center text-center max-w-[120px]">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
            <User className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1">Threat Actor</span>
          <span className="text-[9px] text-gray-500">Launches Exploit</span>
        </div>

        <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:block shrink-0" />

        {/* Step 2: Access Vector */}
        <div className={`flex flex-col items-center text-center p-3 rounded-lg border max-w-[150px] ${vectorColor}`}>
          <VectorIcon className="w-5 h-5" />
          <span className="text-[11px] font-bold mt-1">{vectorLabel}</span>
          <span className="text-[9px] opacity-80">Access Path</span>
        </div>

        <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:block shrink-0" />

        {/* Step 3: Vulnerable Target */}
        <div className="flex flex-col items-center text-center max-w-[120px]">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-400">
            <Server className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1">Target Software</span>
          <span className="text-[9px] text-gray-500">Unpatched System</span>
        </div>

        <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:block shrink-0" />

        {/* Step 4: Outcome */}
        <div className="flex flex-col items-center text-center max-w-[120px]">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1">System Impact</span>
          <span className="text-[9px] text-gray-500">Security Breach</span>
        </div>
      </div>

      {/* Exploit Requirements & Impacts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Requirements */}
        <div className="space-y-2 p-3 bg-citadel-950/50 rounded-lg border border-citadel-800">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Exploit Requirements</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <Lock className="w-4 h-4 text-citadel-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-300">{privilegeLabel}</p>
                <p className="text-[10px] text-gray-500">{privilegeDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <UserCheck className="w-4 h-4 text-citadel-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-300">{interactionLabel}</p>
                <p className="text-[10px] text-gray-500">{interactionDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <Zap className="w-4 h-4 text-citadel-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-300">Complexity: {attackComplexity}</p>
                <p className="text-[10px] text-gray-500">
                  {attackComplexity === 'LOW'
                    ? 'Can be executed reliably every time. No special conditions required.'
                    : 'Requires specialized timing, configurations, or race conditions.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Impacts */}
        <div className="space-y-2 p-3 bg-citadel-950/50 rounded-lg border border-citadel-800">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Security Impact Scope</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-citadel-800 pb-1.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-red-400" />
                <span className="font-medium text-gray-300">Confidentiality</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                confidentiality === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-800 text-zinc-400'
              }`}>{confidentiality}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-citadel-800 pb-1.5">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-400" />
                <span className="font-medium text-gray-300">Integrity (Data Alteration)</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                integrity === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-800 text-zinc-400'
              }`}>{integrity}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Power className="w-4 h-4 text-yellow-400" />
                <span className="font-medium text-gray-300">Availability (Downtime)</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                availability === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-800 text-zinc-400'
              }`}>{availability}</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-gray-600 leading-normal border-t border-citadel-800 pt-2">
        <strong>How to read:</strong> Threat actors use the Access Path to compromise target software. Low complexity, high impact, and no user interaction represent the highest threat score.
      </p>
    </div>
  );
}
