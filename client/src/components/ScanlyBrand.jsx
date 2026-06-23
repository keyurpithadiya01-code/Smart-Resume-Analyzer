export default function ScanlyBrand({ size = 'md', showTagline = false, className = '', taglineClass = '' }) {
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-[9px] h-[9px]';

  return (
    <div className={className}>
      <div className={`flex items-center gap-2.5 ${textSize}`}>
        <span className={`scanly-dot ${dotSize}`} />
        <span className="font-display font-bold gradient-text animate-blink-cyan">Scanly</span>
      </div>
      {showTagline && (
        <p className={`text-[11px] text-[#6b7785] mt-0.5 tracking-wide ml-[18px] ${taglineClass || ''}`}>Smart Resume Analyzer</p>
      )}
    </div>
  );
}
