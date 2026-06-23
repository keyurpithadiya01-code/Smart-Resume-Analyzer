import { useEffect, useState } from 'react';

export default function MetricBar({ label, value, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const pct = Math.min(100, Math.max(0, value || 0));

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 120 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="metric-row-app">
      <span className="mlabel">{label}</span>
      <div className="metric-bar-wrap-app">
        <div className="metric-bar-app" style={{ width: `${width}%` }} />
      </div>
      <span className="metric-val-app">{Math.round(pct)}%</span>
    </div>
  );
}
