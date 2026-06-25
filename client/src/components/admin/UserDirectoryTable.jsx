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
        <div className="flex flex-col sm:flex-row items-center gap-4">
          
          {/* Filter Pill */}
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af] group-hover:text-[#00ffa3] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-[#161d26] border border-[#232b35] text-white text-sm font-medium rounded-full pl-10 pr-8 py-2.5 focus:outline-none focus:border-[#00ffa3] appearance-none cursor-pointer hover:border-[#374151] shadow-sm hover:shadow-[0_0_15px_rgba(0,255,163,0.1)] transition-all"
              style={{ minWidth: '140px' }}
            >
              <option value="All statuses">Filters</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Banned">Banned</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Search Pill */}
          <div className="relative group w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161d26] border border-[#232b35] text-white text-sm font-medium rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:border-[#00ffa3] placeholder:text-[#6b7785] hover:border-[#374151] shadow-sm hover:shadow-[0_0_15px_rgba(0,255,163,0.1)] transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b7785] group-hover:text-[#00ffa3] transition-colors pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

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
                  <button onClick={() => onViewResume(u)} className="px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-widest text-[#00ffa3] bg-[#00ffa3]/5 border border-[#00ffa3]/30 rounded-full hover:bg-[#00ffa3]/10 hover:shadow-[0_0_15px_rgba(0,255,163,0.15)] transition-all">
                    View Resume
                  </button>
                  <button onClick={() => onResetPassword(u)} className="px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-widest text-[#ffb454] bg-[#ffb454]/5 border border-[#ffb454]/30 rounded-full hover:bg-[#ffb454]/10 hover:shadow-[0_0_15px_rgba(255,180,84,0.15)] transition-all">
                    Reset Pwd
                  </button>
                  <button onClick={() => onForceExpire(u)} className="px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-widest text-[#33ffb5] bg-[#33ffb5]/5 border border-[#33ffb5]/30 rounded-full hover:bg-[#33ffb5]/10 hover:shadow-[0_0_15px_rgba(51,255,181,0.15)] transition-all">
                    Expire
                  </button>
                  <button onClick={() => onBanUser(u)} className={`px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-widest rounded-full transition-all border ${u.isBanned ? 'text-[#00ffa3] bg-[#00ffa3]/5 border-[#00ffa3]/30 hover:bg-[#00ffa3]/10 hover:shadow-[0_0_15px_rgba(0,255,163,0.15)]' : 'text-[#ff453a] bg-[#ff453a]/5 border-[#ff453a]/30 hover:bg-[#ff453a]/10 hover:shadow-[0_0_15px_rgba(255,69,58,0.15)]'}`}>
                    {u.isBanned ? 'Unban' : 'Ban User'}
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
