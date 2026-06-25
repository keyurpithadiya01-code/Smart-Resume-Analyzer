import React from 'react';

export default function AdminStatCard({ title, value, icon, extra }) {
  return (
    <div className="card-glow flex flex-col justify-between h-[140px] relative overflow-hidden group hover:bg-[#161d26] transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border-[#232b35] bg-[#121820]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffa3]/5 rounded-full blur-2xl group-hover:bg-[#00ffa3]/10 transition-colors pointer-events-none"></div>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent via-[#00ffa3]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-sm"></div>
      
      <div className="flex items-start justify-between text-[#c9cbc5] mb-4 relative z-10">
        <div className="text-[#00ffa3] bg-[#00ffa3]/10 p-2 rounded-xl border border-[#00ffa3]/20 shadow-[0_0_15px_rgba(0,255,163,0.1)]">
          {icon}
        </div>
        {extra && <div className="text-sm font-medium">{extra}</div>}
      </div>
      <div className="mt-auto relative z-10">
        <div className="text-[32px] font-semibold text-white tracking-tight leading-none mb-1 group-hover:text-[#00ffa3] transition-colors drop-shadow-md">
          {value}
        </div>
        <div className="text-[14px] text-[#9ca3af] font-medium tracking-wide">{title}</div>
      </div>
    </div>
  );
}
