import { severityBadge } from '../utils/severity';

export default function SeverityBadge({ severity }) {
  return (
    <span className={severityBadge(severity)}>
      {severity || 'UNKNOWN'}
    </span>
  );
}
