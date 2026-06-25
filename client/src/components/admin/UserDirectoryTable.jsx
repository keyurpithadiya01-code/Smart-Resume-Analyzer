import React, { useState, useEffect, useRef } from 'react';

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
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  return (
    <div className="card overflow-hidden !p-0 shadow-[0_8px_32px_rgba(0,0,0,0.4)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border-[#232b35] relative z-10 bg-[#121820]">
      <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232b35]">
        <h2 className="text-[18px] font-semibold text-white">User directory</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Filter Pill */}
          <div className="relative group">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-[#161d26] border border-[#232b35] text-white text-sm font-medium rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:border-[#00ffa3] appearance-none cursor-pointer hover:border-[#374151] transition-all"
            >
              <option value="All statuses">Filter</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Banned">Banned</option>
            </select>
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            </div>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <button className="bg-[#00ffa3] text-[#0b0f14] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#33ffb5] transition-colors flex items-center gap-2">
            Add User
          </button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#10161d]/80 border-b border-[#232b35]">
            <tr>
              <th className="py-4 px-5 md:px-6 font-semibold text-[#9ca3af] uppercase tracking-wider text-[11px] w-[25%]">Name</th>
              <th className="py-4 px-5 md:px-6 font-semibold text-[#9ca3af] uppercase tracking-wider text-[11px] w-[25%]">Email</th>
              <th className="py-4 px-5 md:px-6 font-semibold text-[#9ca3af] uppercase tracking-wider text-[11px] w-[15%]">Status</th>
              <th className="py-4 px-5 md:px-6 font-semibold text-[#9ca3af] uppercase tracking-wider text-[11px] w-[15%]">Last active</th>
              <th className="py-4 px-5 md:px-6 font-semibold text-[#9ca3af] uppercase tracking-wider text-[11px] w-[20%] text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232b35]">
            {users.map((u, i) => (
              <tr key={u._id || u.id || i} className="hover:bg-[#161d26] transition-colors group relative">
                <td className="py-4 px-5 md:px-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1a2238] border border-[#232b35] flex items-center justify-center text-[11px] font-bold text-[#00ffa3] shrink-0">
                    {u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : u.email.substring(0,2).toUpperCase()}
                  </div>
                  <span className="font-medium text-white group-hover:text-[#00ffa3] transition-colors">{u.name || 'Unknown User'}</span>
                </td>
                <td className="py-4 px-5 md:px-6 text-[#9ca3af]">{u.email}</td>
                <td className="py-4 px-5 md:px-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[12px] font-medium tracking-wide ${
                    u.isBanned || u.status === 'Banned' ? 'bg-[#ff453a]/5 border-[#ff453a]/20 text-[#ff453a]' : 
                    u.status === 'Active' ? 'bg-[#00ffa3]/5 border-[#00ffa3]/20 text-[#00ffa3]' : 
                    'bg-[#9ca3af]/10 border-[#9ca3af]/20 text-[#9ca3af]'
                  }`}>
                    {(u.status === 'Active' && !u.isBanned) && <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] shadow-[0_0_8px_rgba(0,255,163,0.6)]"></span>}
                    {u.isBanned ? 'Banned' : u.status || 'Active'}
                  </div>
                </td>
                <td className="py-4 px-5 md:px-6 text-[#c9cbc5] text-sm">{u.lastActive || new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-4 px-5 md:px-6 text-right relative">
                  <button 
                    onClick={(e) => toggleDropdown(u._id || u.id || i, e)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-[#c9cbc5] bg-transparent border border-[#374151] rounded-md hover:border-[#00ffa3] hover:text-white transition-colors focus:outline-none"
                  >
                    Actions Hub
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdownId === (u._id || u.id || i) ? 'rotate-180 text-[#00ffa3]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {openDropdownId === (u._id || u.id || i) && (
                    <div ref={dropdownRef} className="absolute right-6 top-12 w-52 bg-[#161d26] border border-[#232b35] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right text-left">
                      <div className="p-1 flex flex-col">
                        <button onClick={() => { onViewResume(u); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 text-[12px] font-medium text-[#c9cbc5] hover:bg-[#1a2238] hover:text-white rounded-lg transition-colors flex items-center gap-2.5">
                          <svg className="w-3.5 h-3.5 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          View Resume
                        </button>
                        <button onClick={() => { onResetPassword(u); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 text-[12px] font-medium text-[#c9cbc5] hover:bg-[#1a2238] hover:text-white rounded-lg transition-colors flex items-center gap-2.5">
                          <svg className="w-3.5 h-3.5 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          Reset Password
                        </button>
                        <button onClick={() => { onForceExpire(u); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 text-[12px] font-medium text-[#c9cbc5] hover:bg-[#1a2238] hover:text-white rounded-lg transition-colors flex items-center gap-2.5">
                          <svg className="w-3.5 h-3.5 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Force Expire Session
                        </button>
                        <div className="h-px bg-[#232b35] my-1 mx-1"></div>
                        <button onClick={() => { onBanUser(u); setOpenDropdownId(null); }} className={`w-full text-left px-3 py-2 text-[12px] font-medium rounded-lg transition-colors flex items-center gap-2.5 ${u.isBanned ? 'text-[#00ffa3] hover:bg-[#00ffa3]/10' : 'text-[#ff453a] hover:bg-[#ff453a]/10'}`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {u.isBanned ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />}
                          </svg>
                          {u.isBanned ? 'Unban User' : 'Ban User'}
                        </button>
                      </div>
                    </div>
                  )}
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
