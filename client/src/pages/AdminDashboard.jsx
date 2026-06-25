import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalResumesAnalyzed: 0, activeSessions: 'N/A' });
  const [chartData, setChartData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState({ isOpen: false, userId: null, newPassword: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, errorsRes, usersRes] = await Promise.all([
          api.get('/admin/metrics'),
          api.get('/admin/errors'),
          api.get('/admin/users'),
        ]);
        setMetrics(metricsRes.data);
        setChartData(errorsRes.data.chartData);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleBan = async (id) => {
    try {
      const res = await api.post(`/admin/users/${id}/ban`);
      setUsers(users.map(u => u._id === id ? { ...u, isBanned: res.data.isBanned } : u));
      alert(res.data.message);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const openResetModal = (id) => setResetModal({ isOpen: true, userId: id, newPassword: '' });
  const closeResetModal = () => setResetModal({ isOpen: false, userId: null, newPassword: '' });

  const confirmResetPassword = async () => {
    const { userId, newPassword } = resetModal;
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
      alert(res.data.message);
      closeResetModal();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleForceExpire = async (id) => {
    if (!window.confirm("Are you sure you want to force expire this user's sessions?")) return;
    try {
      const res = await api.post(`/admin/users/${id}/force-expire`);
      alert(res.data.message);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleViewResume = async (id) => {
    try {
      const res = await api.get(`/admin/users/${id}/resume`, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<iframe width='100%' height='100%' src='${fileURL}'></iframe>`
        );
      } else {
        alert('Please allow popups for this site to view the resume.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        alert('No resume found for this user.');
      } else {
        alert('Error fetching resume.');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-[#f0f0ec]">Loading Admin Dashboard...</div>;
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050B14] font-sans text-slate-300 pb-16">
      {/* Unique Header */}
      <div className="bg-[#0a1120] border-b border-slate-800/60 sticky top-0 z-40 shadow-2xl shadow-cyan-900/5">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">System Administration</h1>
              <p className="text-sm text-cyan-400/80 font-medium tracking-wide">CENTRAL COMMAND PORTAL</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700/50 flex items-center gap-3 backdrop-blur-md">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono text-slate-300 tracking-wider">NETWORK SECURE</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 pt-10">
        {/* Password Reset Modal */}
        {resetModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050B14]/90 backdrop-blur-sm p-4">
            <div className="bg-[#0a1120] border border-cyan-500/30 rounded-2xl max-w-md w-full animate-fade-in shadow-[0_0_50px_-12px_rgba(6,182,212,0.25)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600"></div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Reset User Password</h2>
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">Enter the new password for this user. A secure email notification will be dispatched automatically.</p>
                <input
                  type="text"
                  className="w-full bg-[#050B14] border border-slate-700 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 mb-8 transition-all"
                  placeholder="New password (min 6 chars)"
                  value={resetModal.newPassword}
                  onChange={(e) => setResetModal({ ...resetModal, newPassword: e.target.value })}
                />
                <div className="flex gap-4 justify-end">
                  <button 
                    onClick={closeResetModal} 
                    className="px-6 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmResetPassword} 
                    className="px-6 py-2.5 rounded-xl font-medium bg-cyan-500 text-[#050B14] hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.6)] transform hover:-translate-y-0.5"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Unique Metric Cards */}
            <div className="bg-[#0a1120] border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-cyan-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium tracking-wide uppercase mb-2">Total Users</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-bold text-white tracking-tight">{metrics.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0a1120] border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium tracking-wide uppercase mb-2">Resumes Analyzed</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-bold text-white tracking-tight">{metrics.totalResumesAnalyzed}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0a1120] border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium tracking-wide uppercase mb-2">Active Sessions</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-bold text-white tracking-tight">{metrics.activeSessions}</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* System Error Rate */}
        <Reveal delay={80}>
          {chartData.length > 0 ? (
            <div className="bg-[#0a1120] border border-slate-800/80 rounded-2xl p-6 shadow-xl mb-10">
              <h3 className="text-lg font-bold text-white mb-6">System Error Rate</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: 12, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ color: '#ef4444' }}
                    />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 8, fill: '#ef4444', stroke: '#0f172a', strokeWidth: 2 }} dot={{ r: 4, fill: '#0f172a', stroke: '#ef4444', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-emerald-900/20 to-[#0a1120] border border-emerald-500/20 rounded-2xl p-6 mb-10 shadow-xl flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">System is Healthy</h3>
                <p className="text-emerald-400/80 mt-1">No errors logged recently. All services operational.</p>
              </div>
            </div>
          )}
        </Reveal>

        {/* Unique User Directory */}
        <Reveal delay={120}>
          <div className="bg-[#0a1120] border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-6 md:p-8 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#0a1120] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mt-32 -mr-32"></div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">User Directory</h2>
                <p className="text-sm text-slate-400 mt-1">Manage accounts, monitor roles, and enforce security policies.</p>
              </div>
              <div className="relative w-full sm:w-80 relative z-10">
                <input 
                  type="text" 
                  placeholder="Search by email or role..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#050B14] border border-slate-700/80 text-sm rounded-xl pl-12 pr-5 py-3.5 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 text-white w-full transition-all shadow-inner"
                />
                <svg className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="overflow-x-auto flex-1 bg-[#050B14]/30">
              <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
                <thead className="bg-[#0a1120]/80 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                  <tr className="border-b border-slate-800/80">
                    <th className="py-5 pl-8 pr-4 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Email Account</th>
                    <th className="py-5 px-4 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Date Joined</th>
                    <th className="py-5 px-4 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Account Status</th>
                    <th className="py-5 px-4 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">System Role</th>
                    <th className="py-5 pr-8 pl-4 font-semibold text-slate-400 uppercase tracking-wider text-[11px] text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-6 pl-8 pr-4 font-medium text-slate-200">{u.email}</td>
                      <td className="py-6 px-4 text-slate-500 font-mono text-[13px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-6 px-4">
                        {u.isBanned ? (
                          <span className="px-3 py-1 text-[11px] font-semibold tracking-wide rounded-md bg-red-500/10 text-red-400 border border-red-500/20">BANNED</span>
                        ) : (
                          <span className="px-3 py-1 text-[11px] font-semibold tracking-wide rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>
                        )}
                      </td>
                      <td className="py-6 px-4 capitalize text-slate-400">{u.role}</td>
                      <td className="py-6 pr-8 pl-4 flex flex-wrap gap-3 justify-end items-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewResume(u._id)}
                          className="px-4 py-2 rounded-lg border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 bg-transparent hover:bg-cyan-500/10 transition-all duration-300 font-medium text-[13px]"
                        >
                          View Resume
                        </button>
                        <button
                          onClick={() => openResetModal(u._id)}
                          className="px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500/50 text-slate-300 hover:text-blue-400 bg-transparent hover:bg-blue-500/10 transition-all duration-300 font-medium text-[13px]"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => handleForceExpire(u._id)}
                          className="px-4 py-2 rounded-lg border border-slate-700 hover:border-orange-500/50 text-slate-300 hover:text-orange-400 bg-transparent hover:bg-orange-500/10 transition-all duration-300 font-medium text-[13px]"
                        >
                          Force Expire
                        </button>
                        <button
                          onClick={() => handleBan(u._id)}
                          className={`px-4 py-2 rounded-lg border transition-all duration-300 font-medium text-[13px] bg-transparent ${
                            u.isBanned 
                              ? 'border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10' 
                              : 'border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-400 hover:bg-red-500/10'
                          }`}
                        >
                          {u.isBanned ? 'Unban User' : 'Ban User'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-20 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-4">
                          <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          <p className="text-lg font-medium">{searchQuery ? 'No users found matching your query.' : 'No users found in the system.'}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
