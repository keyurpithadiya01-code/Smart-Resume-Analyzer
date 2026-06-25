import React from 'react';

export default function AdminStatCard({ title, value, icon, extra }) {
  return (
    <div className="bg-[#1c1f26] border border-[#30363d] rounded-2xl p-5 flex flex-col justify-between h-[140px] relative overflow-hidden transition-colors hover:bg-[#20242c]">
      <div className="flex items-start justify-between text-[#8b949e] mb-4">
        <div className="text-[#8b949e]">
          {icon}
        </div>
        {extra && <div className="text-sm font-medium">{extra}</div>}
      </div>
      <div className="mt-auto">
        <div className="text-[32px] font-semibold text-[#f0f6fc] tracking-tight leading-none mb-1">
          {value}
        </div>
        <div className="text-[14px] text-[#8b949e] font-medium">{title}</div>
      </div>
    </div>
  );
}
