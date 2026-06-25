import React from 'react';

export default function SystemHealthPanel({ issues = [] }) {
  const isHealthy = issues.length === 0;

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[16px] font-semibold text-white">System health</h2>
        <div className={`px-3 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-2 ${
          isHealthy 
            ? 'bg-[#00ffa3]/10 border-[#00ffa3]/20 text-[#00ffa3]' 
            : 'bg-[#ffb454]/10 border-[#ffb454]/20 text-[#ffb454]'
        }`}>
          {isHealthy ? (
            <span className="w-2 h-2 rounded-full bg-[#00ffa3] scanly-dot"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-[#ffb454] animate-pulse"></span>
          )}
          {isHealthy ? 'All systems operational' : `Degraded — ${issues.length} active issue${issues.length === 1 ? '' : 's'}`}
        </div>
      </div>

      <div className="space-y-5">
        {isHealthy ? (
          <div className="text-[#9ca3af] text-sm">No active issues — all services nominal</div>
        ) : (
          issues.map((issue, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-[#161d26] p-4 rounded-xl border border-[#232b35] hover:border-[#ffb454]/30 transition-colors">
              <svg className="w-5 h-5 text-[#ffb454] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <div className="text-white text-[15px] font-medium leading-snug">
                  {issue.title} <span className="text-[#9ca3af] font-normal">— {issue.description}</span>
                </div>
                <div className="text-[#6b7785] text-[13px] mt-1 font-mono">
                  {issue.service} · {issue.timeAgo}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
