import React from 'react';

export default function CvssGauge({ score }) {
  const numScore = typeof score === 'number' ? score : parseFloat(score) || 0;
  const percentage = Math.min(100, Math.max(0, numScore * 10));

  let strokeColor = 'stroke-zinc-600';
  let textColor = 'text-zinc-400';
  let badgeColor = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  let label = 'NONE';

  if (numScore >= 9.0) {
    strokeColor = 'stroke-red-500';
    textColor = 'text-red-400';
    badgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';
    label = 'CRITICAL';
  } else if (numScore >= 7.0) {
    strokeColor = 'stroke-orange-500';
    textColor = 'text-orange-400';
    badgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    label = 'HIGH';
  } else if (numScore >= 4.0) {
    strokeColor = 'stroke-yellow-500';
    textColor = 'text-yellow-400';
    badgeColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    label = 'MEDIUM';
  } else if (numScore > 0) {
    strokeColor = 'stroke-green-500';
    textColor = 'text-green-400';
    badgeColor = 'bg-green-500/10 text-green-400 border-green-500/30';
    label = 'LOW';
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-citadel-900 border border-citadel-700/40 rounded-xl backdrop-blur-sm w-full max-w-[180px] mx-auto">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-citadel-800"
            strokeWidth="7"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`transition-all duration-700 ease-out ${strokeColor}`}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white font-mono leading-none">{numScore.toFixed(1)}</span>
          <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">CVSS</span>
        </div>
      </div>
      <div className={`mt-3 px-3 py-0.5 text-[10px] font-bold rounded-full border tracking-wide uppercase ${badgeColor}`}>
        {label}
      </div>
    </div>
  );
}
