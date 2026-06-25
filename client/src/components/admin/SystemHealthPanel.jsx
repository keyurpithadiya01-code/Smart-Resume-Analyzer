import React from 'react';

export default function SystemHealthPanel({ issues = [] }) {
  const isHealthy = issues.length === 0;

  return (
    <div className="border border-[#30363d] rounded-2xl p-5 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[16px] font-semibold text-[#f0f6fc]">System health</h2>
        <div className={`px-3 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-2 ${
          isHealthy 
            ? 'border-[#30363d] text-[#8b949e]' 
            : 'border-[#30363d] text-[#8b949e]' // The image shows grey text and border even for degraded, with a dot
        }`}>
          <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-[#00ffa3]' : 'bg-[#8b949e]'}`}></span>
          {isHealthy ? 'All systems operational' : `Degraded — ${issues.length} active issue${issues.length === 1 ? '' : 's'}`}
        </div>
      </div>

      <div className="space-y-5">
        {isHealthy ? (
          <div className="text-[#8b949e] text-sm">No active issues — all services nominal</div>
        ) : (
          issues.map((issue, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#8b949e] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {issue.severity === 'critical' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                )}
              </svg>
              <div>
                <div className="text-[#f0f6fc] text-[15px] font-medium leading-snug">
                  {issue.title} <span className="text-[#8b949e] font-normal">— {issue.description}</span>
                </div>
                <div className="text-[#8b949e] text-[13px] mt-1">
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
