export default function CircularGauge({ score, label, sublabel, variant = 'scan', size = 'lg' }) {
  const pct = Math.min(100, Math.max(0, score || 0));
  const radius = size === 'sm' ? 36 : 52;
  const stroke = size === 'sm' ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const dim = size === 'sm' ? 96 : 128;
  const center = dim / 2;

  const strokeMap = {
    scan: 'url(#gaugeScan)',
    amber: 'url(#gaugeAmber)',
    muted: 'url(#gaugeMuted)',
    blue: 'url(#gaugeScan)',
    green: 'url(#gaugeScan)',
    purple: 'url(#gaugeMuted)',
  };
  const textColor = {
    scan: '#00ffa3',
    amber: '#ffb454',
    muted: '#6b7785',
    blue: '#00ffa3',
    green: '#00ffa3',
    purple: '#6b7785',
  }[variant] || '#00ffa3';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gaugeScan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffa3" />
            <stop offset="100%" stopColor="#33ffb5" />
          </linearGradient>
          <linearGradient id="gaugeAmber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb454" />
            <stop offset="100%" stopColor="#00ffa3" />
          </linearGradient>
          <linearGradient id="gaugeMuted" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b7785" />
            <stop offset="100%" stopColor="#232b35" />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#232b35" strokeWidth={stroke} />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={strokeMap[variant] || strokeMap.scan}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${size === 'sm' ? 'text-xl' : 'text-2xl'}`} style={{ color: textColor }}>
            {Math.round(pct)}
          </span>
          {size !== 'sm' && <span className="text-[10px] text-[#6b7785]">/100</span>}
        </div>
      </div>
      <span className="text-sm font-medium text-[#f0f0ec] mt-1">{label}</span>
      {sublabel && <span className="text-xs text-[#6b7785]">{sublabel}</span>}
    </div>
  );
}
