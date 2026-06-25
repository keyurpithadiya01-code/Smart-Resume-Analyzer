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
    <div className="card overflow-hidden !p-0">
      <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232b35]">
        <h2 className="text-[16px] font-semibold text-white">User directory</h2>
        <div className="flex items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1a2238] border border-[#374151] text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-[#00ffa3] appearance-none cursor-pointer hover:border-[#4b5563] transition-colors"
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
            className="input w-full sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#10161d]">
            <tr className="border-b border-[#232b35]">
              <th className="py-4 px-5 md:px-6 font-medium text-[#9ca3af] uppercase tracking-wider text-[11px] w-[25%]">Name</th>
              <th className="py-4 px-5 md:px-6 font-medium text-[#9ca3af] uppercase tracking-wider text-[11px] w-[25%]">Email</th>
              <th className="py-4 px-5 md:px-6 font-medium text-[#9ca3af] uppercase tracking-wider text-[11px] w-[15%]">Status</th>
              <th className="py-4 px-5 md:px-6 font-medium text-[#9ca3af] uppercase tracking-wider text-[11px] w-[15%]">Last active</th>
              <th className="py-4 px-5 md:px-6 font-medium text-[#9ca3af] uppercase tracking-wider text-[11px] w-[20%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232b35]">
            {users.map((u, i) => (
              <tr key={u._id || u.id || i} className="hover:bg-[#161d26] transition-colors group">
                <td className="py-4 px-5 md:px-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00ffa3] to-[#ffb454] flex items-center justify-center text-[11px] font-bold text-[#0b0f14] shadow-lg shadow-[#00ffa3]/20 shrink-0">
                    {u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : u.email.substring(0,2).toUpperCase()}
                  </div>
                  <span className="font-medium text-white group-hover:text-[#00ffa3] transition-colors">{u.name || 'Unknown User'}</span>
                </td>
                <td className="py-4 px-5 md:px-6 text-[#9ca3af]">{u.email}</td>
                <td className="py-4 px-5 md:px-6">
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[12px] font-medium ${
                    u.isBanned || u.status === 'Banned' ? 'bg-[#ff453a]/10 border-[#ff453a]/20 text-[#ff453a]' : 
                    u.status === 'Active' ? 'bg-[#00ffa3]/10 border-[#00ffa3]/20 text-[#00ffa3]' : 
                    'bg-[#9ca3af]/10 border-[#9ca3af]/20 text-[#9ca3af]'
                  }`}>
                    {(u.status === 'Active' && !u.isBanned) && <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] scanly-dot"></span>}
                    {u.isBanned ? 'Banned' : u.status || 'Active'}
                  </div>
                </td>
                <td className="py-4 px-5 md:px-6 text-[#c9cbc5] font-mono text-xs">{u.lastActive || new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-4 px-5 md:px-6 flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onViewResume(u)} className="p-2 hover:bg-[#232b35] hover:text-[#00ffa3] rounded-lg transition-colors text-[#9ca3af]" aria-label="View resume" title="View resume">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                  <button onClick={() => onResetPassword(u)} className="p-2 hover:bg-[#232b35] hover:text-[#ffb454] rounded-lg transition-colors text-[#9ca3af]" aria-label="Reset password" title="Reset password">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-4l5.659-5.659A6 6 0 1115 7z" /></svg>
                  </button>
                  <button onClick={() => onForceExpire(u)} className="p-2 hover:bg-[#232b35] hover:text-[#33ffb5] rounded-lg transition-colors text-[#9ca3af]" aria-label="Force expire session" title="Force expire">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                  <button onClick={() => onBanUser(u)} className={`p-2 rounded-lg transition-colors text-[#9ca3af] ${u.isBanned ? 'hover:bg-[#232b35] hover:text-[#00ffa3]' : 'hover:bg-[#ff453a]/20 hover:text-[#ff453a]'}`} aria-label={u.isBanned ? 'Unban user' : 'Ban user'} title={u.isBanned ? 'Unban user' : 'Ban user'}>
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {u.isBanned 
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      }
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="py-10 text-center text-[#9ca3af]">
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
