export default function ResumeComparison({ originalText, optimizedJson }) {
  if (!originalText || !optimizedJson) return null;

  return (
    <div className="mt-8 flex flex-col md:flex-row gap-6">
      <div className="flex-1 bg-[#161d26] p-5 rounded-xl border border-[#232b35] overflow-y-auto max-h-[600px] shadow-lg">
        <h3 className="text-lg text-[#f0f0ec] font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span> Original Resume
        </h3>
        <div className="text-sm text-[#c9cbc5] whitespace-pre-wrap font-mono bg-[#1a1d22] p-4 rounded-lg border border-[#2c333e]">
          {originalText}
        </div>
      </div>
      
      <div className="flex-1 bg-[#161d26] p-5 rounded-xl border border-[#00ffa3]/30 overflow-y-auto max-h-[600px] shadow-[0_0_15px_rgba(0,255,163,0.1)]">
        <h3 className="text-lg text-[#00ffa3] font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse"></span> Optimized ATS Output
        </h3>
        <pre className="text-xs text-[#00ffa3] bg-[#0a0f16] p-4 rounded-lg border border-[#00ffa3]/20 overflow-x-auto">
          {JSON.stringify(optimizedJson, null, 2)}
        </pre>
      </div>
    </div>
  );
}
