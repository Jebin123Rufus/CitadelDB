export function severityBadge(severity) {
  const s = (severity || 'UNKNOWN').toUpperCase();
  if (s === 'CRITICAL') return 'badge-critical';
  if (s === 'HIGH') return 'badge-high';
  if (s === 'MEDIUM') return 'badge-medium';
  if (s === 'LOW') return 'badge-low';
  return 'px-2 py-0.5 text-xs rounded bg-gray-500/20 text-gray-400 border border-gray-500/30';
}

export function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
