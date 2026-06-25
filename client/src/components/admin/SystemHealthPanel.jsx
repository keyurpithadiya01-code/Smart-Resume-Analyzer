import React from 'react';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';

export default function SystemHealthPanel({ issues = [], chartData = [], searchQuery, setSearchQuery }) {
  const isHealthy = issues.length === 0;

  return (
    <div className="card shadow-[0_8px_32px_rgba(0,0,0,0.4)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border-[#232b35] bg-[#121820]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <h2 className="text-[16px] font-semibold text-white whitespace-nowrap">System health</h2>
          <div className={`px-4 py-2 rounded-full border text-[13px] font-medium flex items-center gap-2.5 shadow-lg ${
            isHealthy 
              ? 'bg-[#00ffa3]/5 border-[#00ffa3]/20 text-[#00ffa3] shadow-[0_0_15px_rgba(0,255,163,0.05)]' 
              : 'bg-[#ffb454]/5 border-[#ffb454]/20 text-[#ffb454] shadow-[0_0_15px_rgba(255,180,84,0.05)]'
          }`}>
            {isHealthy ? (
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ffa3] shadow-[0_0_8px_rgba(0,255,163,0.8)]"></span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffb454] animate-pulse shadow-[0_0_8px_rgba(255,180,84,0.8)]"></span>
            )}
            {isHealthy ? 'No active issues - all services nominal' : `Degraded — ${issues.length} active issue${issues.length === 1 ? '' : 's'}`}
          </div>
        </div>

        {/* Search Pill incorporated here */}
        <div className="relative group w-full md:w-[320px]">
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161d26] border border-[#232b35] text-white text-sm font-medium rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#00ffa3] placeholder:text-[#6b7785] hover:border-[#374151] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-all"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7785] group-hover:text-[#00ffa3] transition-colors pointer-events-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#161d26] border border-[#232b35] rounded-xl p-5 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Operation Stability</h3>
            <span className="text-[12px] text-[#9ca3af]">Last 7 days</span>
          </div>
          <div className="h-[140px] w-full">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1f26', borderColor: '#30363d', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                    itemStyle={{ color: '#00ffa3' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="errors" 
                    stroke="#00ffa3" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 4, fill: '#00ffa3', stroke: '#1c1f26', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#6b7785]">
                <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <p className="text-[13px] font-medium">Insufficient data for chart</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#161d26] border border-[#232b35] rounded-xl p-5 overflow-y-auto max-h-[220px] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] custom-scrollbar">
          <h3 className="text-sm font-medium text-white mb-4 sticky top-0 bg-[#161d26] z-10 pb-2">Active Issues</h3>
          {isHealthy ? (
            <div className="flex flex-col items-center justify-center text-center h-[100px] text-[#9ca3af]">
              <div className="w-10 h-10 rounded-full bg-[#00ffa3]/10 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#00ffa3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-sm font-medium">No critical issues</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue, idx) => (
                <div key={idx} className="flex gap-3 items-start border-b border-[#232b35]/50 last:border-0 pb-3 last:pb-0">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${issue.severity === 'error' ? 'bg-[#ff453a]' : 'bg-[#ffb454]'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#c9cbc5] truncate">{issue.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] font-mono text-[#6b7785] bg-[#1a2238] px-1.5 py-0.5 rounded">{issue.service}</span>
                      <span className="text-[11px] text-[#6b7785]">{issue.timeAgo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
