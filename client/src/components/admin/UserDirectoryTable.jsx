import React from 'react';

export default function UserDirectoryTable({ 
  users = [], 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter,
  onViewResume,
  onResetPassword,
  onForceExpire,
  onBanUser
}) {
  return (
    <div className="border border-[#30363d] rounded-2xl overflow-hidden">
      <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[16px] font-semibold text-[#f0f6fc]">User directory</h2>
        <div className="flex items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border border-[#30363d] text-[#f0f6fc] text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-[#8b949e] appearance-none"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            <option value="All statuses">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Banned">Banned</option>
          </select>
          <input 
            type="text" 
            placeholder="Search name or email" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border border-[#30363d] text-[#f0f6fc] text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-[#8b949e] w-full sm:w-64 placeholder-[#8b949e]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="py-3 px-5 md:px-6 font-medium text-[#8b949e] w-[25%]">Name</th>
              <th className="py-3 px-5 md:px-6 font-medium text-[#8b949e] w-[25%]">Email</th>
              <th className="py-3 px-5 md:px-6 font-medium text-[#8b949e] w-[15%]">Status</th>
              <th className="py-3 px-5 md:px-6 font-medium text-[#8b949e] w-[15%]">Last active</th>
              <th className="py-3 px-5 md:px-6 font-medium text-[#8b949e] w-[20%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id || i}>
                <td className="py-4 px-5 md:px-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1c1f26] border border-[#30363d] flex items-center justify-center text-[11px] font-bold text-[#f0f6fc] shrink-0">
                    {u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium text-[#f0f6fc]">{u.name}</span>
                </td>
                <td className="py-4 px-5 md:px-6 text-[#8b949e]">{u.email}</td>
                <td className="py-4 px-5 md:px-6">
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[12px] font-medium ${
                    u.status === 'Active' ? 'border-[#30363d] text-[#f0f6fc]' : 'border-[#30363d] text-[#8b949e]'
                  }`}>
                    {u.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] scanly-dot" style={{width: '6px', height: '6px'}}></span>}
                    {u.status}
                  </div>
                </td>
                <td className="py-4 px-5 md:px-6 text-[#f0f6fc]">{u.lastActive}</td>
                <td className="py-4 px-5 md:px-6 flex items-center gap-2 text-[#8b949e]">
                  <button onClick={() => onViewResume(u)} className="p-1 hover:text-[#f0f6fc] transition-colors" aria-label={`View resume for ${u.name}`} title="View resume">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                  <button onClick={() => onResetPassword(u)} className="p-1 hover:text-[#f0f6fc] transition-colors" aria-label={`Reset password for ${u.name}`} title="Reset password">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-4l5.659-5.659A6 6 0 1115 7z" /></svg>
                  </button>
                  <button onClick={() => onForceExpire(u)} className="p-1 hover:text-[#f0f6fc] transition-colors" aria-label={`Force expire session for ${u.name}`} title="Force expire">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                  <button onClick={() => onBanUser(u)} className="p-1 hover:text-[#f0f6fc] transition-colors" aria-label={`Ban ${u.name}`} title="Ban user">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="py-10 text-center text-[#8b949e]">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
