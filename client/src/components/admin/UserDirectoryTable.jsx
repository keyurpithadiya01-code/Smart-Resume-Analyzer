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
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#161d26] border border-[#232b35] text-[#c9cbc5] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00ffa3] appearance-none cursor-pointer hover:border-[#374151] transition-colors"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none', minWidth: '140px' }}
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
            className="input w-full sm:w-72"
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
                <td className="py-5 px-5 md:px-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1a2238] border border-[#232b35] flex items-center justify-center text-[12px] font-bold text-[#00ffa3] shrink-0">
                    {u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : u.email.substring(0,2).toUpperCase()}
                  </div>
                  <span className="font-medium text-white group-hover:text-[#00ffa3] transition-colors">{u.name || 'Unknown User'}</span>
                </td>
                <td className="py-5 px-5 md:px-6 text-[#9ca3af]">{u.email}</td>
                <td className="py-5 px-5 md:px-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-medium tracking-wide ${
                    u.isBanned || u.status === 'Banned' ? 'bg-[#ff453a]/10 border-[#ff453a]/20 text-[#ff453a]' : 
                    u.status === 'Active' ? 'bg-[#00ffa3]/5 border-[#00ffa3]/20 text-[#00ffa3]' : 
                    'bg-[#9ca3af]/10 border-[#9ca3af]/20 text-[#9ca3af]'
                  }`}>
                    {(u.status === 'Active' && !u.isBanned) && <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-blink-cyan shadow-[0_0_8px_rgba(0,255,163,0.6)]"></span>}
                    {u.isBanned ? 'Banned' : u.status || 'Active'}
                  </div>
                </td>
                <td className="py-5 px-5 md:px-6 text-[#c9cbc5] font-mono text-xs">{u.lastActive || new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-5 px-5 md:px-6 flex items-center justify-end gap-2 flex-wrap">
                  <button onClick={() => onViewResume(u)} className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[#9ca3af] bg-[#1a2238] border border-[#232b35] rounded-lg hover:border-[#00ffa3]/50 hover:text-[#00ffa3] transition-colors">
                    View Resume
                  </button>
                  <button onClick={() => onResetPassword(u)} className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[#9ca3af] bg-[#1a2238] border border-[#232b35] rounded-lg hover:border-[#ffb454]/50 hover:text-[#ffb454] transition-colors">
                    Reset Password
                  </button>
                  <button onClick={() => onForceExpire(u)} className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[#9ca3af] bg-[#1a2238] border border-[#232b35] rounded-lg hover:border-[#33ffb5]/50 hover:text-[#33ffb5] transition-colors">
                    Expire Session
                  </button>
                  <button onClick={() => onBanUser(u)} className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider bg-[#1a2238] border border-[#232b35] rounded-lg transition-colors ${u.isBanned ? 'text-[#9ca3af] hover:border-[#00ffa3]/50 hover:text-[#00ffa3]' : 'text-[#ff453a] hover:border-[#ff453a]/50 hover:bg-[#ff453a]/10'}`}>
                    {u.isBanned ? 'Unban User' : 'Ban User'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="py-12 text-center text-[#9ca3af]">
                  No users found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
