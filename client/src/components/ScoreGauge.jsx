import CircularGauge from './CircularGauge';

export default function ScoreGauge({ score, label }) {
  const pct = score || 0;
  const variant = pct >= 70 ? 'scan' : pct >= 50 ? 'amber' : 'muted';
  return <CircularGauge score={pct} label={label} variant={variant} size="sm" />;
}
